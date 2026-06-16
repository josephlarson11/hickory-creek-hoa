"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileUp, Lock, Megaphone, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { auth, db } from "@/lib/firebase";
import { BoardProfile, getBoardProfile, signInBoardMember, signOutBoardMember } from "@/lib/board-auth";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

const privateDocs = [
  "Financial Reports",
  "Reserve Studies",
  "Vendor Contracts",
  "Insurance Policies",
  "Legal Correspondence",
  "Draft Minutes",
  "Meeting Packets"
];

const requestStatuses = ["Submitted", "Under Review", "Added to Agenda", "Closed"];
const minuteStatuses = ["Draft", "Board Review", "Approved", "Published"];

type ResidentSubmission = {
  id: string;
  kind?: string;
  residentName?: string;
  propertyAddress?: string;
  email?: string;
  topic?: string;
  description?: string;
  message?: string;
  status?: string;
};

type ManagedDocument = {
  id: string;
  title?: string;
  category?: string;
  href?: string;
  public?: boolean;
  approved?: boolean;
};

type ManagedEvent = {
  id: string;
  title?: string;
  date?: string;
  type?: string;
  public?: boolean;
};

type ManagedGalleryItem = {
  id: string;
  title?: string;
  src?: string;
  public?: boolean;
};

export default function BoardPortalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BoardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<ResidentSubmission[]>([]);
  const [managedDocuments, setManagedDocuments] = useState<ManagedDocument[]>([]);
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>([]);
  const [managedGallery, setManagedGallery] = useState<ManagedGalleryItem[]>([]);
  const [boardMessage, setBoardMessage] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [contentMessage, setContentMessage] = useState("");

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

  useEffect(() => {
    if (!db || !user || !profile?.active) {
      setSubmissions([]);
      return;
    }

    const submissionsQuery = query(
      collection(db, "residentSubmissions"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      submissionsQuery,
      (snapshot) => {
        setSubmissions(snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        })));
      },
      (error) => setBoardMessage(error.message)
    );
  }, [profile?.active, user]);

  useEffect(() => {
    if (!db || !user || !profile?.active) {
      setManagedDocuments([]);
      setManagedEvents([]);
      setManagedGallery([]);
      return;
    }

    const unsubDocuments = onSnapshot(collection(db, "publicDocuments"), (snapshot) => {
      setManagedDocuments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setContentMessage(`Document listings could not load: ${error.message}`));

    const unsubEvents = onSnapshot(collection(db, "calendarEvents"), (snapshot) => {
      setManagedEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setContentMessage(`Calendar events could not load: ${error.message}`));

    const unsubGallery = onSnapshot(collection(db, "galleryItems"), (snapshot) => {
      setManagedGallery(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => setContentMessage(`Gallery items could not load: ${error.message}`));

    return () => {
      unsubDocuments();
      unsubEvents();
      unsubGallery();
    };
  }, [profile?.active, user]);

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

  async function handleStatusChange(id: string, status: string) {
    if (!db) {
      return;
    }

    await updateDoc(doc(db, "residentSubmissions", id), {
      status,
      updatedAt: serverTimestamp()
    });
  }

  async function handleAnnouncementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !profile) {
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const published = formData.get("published") === "on";
      const content = String(formData.get("content") ?? "");

      await addDoc(collection(db, "publicAnnouncements"), {
        title: String(formData.get("title") ?? ""),
        summary: String(formData.get("summary") || content.slice(0, 150)),
        content,
        publishDate: String(formData.get("publishDate") ?? new Date().toISOString().slice(0, 10)),
        author: profile.displayName || profile.role,
        published,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      form.reset();
      setAnnouncementMessage(published ? "Announcement published." : "Announcement saved as a draft.");
    } catch (error) {
      setAnnouncementMessage(error instanceof Error ? error.message : "Announcement could not be saved.");
    }
  }

  async function handleDocumentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) {
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      await addDoc(collection(db, "publicDocuments"), {
        title: String(formData.get("title") ?? ""),
        category: String(formData.get("category") ?? "Policies"),
        description: String(formData.get("description") ?? ""),
        href: String(formData.get("href") ?? ""),
        updatedAtText: String(formData.get("updatedAt") ?? new Date().toISOString().slice(0, 10)),
        approved: formData.get("approved") === "on",
        public: formData.get("public") === "on",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      form.reset();
      setContentMessage("Document listing saved.");
    } catch (error) {
      setContentMessage(error instanceof Error ? `Document listing could not be saved: ${error.message}` : "Document listing could not be saved.");
    }
  }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) {
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      await addDoc(collection(db, "calendarEvents"), {
        title: String(formData.get("title") ?? ""),
        date: String(formData.get("date") ?? ""),
        time: String(formData.get("time") ?? ""),
        location: String(formData.get("location") ?? ""),
        type: String(formData.get("type") ?? "Community Event"),
        public: formData.get("public") === "on",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      form.reset();
      setContentMessage("Calendar event saved.");
    } catch (error) {
      setContentMessage(error instanceof Error ? `Calendar event could not be saved: ${error.message}` : "Calendar event could not be saved.");
    }
  }

  async function handleGallerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) {
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      await addDoc(collection(db, "galleryItems"), {
        title: String(formData.get("title") ?? ""),
        src: String(formData.get("src") ?? "/images/entrance.jpg"),
        public: formData.get("public") === "on",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      form.reset();
      setContentMessage("Gallery item saved.");
    } catch (error) {
      setContentMessage(error instanceof Error ? `Gallery item could not be saved: ${error.message}` : "Gallery item could not be saved.");
    }
  }

  async function hideManagedItem(collectionName: string, id: string) {
    if (!db) {
      return;
    }

    try {
      await updateDoc(doc(db, collectionName, id), {
        public: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      setContentMessage(error instanceof Error ? `Item could not be hidden: ${error.message}` : "Item could not be hidden.");
    }
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
          <Widget icon={<ShieldCheck />} title="Pending Submissions" value={String(submissions.filter((item) => item.status !== "Closed").length)} text="Resident requests waiting for review." anchor="submissions" />
          <Widget icon={<Megaphone />} title="Announcements" value="New" text="Publish a public community update." anchor="announcements" />
          <Widget icon={<FileUp />} title="Content Listings" value="Edit" text="Add document, calendar, and gallery listings." anchor="content" />
          <Widget icon={<Users />} title="Board Users" value={profile?.role ?? "-"} text="Manage users in Firebase for now." />
        </div>
      </section>

      {authorized ? (
        <section id="submissions" className="section">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Resident Requests</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-burgundy">Submissions</h2>
            </div>
            <p className="text-sm font-bold text-forest">{submissions.length} total</p>
          </div>
          {boardMessage ? <p className="mb-4 rounded bg-red-50 p-3 text-sm font-bold text-red-800">{boardMessage}</p> : null}
          <div className="grid gap-4">
            {submissions.length ? submissions.map((item) => (
              <article key={item.id} className="rounded border border-stone bg-white p-5 shadow-soft">
                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <div>
                    <p className="text-sm font-bold text-forest">{item.kind || "Resident request"}</p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-burgundy">{item.topic || "No topic provided"}</h3>
                    <p className="mt-2 text-sm font-bold">{item.residentName} · {item.propertyAddress}</p>
                    <p className="mt-1 text-sm">{item.email}</p>
                    <p className="mt-3 leading-7">{item.description || item.message}</p>
                  </div>
                  <label>
                    <span className="label">Status</span>
                    <select
                      className="field mt-1"
                      value={item.status || "Submitted"}
                      onChange={(event) => handleStatusChange(item.id, event.target.value)}
                    >
                      {requestStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </article>
            )) : (
              <p className="rounded border border-stone bg-white p-5">No resident submissions yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {authorized ? (
        <section id="announcements" className="bg-white">
          <div className="section">
            <p className="eyebrow">Announcements</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-burgundy">Create Community Announcement</h2>
            <form onSubmit={handleAnnouncementSubmit} className="mt-6 grid gap-4 rounded border border-stone bg-cream p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="label">Title</span>
                  <input className="field mt-1" name="title" required />
                </label>
                <label>
                  <span className="label">Publish date</span>
                  <input className="field mt-1" name="publishDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                </label>
              </div>
              <label>
                <span className="label">Short summary</span>
                <input className="field mt-1" name="summary" />
              </label>
              <label>
                <span className="label">Announcement text</span>
                <textarea className="field mt-1 min-h-32" name="content" required />
              </label>
              <label className="flex items-center gap-3 font-bold">
                <input className="rounded border-stone text-forest focus:ring-forest" name="published" type="checkbox" />
                Publish to the public announcements page
              </label>
              <button className="btn-primary w-fit" type="submit">Save announcement</button>
              {announcementMessage ? <p className="rounded bg-green-50 p-3 text-sm font-bold text-green-800">{announcementMessage}</p> : null}
            </form>
          </div>
        </section>
      ) : null}

      {authorized ? (
        <section id="content" className="section">
          <p className="eyebrow">Content Listings</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-burgundy">Documents, Calendar, and Gallery</h2>
          <p className="mt-3 max-w-4xl leading-7">
            These tools edit what appears on the public pages. For PDFs and photos, first add or replace
            the file in GitHub, then paste its website path here.
          </p>
          {contentMessage ? <p className="mt-4 rounded bg-green-50 p-3 text-sm font-bold text-green-800">{contentMessage}</p> : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <ContentForm title="Add Document Listing" onSubmit={handleDocumentSubmit}>
              <input className="field" name="title" placeholder="Document title" required />
              <select className="field" name="category" defaultValue="Policies">
                <option>Declaration / CC&Rs</option>
                <option>Bylaws</option>
                <option>Rules and Regulations</option>
                <option>Architectural Forms</option>
                <option>Approved Meeting Minutes</option>
                <option>Budgets</option>
                <option>Policies</option>
              </select>
              <input className="field" name="href" placeholder="/documents/minutes/example.pdf" required />
              <input className="field" name="updatedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              <textarea className="field min-h-24" name="description" placeholder="Short description" required />
              <Toggle name="approved" label="Approved" defaultChecked />
              <Toggle name="public" label="Show publicly" defaultChecked />
            </ContentForm>

            <ContentForm title="Add Calendar Event" onSubmit={handleEventSubmit}>
              <input className="field" name="title" placeholder="Event title" required />
              <input className="field" name="date" type="date" required />
              <input className="field" name="time" placeholder="6:30 PM" required />
              <input className="field" name="location" placeholder="Location or online" required />
              <select className="field" name="type" defaultValue="Community Event">
                <option>Board Meeting</option>
                <option>Annual Meeting</option>
                <option>Community Event</option>
              </select>
              <Toggle name="public" label="Show publicly" defaultChecked />
            </ContentForm>

            <ContentForm title="Add Gallery Item" onSubmit={handleGallerySubmit}>
              <input className="field" name="title" placeholder="Photo title" required />
              <input className="field" name="src" placeholder="/images/entrance.jpg" required />
              <Toggle name="public" label="Show publicly" defaultChecked />
            </ContentForm>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <ManagedList title="Firestore Documents">
              {managedDocuments.map((item) => (
                <ManagedRow key={item.id} title={item.title || "Untitled document"} meta={item.category || "Document"} publicValue={item.public} onHide={() => hideManagedItem("publicDocuments", item.id)} />
              ))}
            </ManagedList>
            <ManagedList title="Firestore Events">
              {managedEvents.map((item) => (
                <ManagedRow key={item.id} title={item.title || "Untitled event"} meta={`${item.type || "Event"} ${item.date || ""}`} publicValue={item.public} onHide={() => hideManagedItem("calendarEvents", item.id)} />
              ))}
            </ManagedList>
            <ManagedList title="Firestore Gallery">
              {managedGallery.map((item) => (
                <ManagedRow key={item.id} title={item.title || "Untitled image"} meta={item.src || "Image path"} publicValue={item.public} onHide={() => hideManagedItem("galleryItems", item.id)} />
              ))}
            </ManagedList>
          </div>
        </section>
      ) : null}

      <section id="documents" className={`bg-white ${authorized ? "" : "opacity-45"}`} aria-hidden={!authorized}>
        <div className="section grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Private Board Documents</h2>
            <p className="mt-3 leading-7">Firebase Storage is disabled to keep the project no-cost. For now, public PDF updates are made by replacing files in the website project and republishing through GitHub.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {privateDocs.map((item) => (
                <div key={item} className="rounded border border-stone bg-cream p-4 font-bold">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-burgundy">Minutes Workflow</h2>
            <div className="mt-5 grid gap-3">
              {minuteStatuses.map((status, index) => (
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

function Widget({ icon, title, value, text, anchor }: { icon: React.ReactNode; title: string; value: string; text: string; anchor?: string }) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-cream p-2 text-forest">{icon}</span>
        <span className="font-serif text-3xl font-bold text-burgundy">{value}</span>
      </div>
      <h2 className="mt-4 font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{text}</p>
    </>
  );

  if (anchor) {
    return (
      <a href={`#${anchor}`} className="rounded border border-stone bg-white p-5 shadow-soft transition hover:border-forest">
        {content}
      </a>
    );
  }

  return (
    <article className="rounded border border-stone bg-white p-5 shadow-soft">
      {content}
    </article>
  );
}

function ContentForm({
  title,
  onSubmit,
  children
}: {
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded border border-stone bg-white p-5 shadow-soft">
      <h3 className="font-serif text-2xl font-bold text-burgundy">{title}</h3>
      {children}
      <button className="btn-primary w-fit" type="submit">Save</button>
    </form>
  );
}

function Toggle({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-3 font-bold">
      <input className="rounded border-stone text-forest focus:ring-forest" name={name} type="checkbox" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

function ManagedList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-stone bg-white p-5 shadow-soft">
      <h3 className="font-serif text-2xl font-bold text-burgundy">{title}</h3>
      <div className="mt-4 grid gap-3">
        {children || <p className="text-sm">No Firestore-managed items yet.</p>}
      </div>
    </div>
  );
}

function ManagedRow({
  title,
  meta,
  publicValue,
  onHide
}: {
  title: string;
  meta: string;
  publicValue?: boolean;
  onHide: () => void;
}) {
  return (
    <div className="rounded border border-stone bg-cream p-3">
      <p className="font-bold">{title}</p>
      <p className="mt-1 break-words text-sm">{meta}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-forest">
          {publicValue ? "Public" : "Hidden"}
        </span>
        {publicValue ? (
          <button className="btn-secondary min-h-9 px-3 py-1 text-xs" type="button" onClick={onHide}>
            Hide
          </button>
        ) : null}
      </div>
    </div>
  );
}
