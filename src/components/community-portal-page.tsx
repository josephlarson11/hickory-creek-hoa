"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getBlob, ref, uploadBytes } from "firebase/storage";
import { Archive, Check, Download, FileText, LogOut, Mail, ShieldCheck, Upload, Vote, X } from "lucide-react";
import { getCommunityProfile, signOutCommunityMember, UserProfile } from "@/lib/community-auth";
import { auth, db, functions, storage } from "@/lib/firebase";

type AccessRequest = { id: string; uid: string; firstName: string; lastName: string; propertyAddress: string; residencyType: string; email: string; phone?: string; status: string; createdAt?: Timestamp };
type AssociationDocument = { id: string; title: string; category: string; visibility: "resident" | "board"; active: boolean; currentPath: string; version: number; description?: string; updatedAt?: Timestamp };
type Proposal = { id: string; title: string; details: string; status: string; submittedByUid: string; submittedByName: string; attachmentPaths?: string[]; createdAt?: Timestamp; voteId?: string };
type VoteRecord = { id: string; proposalId: string; motion: string; status: string; result: string; deadline?: Timestamp; attachmentPaths?: string[]; counts?: { yes: number; no: number; abstain: number }; quorumRequired: number; eligibleCount: number };
type Communication = { id: string; direction: string; from?: string; to?: string[]; subject?: string; message?: string; status?: string; attachmentPaths?: string[]; createdAt?: Timestamp };
type Announcement = { id: string; title: string; content: string; published?: boolean; createdAt?: Timestamp };

type CommunityEvent = { id: string; title: string; date: string; time?: string; location?: string; public?: boolean };
type GalleryItem = { id: string; title: string; storagePath?: string; src?: string; public?: boolean };
type Tab = "home" | "community" | "documents" | "proposals" | "access" | "votes" | "communications" | "administration";

