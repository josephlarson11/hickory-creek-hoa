"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { LogIn } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { getCommunityProfile, signInCommunityMember } from "@/lib/community-auth";
import { auth } from "@/lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => auth ? onAuthStateChanged(auth, async (user) => {
    if (user && await getCommunityProfile(user)) router.replace("/portal");
  }) : undefined, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const { user, profile } = await signInCommunityMember(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
      if (!user.emailVerified) setMessage("Please verify your email before continuing.");
      else if (!profile) setMessage("Your request is still pending or has not been submitted.");
      else if (!profile.active) setMessage("This account is not active. Contact the association for help.");
      else router.push("/portal");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(email: string) {
    if (!auth || !email) { setMessage("Enter your email address first."); return; }
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage("A password reset email has been sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The reset email could not be sent.");
    }
  }

  return (
    <>
      <PageHero eyebrow="Private Community" title="Sign in">
        <p>Approved residents, board members, and administrators use individual accounts.</p>
      </PageHero>
      <section className="section max-w-xl">
        <form onSubmit={submit} className="rounded border border-stone bg-white p-6 shadow-soft">
          <label><span className="label">Email</span><input id="signin-email" className="field mt-1" name="email" type="email" autoComplete="email" required /></label>
          <label className="mt-4 block"><span className="label">Password</span><input className="field mt-1" name="password" type="password" autoComplete="current-password" required /></label>
          <button className="btn-primary mt-6" type="submit" disabled={busy}><LogIn size={18} aria-hidden="true" />{busy ? "Signing in..." : "Sign in"}</button>
          <button className="mt-5 block text-sm font-bold text-forest underline" type="button" onClick={() => resetPassword((document.getElementById("signin-email") as HTMLInputElement)?.value)}>Forgot password?</button>
          {message ? <p role="alert" className="mt-4 rounded bg-cream p-3 text-sm font-bold">{message}</p> : null}
        </form>
        <p className="mt-5 text-center">Need an account? <Link className="font-bold text-forest underline" href="/access-request">Request resident access</Link>.</p>
      </section>
    </>
  );
}
