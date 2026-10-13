import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { Webhook } from "svix";

initializeApp();

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
const resendApiKey = defineSecret("RESEND_API_KEY");
const resendWebhookSecret = defineSecret("RESEND_WEBHOOK_SECRET");

type SiteRole = "resident" | "board" | "administrator";
type VoteSelection = "yes" | "no" | "abstain";

async function callerRole(uid: string, email?: string): Promise<SiteRole | null> {
  const profile = await db.doc(`userProfiles/${uid}`).get();
  if (profile.exists && profile.get("active") === true) return profile.get("role") as SiteRole;
  if (!email) return null;
  const legacy = await db.doc(`boardUsers/${email.toLowerCase()}`).get();
  if (!legacy.exists || legacy.get("active") !== true) return null;
  return legacy.get("siteRole") === "Administrator" ? "administrator" : "board";
}

async function requireRole(
  request: { auth?: { uid: string; token: Record<string, unknown> } },
  allowed: SiteRole[]
) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  const email = typeof request.auth.token.email === "string" ? request.auth.token.email : undefined;
  const role = await callerRole(request.auth.uid, email);
  if (!role || !allowed.includes(role)) throw new HttpsError("permission-denied", "You do not have permission for this action.");
  return { uid: request.auth.uid, email: email ?? "", role };
}

async function audit(action: string, actor: { uid: string; email: string }, details: Record<string, unknown>) {
  await db.collection("auditLogs").add({ action, actorUid: actor.uid, actorEmail: actor.email, details, createdAt: FieldValue.serverTimestamp() });
}

