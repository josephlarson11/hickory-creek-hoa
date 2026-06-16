"use client";

import { useMemo, useState } from "react";
import { PageHero } from "@/components/page-hero";
import { Announcement, announcements } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { collection, getDocs, query as firestoreQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [liveAnnouncements, setLiveAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function loadLiveAnnouncements() {
      if (!db) {
        return;
      }

      const snapshot = await getDocs(firestoreQuery(
        collection(db, "publicAnnouncements"),
        where("published", "==", true)
      ));

      setLiveAnnouncements(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: String(data.title ?? ""),
          content: String(data.content ?? ""),
          summary: String(data.summary ?? ""),
          publishDate: String(data.publishDate ?? new Date().toISOString().slice(0, 10)),
          author: String(data.author ?? "Board of Directors")
        };
      }));
    }

    loadLiveAnnouncements().catch(() => setLiveAnnouncements([]));
  }, []);

  const allAnnouncements = useMemo(() => {
    const staticIds = new Set(liveAnnouncements.map((item) => item.id));
    return [
      ...liveAnnouncements,
      ...announcements.filter((item) => !staticIds.has(item.id))
    ];
  }, [liveAnnouncements]);

  const visible = useMemo(() => {
    return allAnnouncements
      .filter((item) => `${item.title} ${item.content} ${item.author}`.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => sort === "newest"
        ? b.publishDate.localeCompare(a.publishDate)
        : a.publishDate.localeCompare(b.publishDate));
  }, [allAnnouncements, searchQuery, sort]);

  return (
    <>
      <PageHero eyebrow="Announcements" title="Community notices and archived updates">
        <p>Search current notices and older announcements published by the association.</p>
      </PageHero>
      <section className="section">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <label>
            <span className="label">Search announcements</span>
            <input className="field mt-1" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by title, content, or author" />
          </label>
          <label>
            <span className="label">Sort by date</span>
            <select className="field mt-1" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
        <div className="grid gap-5">
          {visible.length ? visible.map((item) => (
            <article key={item.id} className="rounded border border-stone bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-forest">
                <span>{formatDate(item.publishDate)}</span>
                <span>{item.author}</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-burgundy">{item.title}</h2>
              <p className="mt-3 leading-7">{item.content}</p>
            </article>
          )) : (
            <p className="rounded border border-stone bg-white p-6 shadow-soft">
              No announcements are currently published.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
