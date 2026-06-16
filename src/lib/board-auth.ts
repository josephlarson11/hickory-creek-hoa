"use client";

import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

export type BoardProfile = {
  active: boolean;
  role: string;
  displayName: string;
};

export async function signInBoardMember(email: string, password: string) {
  if (!firebaseConfigured || !auth || !db) {
    throw new Error("Firebase is not configured for this site.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getBoardProfile(credential.user);

  if (!profile?.active) {
    await signOut(auth);
    throw new Error("This email is not approved for board portal access.");
  }

  return { user: credential.user, profile };
}

export async function getBoardProfile(user: User | null) {
  if (!user?.email || !db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "boardUsers", user.email));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as BoardProfile;
}

export async function signOutBoardMember() {
  if (auth) {
    await signOut(auth);
  }
}
