"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileUp, Lock, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { auth } from "@/lib/firebase";
import { BoardProfile, getBoardProfile, signInBoardMember, signOutBoardMember } from "@/lib/board-auth";
import { onAuthStateChanged, User } from "firebase/auth";

const privateDocs = [
  "Financial Reports",
  "Reserve Studies",
  "Vendor Contracts",
  "Insurance Policies",
  "Legal Correspondence",
  "Draft Minutes",
  "Meeting Packets"
];

const statuses = ["Draft", "Board Review", "Approved", "Published"];

export default function BoardPortalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BoardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setProfile(await getBoardProfile(currentUser));
      setLoading(false);
    });
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const result = await signInBoardMember(email, password);
      setUser(result.user);
      setProfile(result.profile);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOutBoardMember();
    setUser(null);
    setProfile(null);
    setPassword("");
  }

  const authorized = Boolean(user && profile?.active);

  return (
    <>
      <PageHero eyebrow="Board Portal" title="Secure board-only workspace">
        <p>Firebase Authentication and approved-email role checks protect board documents, submissions, minutes workflow, and user management.</p>
      </PageHero>
      <section className="section grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleSignIn} className="rounded border border-stone bg-white p-6 shadow-soft">
          <Lock aria-hidden="true" className="text-forest" size={34} />
          <h2 className="mt-4 font-serif text-2xl font-bold text-burgundy">
            {authorized ? "Signed In" : "Board Sign In"}
          </h2>
          {authorized ? (
            <>
              <p className="mt-3 rounded bg-green-50 p-3 text-sm font-bold text-green-800">
                Welcome, {profile?.displayName || user?.email}. Role: {profile?.role}
              </p>
              <button className="btn-secondary mt-5" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6">
                Sign in with an approved board member email and Firebase password.
              </p>
              <label className="mt-5 block">
                <span className="label">Board member email</span>
                <input className="field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
              </label>
              <label className="mt-4 block">
                <span className="label">Password</span>
                <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <button className="btn-primary mt-5" type="submit" disabled={loading}>
                {loading ? "Checking..." : "Sign in"}
              </button>
              {message ? <p className="mt-4 rounded bg-red-50 p-3 text-sm font-bold text-red-800">{message}</p> : null}
            </>
          )}
        </form>

        <div className={`grid gap-5 md:grid-cols-2 ${authorized ? "" : "opacity-45"}`} aria-hidden={!authorized}>
          <Widget icon={<ShieldCheck />} title="Pending Submissions" value="4" text="Resident requests waiting for review." />
          <Widget icon={<FileUp />} title="Recent Uploads" value="7" text="Private board documents added this month." />
          <Widget icon={<Users />} title="Board Users" value="6" text="Approved role-based users." />
          <Widget icon={<Lock />} title="Draft Announcements" value="2" text="Not visible on the public site." />
        </div>
      </section>

      <section className={`bg-white ${authorized ? "" : "opacity-45"}`} aria-hidden={!authorized}>
        <div className="section grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Private Board Documents</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {privateDocs.map((item) => (
                <div key={item} className="rounded border border-stone bg-cream p-4 font-bold">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Minutes Workflow</h2>
            <div className="mt-5 grid gap-3">
              {statuses.map((status, index) => (
                <div key={status} className="flex items-center gap-4 rounded border border-stone bg-cream p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest font-bold text-white">{index + 1}</span>
                  <span className="font-bold">{status}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 leading-7">Only minutes marked Approved and Published should be copied into the public document library.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Widget({ icon, title, value, text }: { icon: React.ReactNode; title: string; value: string; text: string }) {
  return (
    <article className="rounded border border-stone bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-cream p-2 text-forest">{icon}</span>
        <span className="font-serif text-3xl font-bold text-burgundy">{value}</span>
      </div>
      <h2 className="mt-4 font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{text}</p>
    </article>
  );
}
