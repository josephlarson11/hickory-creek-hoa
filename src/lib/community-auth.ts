"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

export type SiteRole = "resident" | "board" | "administrator";

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  propertyAddress: string;
  role: SiteRole;
  active: boolean;
  boardTitle?: string;
};

const boardTitles = new Set([
  "President",
  "Vice President",
  "Treasurer",
  "Secretary",
  "Director"
]);

export async function getCommunityProfile(user: User | null): Promise<UserProfile | null> {
  if (!user?.email || !db) return null;

  const profileSnapshot = await getDoc(doc(db, "userProfiles", user.uid));
  if (profileSnapshot.exists()) {
    return profileSnapshot.data() as UserProfile;
  }

  // Keeps existing board accounts working while they are migrated to userProfiles.
  const legacySnapshot = await getDoc(doc(db, "boardUsers", user.email.toLowerCase()));
  if (!legacySnapshot.exists()) return null;

  const legacy = legacySnapshot.data();
  const legacyRole = String(legacy.siteRole ?? legacy.role ?? "");
  const role: SiteRole = legacyRole === "Administrator" || legacyRole === "administrator"
    ? "administrator"
    : "board";

  return {
    uid: user.uid,
    email: user.email,
    firstName: String(legacy.firstName ?? legacy.displayName ?? "Board"),
    lastName: String(legacy.lastName ?? "Member"),
    propertyAddress: String(legacy.propertyAddress ?? ""),
    role,
    active: legacy.active === true,
    boardTitle: boardTitles.has(String(legacy.role)) ? String(legacy.role) : undefined
  };
}

export async function signInCommunityMember(email: string, password: string) {
  if (!firebaseConfigured || !auth) throw new Error("Firebase is not configured for this site.");
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  const profile = await getCommunityProfile(credential.user);
  return { user: credential.user, profile };
}

export async function createPendingAccount(email: string, password: string, displayName: string) {
  if (!firebaseConfigured || !auth) throw new Error("Firebase is not configured for this site.");
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user, {
    url: "https://hickorycreekbrandon.com/access-request/"
  });
  return credential.user;
}

export async function signOutCommunityMember() {
  if (auth) await signOut(auth);
}
