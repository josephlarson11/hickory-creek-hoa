"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { reload } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { CheckCircle2, MailCheck } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { createPendingAccount } from "@/lib/community-auth";
import { auth, db } from "@/lib/firebase";

type SavedRequest = {
  firstName: string;
  lastName: string;
  propertyAddress: string;
  residencyType: string;
  phone: string;
  email: string;
};

export default function AccessRequestPage() {
  const [step, setStep] = useState<"form" | "verify" | "done">("form");
  const [saved, setSaved] = useState<SavedRequest | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const request = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      propertyAddress: String(formData.get("propertyAddress") ?? "").trim(),
      residencyType: String(formData.get("residencyType") ?? "owner"),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase()
    };
    setBusy(true);
    setMessage("");
    try {
      await createPendingAccount(request.email, String(formData.get("password") ?? ""), `${request.firstName} ${request.lastName}`);
      setSaved(request);
      setStep("verify");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The account could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmVerification() {
    if (!auth?.currentUser || !db || !saved) return;
    setBusy(true);
    setMessage("");
    try {
      await reload(auth.currentUser);
      if (!auth.currentUser.emailVerified) {
        setMessage("The email is not verified yet. Open the link in the verification email, then try again.");
        return;
      }
      await auth.currentUser.getIdToken(true);
      await setDoc(doc(db, "accessRequests", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        ...saved,
        emailVerified: true,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setStep("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The request could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Account Access" title="Request resident access">
        <p>Every request is held for review. A board member must approve the account before community information becomes available.</p>
      </PageHero>
      <section className="section max-w-3xl">
        {step === "form" ? (
          <form onSubmit={createRequest} className="grid gap-5 rounded border border-stone bg-white p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" name="firstName" autoComplete="given-name" />
              <Field label="Last name" name="lastName" autoComplete="family-name" />
            </div>
            <Field label="Full Hickory Creek property address" name="propertyAddress" autoComplete="street-address" />
            <label>
              <span className="label">Relationship to the property</span>
              <select className="field mt-1" name="residencyType" defaultValue="owner">
                <option value="owner">Owner residing at the property</option>
                <option value="nonresident-owner">Owner residing elsewhere</option>
                <option value="tenant">Tenant or other resident</option>
                <option value="other">Other association relationship</option>
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email address" name="email" type="email" autoComplete="email" />
              <Field label="Phone number" name="phone" type="tel" autoComplete="tel" />
            </div>
            <label>
              <span className="label">Create a password</span>
              <input className="field mt-1" name="password" type="password" minLength={10} autoComplete="new-password" required />
              <span className="mt-1 block text-xs">Use at least 10 characters. The board will never see this password.</span>
            </label>
            <button className="btn-primary w-fit" type="submit" disabled={busy}>{busy ? "Creating account..." : "Verify email"}</button>
          </form>
        ) : null}

        {step === "verify" ? (
          <div className="rounded border border-stone bg-white p-6 shadow-soft">
            <MailCheck className="text-forest" size={36} aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-burgundy">Check your email</h2>
            <p className="mt-3 leading-7">Open the verification link sent to <strong>{saved?.email}</strong>. Return here afterward; this page may remain open.</p>
            <button className="btn-primary mt-6" type="button" onClick={confirmVerification} disabled={busy}>{busy ? "Checking..." : "I verified my email"}</button>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="rounded border border-stone bg-white p-6 shadow-soft">
            <CheckCircle2 className="text-forest" size={36} aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-burgundy">Request pending</h2>
            <p className="mt-3 leading-7">A board member must verify your association with the property and approve the request. You can sign in to see the status, but protected content remains unavailable until approval.</p>
            <Link className="btn-primary mt-6" href="/sign-in">Go to sign in</Link>
          </div>
        ) : null}
        {message ? <p role="alert" className="mt-4 rounded bg-red-50 p-3 font-bold text-red-800">{message}</p> : null}
      </section>
    </>
  );
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return <label><span className="label">{label}</span><input className="field mt-1" name={name} type={type} autoComplete={autoComplete} required /></label>;
}
