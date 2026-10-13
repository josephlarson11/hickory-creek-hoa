"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "@/lib/firebase";

export type RequestKind = "board-meeting" | "annual-meeting" | "contact";

export type SubmissionPayload = {
  kind: RequestKind;
  name: string;
  address?: string;
  email: string;
  topic?: string;
  message?: string;
  description?: string;
  attachment?: File | null;
};

export async function submitResidentRequest(payload: SubmissionPayload) {
  if (!firebaseConfigured || !db) {
    return {
      ok: true,
      offline: true,
      id: `demo-${Date.now()}`
    };
  }
  if (!auth?.currentUser) throw new Error("Sign in with an approved resident account before submitting a request.");

  const docRef = await addDoc(collection(db, "residentSubmissions"), {
    kind: payload.kind,
    residentName: payload.name,
    propertyAddress: payload.address ?? "",
    email: payload.email,
    topic: payload.topic ?? "",
    message: payload.message ?? "",
    description: payload.description ?? "",
    submittedByUid: auth.currentUser.uid,
    status: "Submitted",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { ok: true, offline: false, id: docRef.id };
}
