"use client";

import { FormEvent, useState } from "react";
import { RequestKind, submitResidentRequest } from "@/lib/submissions";

export function ResidentRequestForm({
  kind,
  title,
  includeTopic = true
}: {
  kind: RequestKind;
  title: string;
  includeTopic?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    const formData = new FormData(form);

    try {
      const result = await submitResidentRequest({
        kind,
        name: String(formData.get("name") ?? ""),
        address: String(formData.get("address") ?? ""),
        email: String(formData.get("email") ?? ""),
        topic: String(formData.get("topic") ?? ""),
        description: String(formData.get("description") ?? ""),
        message: String(formData.get("message") ?? ""),
        attachment: (formData.get("attachment") as File | null) ?? null
      });
      setStatus("success");
      setMessage(result.offline
        ? "Demo mode: your submission was validated. Connect Firebase to store live requests."
        : "Your submission was received and marked Submitted.");
      form.reset();
    } catch (error) {
      setStatus("error");
      const details = error instanceof Error ? error.message : "Unknown Firebase error";
      setMessage(`Something went wrong while sending the request: ${details}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded border border-stone bg-white p-6 shadow-soft">
      <h2 className="font-serif text-2xl font-bold text-burgundy">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Resident Name</span>
          <input className="field mt-1" name="name" required autoComplete="name" />
        </label>
        <label>
          <span className="label">Property Address</span>
          <input className="field mt-1" name="address" autoComplete="street-address" />
        </label>
        <label>
          <span className="label">Email</span>
          <input className="field mt-1" name="email" type="email" required autoComplete="email" />
        </label>
        {includeTopic ? (
          <label>
            <span className="label">Topic</span>
            <input className="field mt-1" name="topic" required />
          </label>
        ) : null}
      </div>
      <label className="mt-4 block">
        <span className="label">{kind === "contact" ? "Message" : "Description"}</span>
        <textarea className="field mt-1 min-h-36" name={kind === "contact" ? "message" : "description"} required />
      </label>
      {kind !== "contact" ? (
        <p className="mt-4 rounded bg-cream p-3 text-sm leading-6">
          Supporting attachments are handled through the secure proposal form in the private community portal.
        </p>
      ) : null}
      <button className="btn-primary mt-6" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting..." : "Submit"}
      </button>
      {message ? (
        <p className={`mt-4 rounded p-3 text-sm font-bold ${status === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