export const reviewAccessRequest = onCall(async (request) => {
  const actor = await requireRole(request, ["board", "administrator"]);
  const uid = String(request.data?.uid ?? "");
  const decision = String(request.data?.decision ?? "");
  const note = String(request.data?.note ?? "").slice(0, 1000);
  if (!uid || !["approved", "rejected"].includes(decision)) throw new HttpsError("invalid-argument", "A valid request and decision are required.");

  const requestRef = db.doc(`accessRequests/${uid}`);
  const accessSnapshot = await requestRef.get();
  if (!accessSnapshot.exists || accessSnapshot.get("status") !== "pending") throw new HttpsError("failed-precondition", "This request is not pending.");

  const account = await auth.getUser(uid);
  if (!account.emailVerified) throw new HttpsError("failed-precondition", "The applicant must verify their email before approval.");
  const data = accessSnapshot.data()!;
  const batch = db.batch();
  batch.update(requestRef, { status: decision, reviewNote: note, reviewedByUid: actor.uid, reviewedByEmail: actor.email, reviewedAt: FieldValue.serverTimestamp() });
  if (decision === "approved") {
    batch.set(db.doc(`userProfiles/${uid}`), {
      uid,
      email: account.email?.toLowerCase() ?? data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      propertyAddress: data.propertyAddress,
      residencyType: data.residencyType,
      role: "resident",
      active: true,
      approvedByUid: actor.uid,
      approvedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
  await batch.commit();
  await audit(`access.${decision}`, actor, { uid, email: data.email });
  return { ok: true };
});

export const setUserRole = onCall(async (request) => {
  const actor = await requireRole(request, ["administrator"]);
  const email = String(request.data?.email ?? "").trim().toLowerCase();
  const role = String(request.data?.role ?? "") as SiteRole;
  const active = request.data?.active !== false;
  const boardTitle = String(request.data?.boardTitle ?? "").trim();
  if (!email || !["resident", "board", "administrator"].includes(role)) throw new HttpsError("invalid-argument", "Email and role are required.");
  const account = await auth.getUserByEmail(email);
  const ref = db.doc(`userProfiles/${account.uid}`);
  const existing = await ref.get();
  const names = (account.displayName ?? email.split("@")[0]).split(/\s+/);
  await ref.set({
    uid: account.uid,
    email,
    firstName: existing.get("firstName") ?? names[0] ?? "",
    lastName: existing.get("lastName") ?? names.slice(1).join(" "),
    propertyAddress: existing.get("propertyAddress") ?? "",
    role,
    active,
    boardTitle: role === "resident" ? FieldValue.delete() : boardTitle,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  await audit("user.role_changed", actor, { uid: account.uid, email, role, active, boardTitle });
  return { ok: true, uid: account.uid };
});

export const initiateVote = onCall(async (request) => {
  const actor = await requireRole(request, ["board", "administrator"]);
  const proposalId = String(request.data?.proposalId ?? "");
  const motion = String(request.data?.motion ?? "").trim();
  const deadlineText = String(request.data?.deadline ?? "");
  const attachmentPaths = Array.isArray(request.data?.attachmentPaths) ? request.data.attachmentPaths.map(String) : [];
  const deadline = new Date(deadlineText);
  if (!proposalId || !motion || Number.isNaN(deadline.valueOf()) || deadline <= new Date()) throw new HttpsError("invalid-argument", "Proposal, motion, and a future deadline are required.");
  const proposal = await db.doc(`proposals/${proposalId}`).get();
  if (!proposal.exists) throw new HttpsError("not-found", "Proposal not found.");

  const eligibleSnapshot = await db.collection("userProfiles").where("active", "==", true).get();
  const eligibleUids = eligibleSnapshot.docs.filter((item) => ["board", "administrator"].includes(item.get("role"))).map((item) => item.id);
  if (!eligibleUids.includes(actor.uid)) eligibleUids.push(actor.uid);
  const voteRef = db.collection("votes").doc();
  const settings = await db.doc("siteSettings/voting").get();
  await voteRef.set({
    proposalId,
    motion,
    deadline: Timestamp.fromDate(deadline),
    attachmentPaths,
    eligibleUids,
    eligibleCount: eligibleUids.length,
    quorumRequired: Math.ceil((eligibleUids.length * 2) / 3),
    status: "open",
    result: "pending",
    ruleConfirmed: settings.exists && settings.get("ruleConfirmed") === true,
    openedByUid: actor.uid,
    openedByEmail: actor.email,
    openedAt: FieldValue.serverTimestamp()
  });
  await db.doc(`proposals/${proposalId}`).update({ status: "voting", voteId: voteRef.id, updatedAt: FieldValue.serverTimestamp() });
  await audit("vote.opened", actor, { voteId: voteRef.id, proposalId, eligibleCount: eligibleUids.length });
  return { ok: true, voteId: voteRef.id };
});

export const castVote = onCall(async (request) => {
  const actor = await requireRole(request, ["board", "administrator"]);
  const voteId = String(request.data?.voteId ?? "");
  const selection = String(request.data?.selection ?? "") as VoteSelection;
  if (!voteId || !["yes", "no", "abstain"].includes(selection)) throw new HttpsError("invalid-argument", "Vote and selection are required.");
  const voteRef = db.doc(`votes/${voteId}`);
  await db.runTransaction(async (transaction) => {
    const vote = await transaction.get(voteRef);
    if (!vote.exists || vote.get("status") !== "open") throw new HttpsError("failed-precondition", "Voting is closed.");
    if ((vote.get("deadline") as Timestamp).toMillis() <= Date.now()) throw new HttpsError("deadline-exceeded", "The voting deadline has passed.");
    if (!(vote.get("eligibleUids") as string[]).includes(actor.uid)) throw new HttpsError("permission-denied", "You are not eligible for this vote.");
    const ballotRef = voteRef.collection("ballots").doc(actor.uid);
    const previous = await transaction.get(ballotRef);
    transaction.set(ballotRef, { uid: actor.uid, selection, updatedAt: FieldValue.serverTimestamp() });
    transaction.set(voteRef.collection("history").doc(), { uid: actor.uid, email: actor.email, previousSelection: previous.exists ? previous.get("selection") : null, selection, changedAt: FieldValue.serverTimestamp() });
  });
  await audit("vote.cast", actor, { voteId, selection });
  return { ok: true };
});

async function calculateAndCloseVote(voteRef: FirebaseFirestore.DocumentReference, closedByUid: string) {
  const [vote, ballots, settings] = await Promise.all([voteRef.get(), voteRef.collection("ballots").get(), db.doc("siteSettings/voting").get()]);
  if (!vote.exists) throw new HttpsError("not-found", "Vote not found.");
  const eligibleCount = Number(vote.get("eligibleCount") ?? 0);
  const counts = { yes: 0, no: 0, abstain: 0 };
  ballots.docs.forEach((item) => { const value = item.get("selection") as VoteSelection; if (value in counts) counts[value] += 1; });
  const quorumRequired = Math.ceil((eligibleCount * 2) / 3);
  const participation = counts.yes + counts.no + counts.abstain;
  let result = "rule-confirmation-required";
  if (settings.exists && settings.get("ruleConfirmed") === true) {
    if (participation < quorumRequired) result = "no-quorum";
    else {
      const basis = settings.get("majorityBasis");
      const abstentions = settings.get("abstentionTreatment");
      const denominator = basis === "all_eligible" ? eligibleCount : counts.yes + counts.no + (abstentions === "counts_as_no" ? counts.abstain : 0);
      result = counts.yes > denominator / 2 ? "passed" : "failed";
    }
  }
  await voteRef.update({ status: "closed", result, counts, quorumRequired, closedByUid, closedAt: FieldValue.serverTimestamp() });
  return { result, counts, quorumRequired };
}

export const closeVote = onCall(async (request) => {
  const actor = await requireRole(request, ["board", "administrator"]);
  const voteId = String(request.data?.voteId ?? "");
  const voteRef = db.doc(`votes/${voteId}`);
  const vote = await voteRef.get();
  if (!vote.exists) throw new HttpsError("not-found", "Vote not found.");
  if ((vote.get("deadline") as Timestamp).toMillis() > Date.now()) throw new HttpsError("failed-precondition", "This vote remains open until its deadline.");
  const result = await calculateAndCloseVote(voteRef, actor.uid);
  await audit("vote.closed", actor, { voteId, result: result.result, counts: result.counts });
  return { ok: true, ...result };
});

export const closeExpiredVotes = onSchedule("every 5 minutes", async () => {
  const expired = await db.collection("votes").where("status", "==", "open").where("deadline", "<=", Timestamp.now()).get();
  await Promise.all(expired.docs.map((item) => calculateAndCloseVote(item.ref, "system")));
});

export const updateVotingRules = onCall(async (request) => {
  const actor = await requireRole(request, ["administrator"]);
  const majorityBasis = String(request.data?.majorityBasis ?? "unconfirmed");
  const abstentionTreatment = String(request.data?.abstentionTreatment ?? "unconfirmed");
  const confirmed = request.data?.ruleConfirmed === true;
  if (!["unconfirmed", "all_eligible", "votes_cast"].includes(majorityBasis)
    || !["unconfirmed", "excluded", "counts_as_no"].includes(abstentionTreatment)) throw new HttpsError("invalid-argument", "Invalid voting settings.");
  await db.doc("siteSettings/voting").set({ quorumNumerator: 2, quorumDenominator: 3, majorityBasis, abstentionTreatment, ruleConfirmed: confirmed, updatedByUid: actor.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await audit("voting.settings_updated", actor, { majorityBasis, abstentionTreatment, confirmed });
  return { ok: true };
});

export const sendCommunication = onCall({ secrets: [resendApiKey] }, async (request) => {
  const actor = await requireRole(request, ["board", "administrator"]);
  const recipientUids = Array.isArray(request.data?.recipientUids) ? request.data.recipientUids.map(String) : [];
  const subject = String(request.data?.subject ?? "").trim();
  const message = String(request.data?.message ?? "").trim();
  const attachmentPaths = Array.isArray(request.data?.attachmentPaths) ? request.data.attachmentPaths.map(String) : [];
  if (!recipientUids.length || !subject || !message) throw new HttpsError("invalid-argument", "Recipients, subject, and message are required.");
  const recipients = await Promise.all(recipientUids.map((uid: string) => db.doc(`userProfiles/${uid}`).get()));
  const to = recipients.filter((item) => item.exists && item.get("active") === true && item.get("role") === "resident").map((item) => String(item.get("email")));
  if (!to.length) throw new HttpsError("failed-precondition", "No approved resident recipients were selected.");
  const communicationRef = db.collection("communications").doc();
  await communicationRef.set({ direction: "outbound", from: "board@hickorycreekbrandon.com", to, subject, message, attachmentPaths, status: "sending", sentByUid: actor.uid, sentByEmail: actor.email, createdAt: FieldValue.serverTimestamp() });
  const attachments = await Promise.all(attachmentPaths.map(async (path: string) => {
    if (!path.startsWith(`communication-attachments/${actor.uid}-`)) throw new HttpsError("permission-denied", "Invalid attachment path.");
    const [buffer] = await storage.bucket().file(path).download();
    return { filename: path.split("/").pop() ?? "attachment", content: buffer.toString("base64") };
  }));
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey.value()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Hickory Creek Board <board@hickorycreekbrandon.com>",
      to: ["board@hickorycreekbrandon.com"],
      bcc: to,
      subject,
      text: message,
      reply_to: "board@hickorycreekbrandon.com",
      attachments
    })
  });
  const result = await response.json() as { id?: string; message?: string };
  await communicationRef.update({ providerId: result.id ?? null, status: response.ok ? "sent" : "failed", providerMessage: result.message ?? null, sentAt: FieldValue.serverTimestamp() });
  if (!response.ok) throw new HttpsError("internal", "The provider did not accept this message.");
  await audit("communication.sent", actor, { communicationId: communicationRef.id, recipientCount: to.length });
  return { ok: true, id: communicationRef.id };
});

export const resendWebhook = onRequest({ secrets: [resendWebhookSecret] }, async (request, response) => {
  try {
    const payload = new Webhook(resendWebhookSecret.value()).verify(request.rawBody, {
      "svix-id": String(request.header("svix-id") ?? ""),
      "svix-timestamp": String(request.header("svix-timestamp") ?? ""),
      "svix-signature": String(request.header("svix-signature") ?? "")
    }) as { type: string; data: Record<string, unknown> };
    if (payload.type === "email.received") {
      await db.collection("communications").add({ direction: "inbound", ...payload.data, status: "received", createdAt: FieldValue.serverTimestamp() });
    } else if (payload.type.startsWith("email.")) {
      const providerId = String(payload.data.email_id ?? "");
      const matches = await db.collection("communications").where("providerId", "==", providerId).limit(1).get();
      if (!matches.empty) await matches.docs[0].ref.update({ status: payload.type.replace("email.", ""), lastProviderEventAt: FieldValue.serverTimestamp() });
    }
    response.status(200).send("ok");
  } catch {
    response.status(400).send("invalid signature");
  }
});
