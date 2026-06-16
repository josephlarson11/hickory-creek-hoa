"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, firebaseConfigured, storage, storageEnabled } from "@/lib/firebase";

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

  let attachmentUrl = "";
  if (payload.attachment && storage && storageEnabled) {
    const fileRef = ref(
      storage,
      `resident-submissions/${payload.kind}/${Date.now()}-${payload.attachment.name}`
    );
    await uploadBytes(fileRef, payload.attachment);
    attachmentUrl = await getDownloadURL(fileRef);
  }

  const docRef = await addDoc(collection(db, "residentSubmissions"), {
    kind: payload.kind,
    residentName: payload.name,
    propertyAddress: payload.address ?? "",
    email: payload.email,
    topic: payload.topic ?? "",
    message: payload.message ?? "",
    description: payload.description ?? "",
    attachmentUrl,
    status: "Submitted",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { ok: true, offline: false, id: docRef.id };
}