export default function CommunityPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<AssociationDocument[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [legacyAnnouncements, setLegacyAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const board = profile?.role === "board" || profile?.role === "administrator";
  const administrator = profile?.role === "administrator";

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const currentProfile = await getCommunityProfile(currentUser);
      setProfile(currentProfile);
      setLoading(false);
      if (!currentUser) router.replace("/sign-in");
    });
  }, [router]);

  useEffect(() => {
    if (!db || !user || !profile?.active) return;
    const unsubs = [
      onSnapshot(query(collection(db, "associationDocuments"), orderBy("updatedAt", "desc")), (snapshot) => setDocuments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as AssociationDocument)))),
      onSnapshot(query(collection(db, "proposals"), orderBy("createdAt", "desc")), (snapshot) => setProposals(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Proposal)))),
      onSnapshot(board
        ? query(collection(db, "announcements"), orderBy("createdAt", "desc"))
        : query(collection(db, "announcements"), where("published", "==", true), orderBy("createdAt", "desc")),
      (snapshot) => setAnnouncements(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Announcement))))
    ];
    unsubs.push(onSnapshot(board ? collection(db, "publicAnnouncements") : query(collection(db, "publicAnnouncements"), where("published", "==", true)), (snapshot) => setLegacyAnnouncements(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Announcement)))));
    unsubs.push(onSnapshot(board ? collection(db, "calendarEvents") : query(collection(db, "calendarEvents"), where("public", "==", true)), (snapshot) => setEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CommunityEvent)))));
    unsubs.push(onSnapshot(board ? collection(db, "galleryItems") : query(collection(db, "galleryItems"), where("public", "==", true)), (snapshot) => setGallery(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as GalleryItem)))));
    if (board) {
      unsubs.push(onSnapshot(query(collection(db, "accessRequests"), where("status", "==", "pending")), (snapshot) => setAccessRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as AccessRequest)))));
      unsubs.push(onSnapshot(query(collection(db, "votes"), orderBy("openedAt", "desc")), (snapshot) => setVotes(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as VoteRecord)))));
      unsubs.push(onSnapshot(query(collection(db, "communications"), orderBy("createdAt", "desc")), (snapshot) => setCommunications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Communication)))));
      unsubs.push(onSnapshot(query(collection(db, "userProfiles"), where("role", "==", "resident"), where("active", "==", true)), (snapshot) => setResidents(snapshot.docs.map((item) => item.data() as UserProfile))));
    }
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, [board, profile?.active, user]);

  const visibleDocuments = useMemo(() => documents.filter((item) => item.active && (board || item.visibility === "resident")), [board, documents]);
  const visibleProposals = useMemo(() => board ? proposals : proposals.filter((item) => item.submittedByUid === user?.uid), [board, proposals, user?.uid]);
  const visibleAnnouncements = useMemo(() => {
    const ids = new Set(announcements.map((item) => item.id));
    return [...announcements, ...legacyAnnouncements.filter((item) => !ids.has(item.id))];
  }, [announcements, legacyAnnouncements]);

  async function logout() {
    await signOutCommunityMember();
    router.push("/");
  }

  if (loading) return <div className="section min-h-[50vh]"><p>Loading your account...</p></div>;
  if (!user || !profile?.active) return <div className="section min-h-[50vh]"><h1 className="font-serif text-3xl font-bold text-burgundy">Access pending</h1><p className="mt-4">Your account has not been approved. A board member must complete the review.</p></div>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "Overview" },
    { id: "community", label: "Community" },
    { id: "documents", label: "Documents" },
    { id: "proposals", label: "Proposals" },
    ...(board ? [{ id: "access" as Tab, label: "Access requests" }, { id: "votes" as Tab, label: "Board votes" }, { id: "communications" as Tab, label: "Communications" }] : []),
    ...(administrator ? [{ id: "administration" as Tab, label: "Administration" }] : [])
  ];

  return (
    <section className="section min-h-[70vh]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone pb-5">
        <div><p className="eyebrow">Private Community Portal</p><h1 className="mt-2 font-serif text-3xl font-bold text-burgundy">Welcome, {profile.firstName}</h1><p className="mt-1 capitalize">{profile.role}{profile.boardTitle ? ` - ${profile.boardTitle}` : ""}</p></div>
        <button className="btn-secondary" type="button" onClick={logout}><LogOut size={18} aria-hidden="true" />Sign out</button>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-stone" role="tablist" aria-label="Portal sections">
        {tabs.map((item) => <button key={item.id} className={`whitespace-nowrap border-b-4 px-3 py-3 text-sm font-bold ${tab === item.id ? "border-burgundy text-burgundy" : "border-transparent"}`} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </div>
      {message ? <p role="status" className="mt-5 rounded bg-cream p-3 font-bold">{message}</p> : null}

      {tab === "home" ? <Overview announcements={visibleAnnouncements} documents={visibleDocuments} proposals={visibleProposals} board={board} pending={accessRequests.length} votes={votes} profile={profile} setMessage={setMessage} /> : null}
      {tab === "community" ? <CommunityPanel events={events} gallery={gallery} board={board} setMessage={setMessage} /> : null}
      {tab === "documents" ? <DocumentsPanel items={visibleDocuments} board={board} profile={profile} setMessage={setMessage} /> : null}
      {tab === "proposals" ? <ProposalsPanel items={visibleProposals} user={user} profile={profile} setMessage={setMessage} /> : null}
      {tab === "access" && board ? <AccessPanel items={accessRequests} setMessage={setMessage} /> : null}
      {tab === "votes" && board ? <VotesPanel votes={votes} proposals={proposals} user={user} setMessage={setMessage} /> : null}
      {tab === "communications" && board ? <CommunicationsPanel residents={residents} items={communications} user={user} setMessage={setMessage} /> : null}
      {tab === "administration" && administrator ? <AdministrationPanel setMessage={setMessage} /> : null}
    </section>
  );
}

function Overview({ announcements, documents, proposals, board, pending, votes, profile, setMessage }: { announcements: Announcement[]; documents: AssociationDocument[]; proposals: Proposal[]; board: boolean; pending: number; votes: VoteRecord[]; profile: UserProfile; setMessage: (value: string) => void }) {
  async function postAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!db) return;
    const form = event.currentTarget; const data = new FormData(form);
    await addDoc(collection(db, "announcements"), { title: String(data.get("title")), content: String(data.get("content")), published: true, authorUid: profile.uid, authorName: `${profile.firstName} ${profile.lastName}`, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    form.reset(); setMessage("Announcement posted to approved residents.");
  }
  return <div className="mt-8 grid gap-6 lg:grid-cols-3">
    <Panel title="Announcements">{board ? <form onSubmit={postAnnouncement} className="mb-5 grid gap-3 border-b border-stone pb-5"><Input name="title" label="New announcement title" /><label><span className="label">Message</span><textarea className="field mt-1" name="content" required /></label><button className="btn-primary w-fit" type="submit">Post</button></form> : null}{announcements.filter((item) => item.published !== false).slice(0, 4).map((item) => <div key={item.id} className="border-b border-stone pb-3 last:border-0"><p className="font-bold">{item.title}</p><p className="mt-1 text-sm leading-6">{item.content}</p>{board ? <button className="mt-2 text-xs font-bold text-burgundy underline" type="button" onClick={() => db && updateDoc(doc(db, "announcements", item.id), { published: false, archivedAt: serverTimestamp(), updatedAt: serverTimestamp() })}>Archive</button> : null}</div>)}{!announcements.length ? <p>No current announcements.</p> : null}</Panel>
    <Panel title="Recent documents"><p>{documents.length} available document{documents.length === 1 ? "" : "s"}.</p></Panel>
    <Panel title={board ? "Board work" : "Your proposals"}><p>{proposals.length} proposal{proposals.length === 1 ? "" : "s"}.</p>{board ? <p className="mt-2">{pending} pending access request{pending === 1 ? "" : "s"}; {votes.filter((item) => item.status === "open").length} open vote{votes.filter((item) => item.status === "open").length === 1 ? "" : "s"}.</p> : null}</Panel>
  </div>;
}

function CommunityPanel({ events, gallery, board, setMessage }: { events: CommunityEvent[]; gallery: GalleryItem[]; board: boolean; setMessage: (value: string) => void }) {
  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!db) return;
    const form = event.currentTarget; const data = new FormData(form);
    await addDoc(collection(db, "calendarEvents"), { title: String(data.get("title")), date: String(data.get("date")), time: String(data.get("time") ?? ""), location: String(data.get("location") ?? ""), public: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    form.reset(); setMessage("Community event posted to approved residents.");
  }

  async function addPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!db || !storage) { setMessage("Firebase Storage is not enabled yet."); return; }
    const form = event.currentTarget; const data = new FormData(form); const file = data.get("file") as File;
    const itemRef = doc(collection(db, "galleryItems"));
    const path = `community-gallery/${itemRef.id}/${safeName(file.name)}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type });
    await setDoc(itemRef, { title: String(data.get("title")), storagePath: path, public: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    form.reset(); setMessage("Community photo uploaded for approved residents.");
  }

  return <div className="mt-8 space-y-6">
    {board ? <div className="grid gap-6 lg:grid-cols-2"><form onSubmit={addEvent} className="grid gap-3 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Add community event</h2><Input name="title" label="Event title" /><Input name="date" label="Date" type="date" /><Input name="time" label="Time" required={false} /><Input name="location" label="Location" required={false} /><button className="btn-primary w-fit" type="submit">Post event</button></form><form onSubmit={addPhoto} className="grid content-start gap-3 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Add community photo</h2><Input name="title" label="Photo title" /><label><span className="label">Image file</span><input className="field mt-1" name="file" type="file" accept="image/*" required /></label><button className="btn-primary w-fit" type="submit"><Upload size={18} />Upload photo</button></form></div> : null}
    <div className="grid gap-6 lg:grid-cols-2"><Panel title="Community calendar">{[...events].sort((a, b) => a.date.localeCompare(b.date)).map((item) => <div key={item.id} className="border-b border-stone py-3 first:pt-0 last:border-0"><p className="font-bold">{item.title}</p><p className="text-sm">{item.date}{item.time ? ` · ${item.time}` : ""}{item.location ? ` · ${item.location}` : ""}</p>{board && item.public ? <button className="mt-2 text-xs font-bold text-burgundy underline" type="button" onClick={() => db && updateDoc(doc(db, "calendarEvents", item.id), { public: false, updatedAt: serverTimestamp() })}>Archive</button> : null}</div>)}{!events.length ? <p>No community events posted.</p> : null}</Panel><Panel title="Community gallery">{gallery.map((item) => <div key={item.id} className="border-b border-stone py-3 first:pt-0 last:border-0"><p className="font-bold">{item.title}</p>{item.storagePath ? <AttachmentButton path={item.storagePath} /> : <p className="mt-1 text-xs text-burgundy">This older photo awaits migration to protected storage.</p>}{board && item.public ? <button className="mt-2 block text-xs font-bold text-burgundy underline" type="button" onClick={() => db && updateDoc(doc(db, "galleryItems", item.id), { public: false, updatedAt: serverTimestamp() })}>Archive</button> : null}</div>)}{!gallery.length ? <p>No community photos posted.</p> : null}</Panel></div>
  </div>;
}

function DocumentsPanel({ items, board, profile, setMessage }: { items: AssociationDocument[]; board: boolean; profile: UserProfile; setMessage: (value: string) => void }) {
  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !storage) { setMessage("Firebase Storage is not enabled yet."); return; }
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file") as File;
    const documentRef = doc(collection(db, "associationDocuments"));
    const path = `documents/${documentRef.id}/v1/${safeName(file.name)}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type });
    await setDoc(documentRef, { title: String(data.get("title")), category: String(data.get("category")), description: String(data.get("description") ?? ""), visibility: String(data.get("visibility")), active: true, currentPath: path, version: 1, versions: [{ version: 1, path, fileName: file.name, uploadedByUid: profile.uid, uploadedAt: new Date().toISOString() }], createdByUid: profile.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    form.reset(); setMessage("Document uploaded. Its file is available only through an authorized account.");
  }

  async function replaceDocument(item: AssociationDocument, file: File) {
    if (!db || !storage) return;
    const version = item.version + 1;
    const path = `documents/${item.id}/v${version}/${safeName(file.name)}`;
    await uploadBytes(ref(storage, path), file, { contentType: file.type });
    await updateDoc(doc(db, "associationDocuments", item.id), { currentPath: path, version, versions: arrayUnion({ version, path, fileName: file.name, uploadedByUid: profile.uid, uploadedAt: new Date().toISOString() }), updatedAt: serverTimestamp() });
    setMessage("Document replaced. The prior version remains in protected storage.");
  }

  async function openDocument(item: AssociationDocument) {
    if (!storage) return;
    const blob = await getBlob(ref(storage, item.currentPath));
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
    {board ? <form onSubmit={uploadDocument} className="grid content-start gap-4 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Upload document</h2><Input name="title" label="Title" /><Input name="category" label="Folder or category" /><label><span className="label">Access</span><select className="field mt-1" name="visibility"><option value="resident">Residents and board</option><option value="board">Board only</option></select></label><label><span className="label">Description</span><textarea className="field mt-1" name="description" /></label><label><span className="label">File</span><input className="field mt-1" name="file" type="file" required /></label><button className="btn-primary w-fit" type="submit"><Upload size={18} />Upload</button></form> : null}
    <Panel title="Document library">{items.map((item) => <div key={item.id} className="border-b border-stone py-4 first:pt-0 last:border-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{item.title}</p><p className="text-sm">{item.category} · {item.visibility === "board" ? "Board only" : "Residents and board"} · Version {item.version}</p>{item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}</div><button className="btn-secondary min-h-9 px-3 py-1" type="button" onClick={() => openDocument(item)}><Download size={16} />Open</button></div>{board ? <div className="mt-3 flex flex-wrap gap-3"><label className="btn-secondary min-h-9 cursor-pointer px-3 py-1"><Upload size={16} />Replace<input className="sr-only" type="file" onChange={(event) => event.target.files?.[0] && replaceDocument(item, event.target.files[0])} /></label><button className="btn-secondary min-h-9 px-3 py-1" type="button" onClick={() => db && updateDoc(doc(db, "associationDocuments", item.id), { active: false, archivedAt: serverTimestamp(), updatedAt: serverTimestamp() })}><Archive size={16} />Archive</button></div> : null}</div>)}{!items.length ? <p>No documents are available.</p> : null}</Panel>
  </div>;
}

function ProposalsPanel({ items, user, profile, setMessage }: { items: Proposal[]; user: User; profile: UserProfile; setMessage: (value: string) => void }) {
  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!db) return;
    const form = event.currentTarget; const data = new FormData(form); const files = Array.from((data.getAll("attachments") as File[]).filter((file) => file.size));
    const proposalRef = doc(collection(db, "proposals"));
    await setDoc(proposalRef, { submissionType: String(data.get("submissionType")), title: String(data.get("title")), details: String(data.get("details")), status: "submitted", submittedByUid: user.uid, submittedByName: `${profile.firstName} ${profile.lastName}`, submittedByEmail: profile.email, attachmentPaths: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    const paths: string[] = [];
    if (storage) for (const file of files) { const path = `proposal-attachments/${proposalRef.id}/${Date.now()}-${safeName(file.name)}`; await uploadBytes(ref(storage, path), file, { contentType: file.type }); paths.push(path); }
    if (paths.length) await updateDoc(proposalRef, { attachmentPaths: paths, updatedAt: serverTimestamp() });
    form.reset(); setMessage("Proposal submitted to the board.");
  }
  return <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><form onSubmit={submitProposal} className="grid content-start gap-4 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Submit a request or proposal</h2><label><span className="label">Submission type</span><select className="field mt-1" name="submissionType"><option value="request">Request</option><option value="proposal">Proposal</option></select></label><Input name="title" label="Title" /><label><span className="label">Details</span><textarea className="field mt-1 min-h-40" name="details" required /></label><label><span className="label">Supporting attachments</span><input className="field mt-1" name="attachments" type="file" multiple /></label><button className="btn-primary w-fit" type="submit">Submit to board</button></form><Panel title="Requests and proposals">{items.map((item) => <div key={item.id} className="border-b border-stone py-4 first:pt-0 last:border-0"><div className="flex flex-wrap justify-between gap-3"><p className="font-bold">{item.title}</p><Status value={item.status} /></div><p className="mt-2 text-sm leading-6">{item.details}</p><p className="mt-2 text-xs">Submitted by {item.submittedByName}</p>{item.attachmentPaths?.map((path) => <AttachmentButton key={path} path={path} />)}</div>)}{!items.length ? <p>No requests or proposals submitted.</p> : null}</Panel></div>;
}

function AccessPanel({ items, setMessage }: { items: AccessRequest[]; setMessage: (value: string) => void }) {
  async function review(uid: string, decision: "approved" | "rejected") { if (!functions) return; await httpsCallable(functions, "reviewAccessRequest")({ uid, decision }); setMessage(`Access request ${decision}.`); }
  return <div className="mt-8"><Panel title="Pending resident access requests">{items.map((item) => <div key={item.id} className="border-b border-stone py-4 first:pt-0 last:border-0"><p className="font-bold">{item.firstName} {item.lastName}</p><p className="mt-1 text-sm">{item.propertyAddress} · {item.residencyType}</p><p className="text-sm">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p><div className="mt-3 flex gap-2"><button className="btn-primary min-h-9 px-3 py-1" type="button" onClick={() => review(item.uid, "approved")}><Check size={16} />Approve</button><button className="btn-secondary min-h-9 px-3 py-1" type="button" onClick={() => review(item.uid, "rejected")}><X size={16} />Reject</button></div></div>)}{!items.length ? <p>No pending requests.</p> : null}</Panel></div>;
}

function VotesPanel({ votes, proposals, user, setMessage }: { votes: VoteRecord[]; proposals: Proposal[]; user: User; setMessage: (value: string) => void }) {
  async function initiate(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!functions) return; const form = event.currentTarget; const data = new FormData(form); const files = Array.from((data.getAll("attachments") as File[]).filter((file) => file.size)); const paths: string[] = []; const draft = `${user.uid}-${Date.now()}`; if (storage) for (const file of files) { const path = `vote-attachments/${draft}/${safeName(file.name)}`; await uploadBytes(ref(storage, path), file, { contentType: file.type }); paths.push(path); } await httpsCallable(functions, "initiateVote")({ proposalId: String(data.get("proposalId")), motion: String(data.get("motion")), deadline: String(data.get("deadline")), attachmentPaths: paths }); form.reset(); setMessage("Board vote opened."); }
  async function cast(voteId: string, selection: string) { if (!functions) return; await httpsCallable(functions, "castVote")({ voteId, selection }); setMessage(`Vote recorded: ${selection}. You may change it until the deadline.`); }
  async function close(voteId: string) { if (!functions) return; const result = await httpsCallable(functions, "closeVote")({ voteId }); const data = result.data as { result: string }; setMessage(data.result === "rule-confirmation-required" ? "Vote closed. The outcome remains unofficial until the majority rule is confirmed." : `Vote closed: ${data.result}.`); }
  return <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><form onSubmit={initiate} className="grid content-start gap-4 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Initiate a board vote</h2><label><span className="label">Resident proposal</span><select className="field mt-1" name="proposalId" required><option value="">Select a proposal</option>{proposals.filter((item) => item.status === "submitted").map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label><span className="label">Motion being voted on</span><textarea className="field mt-1 min-h-32" name="motion" required /></label><label><span className="label">Voting deadline</span><input className="field mt-1" name="deadline" type="datetime-local" required /></label><label><span className="label">Board attachments</span><input className="field mt-1" name="attachments" type="file" multiple /></label><button className="btn-primary w-fit" type="submit"><Vote size={18} />Open vote</button></form><Panel title="Board votes">{votes.map((item) => <div key={item.id} className="border-b border-stone py-4 first:pt-0 last:border-0"><div className="flex flex-wrap justify-between gap-3"><p className="font-bold">{item.motion}</p><Status value={item.status} /></div><p className="mt-2 text-sm">Deadline: {dateTime(item.deadline)} · Quorum: {item.quorumRequired} of {item.eligibleCount}</p>{item.attachmentPaths?.map((path) => <AttachmentButton key={path} path={path} />)}{item.status === "open" ? <div className="mt-3 flex flex-wrap gap-2"><button className="btn-primary min-h-9 px-3 py-1" onClick={() => cast(item.id, "yes")}>Yes</button><button className="btn-secondary min-h-9 px-3 py-1" onClick={() => cast(item.id, "no")}>No</button><button className="btn-secondary min-h-9 px-3 py-1" onClick={() => cast(item.id, "abstain")}>Abstain</button><button className="btn-secondary min-h-9 px-3 py-1" onClick={() => close(item.id)}>Close vote</button></div> : <p className="mt-2 text-sm font-bold">Result: {item.result} · Yes {item.counts?.yes ?? 0}, No {item.counts?.no ?? 0}, Abstain {item.counts?.abstain ?? 0}</p>}</div>)}{!votes.length ? <p>No board votes yet.</p> : null}</Panel></div>;
}

function CommunicationsPanel({ residents, items, user, setMessage }: { residents: UserProfile[]; items: Communication[]; user: User; setMessage: (value: string) => void }) {
  async function send(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!functions) return; const form = event.currentTarget; const data = new FormData(form); const recipientUids = data.getAll("recipients").map(String); const files = Array.from((data.getAll("attachments") as File[]).filter((file) => file.size)); const paths: string[] = []; const draft = `${user.uid}-${Date.now()}`; if (storage) for (const file of files) { const path = `communication-attachments/${draft}/${safeName(file.name)}`; await uploadBytes(ref(storage, path), file, { contentType: file.type }); paths.push(path); } await httpsCallable(functions, "sendCommunication")({ recipientUids, subject: String(data.get("subject")), message: String(data.get("message")), attachmentPaths: paths }); form.reset(); setMessage("Message accepted for delivery."); }
  return <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><form onSubmit={send} className="grid content-start gap-4 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Compose official message</h2><fieldset><legend className="label">Approved resident recipients</legend><div className="mt-2 max-h-52 overflow-auto rounded border border-stone p-3">{residents.map((resident) => <label key={resident.uid} className="flex gap-2 py-2"><input name="recipients" type="checkbox" value={resident.uid} /><span>{resident.firstName} {resident.lastName} · {resident.propertyAddress}</span></label>)}</div></fieldset><Input name="subject" label="Subject" /><label><span className="label">Message</span><textarea className="field mt-1 min-h-40" name="message" required /></label><label><span className="label">Attachments</span><input className="field mt-1" name="attachments" type="file" multiple /></label><button className="btn-primary w-fit" type="submit"><Mail size={18} />Send from board@</button></form><Panel title="Shared correspondence history">{items.map((item) => <div key={item.id} className="border-b border-stone py-4 first:pt-0 last:border-0"><div className="flex flex-wrap justify-between gap-3"><p className="font-bold">{item.subject || "No subject"}</p><Status value={`${item.direction} · ${item.status ?? "recorded"}`} /></div><p className="mt-1 text-xs">{item.direction === "inbound" ? `From ${item.from ?? "unknown"}` : `To ${(item.to ?? []).join(", ")}`}</p><p className="mt-2 text-sm leading-6">{item.message}</p>{item.attachmentPaths?.map((path) => <AttachmentButton key={path} path={path} />)}</div>)}{!items.length ? <p>No correspondence recorded.</p> : null}</Panel></div>;
}

function AdministrationPanel({ setMessage }: { setMessage: (value: string) => void }) {
  async function setRole(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!functions) return; const form = event.currentTarget; const data = new FormData(form); await httpsCallable(functions, "setUserRole")({ email: String(data.get("email")), role: String(data.get("role")), boardTitle: String(data.get("boardTitle") ?? ""), active: data.get("active") === "on" }); form.reset(); setMessage("Account role updated. The user may need to sign out and back in."); }
  async function votingRules(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!functions) return; const data = new FormData(event.currentTarget); await httpsCallable(functions, "updateVotingRules")({ majorityBasis: String(data.get("majorityBasis")), abstentionTreatment: String(data.get("abstentionTreatment")), ruleConfirmed: data.get("ruleConfirmed") === "on" }); setMessage("Voting settings saved."); }
  return <div className="mt-8 grid gap-6 lg:grid-cols-2"><form onSubmit={setRole} className="grid content-start gap-4 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Manage account role</h2><p className="text-sm">The person must first create a verified account. Only administrators can grant or remove board access.</p><Input name="email" label="Account email" type="email" /><label><span className="label">Site role</span><select className="field mt-1" name="role"><option value="resident">Resident</option><option value="board">Board member</option><option value="administrator">Administrator</option></select></label><Input name="boardTitle" label="Board title, if applicable" required={false} /><label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked />Active account</label><button className="btn-primary w-fit" type="submit"><ShieldCheck size={18} />Save role</button></form><form onSubmit={votingRules} className="grid content-start gap-4 rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">Voting rule confirmation</h2><p className="rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">Leave unconfirmed until the board verifies the governing authority. Quorum is fixed at two-thirds, rounded up.</p><label><span className="label">Majority basis</span><select className="field mt-1" name="majorityBasis" defaultValue="unconfirmed"><option value="unconfirmed">Not confirmed</option><option value="all_eligible">Majority of all eligible board members</option><option value="votes_cast">Majority of votes cast after quorum</option></select></label><label><span className="label">Abstentions</span><select className="field mt-1" name="abstentionTreatment" defaultValue="unconfirmed"><option value="unconfirmed">Not confirmed</option><option value="excluded">Count for quorum, exclude from majority denominator</option><option value="counts_as_no">Count for quorum and majority denominator</option></select></label><label className="flex items-start gap-2"><input className="mt-1" name="ruleConfirmed" type="checkbox" /><span>I confirm this rule has been verified against the governing authority.</span></label><button className="btn-primary w-fit" type="submit">Save voting rule</button></form></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded border border-stone bg-white p-5 shadow-soft"><h2 className="font-serif text-2xl font-bold text-burgundy">{title}</h2><div className="mt-4">{children}</div></div>; }
function Input({ name, label, type = "text", required = true }: { name: string; label: string; type?: string; required?: boolean }) { return <label><span className="label">{label}</span><input className="field mt-1" name={name} type={type} required={required} /></label>; }
function Status({ value }: { value: string }) { return <span className="h-fit rounded bg-cream px-2 py-1 text-xs font-bold uppercase text-forest">{value.replaceAll("-", " ")}</span>; }
function AttachmentButton({ path }: { path: string }) { return <button className="mt-2 mr-2 inline-flex items-center gap-1 text-xs font-bold text-forest underline" type="button" onClick={() => openStoragePath(path)}><FileText size={14} />{path.split("/").pop()}</button>; }
async function openStoragePath(path: string) { if (!storage) return; const blob = await getBlob(ref(storage, path)); const url = URL.createObjectURL(blob); window.open(url, "_blank", "noopener,noreferrer"); window.setTimeout(() => URL.revokeObjectURL(url), 60000); }
function safeName(value: string) { return value.replace(/[^a-zA-Z0-9._-]+/g, "-"); }
function dateTime(value?: Timestamp) { return value?.toDate ? value.toDate().toLocaleString() : "Not available"; }
