"use client";

import { useMemo, useState } from "react";
import { PageHero } from "@/components/page-hero";
import { announcements } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default function AnnouncementsPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const visible = useMemo(() => {
    return announcements
      .filter((item) => `${item.title} ${item.content} ${item.author}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sort === "newest"
        ? b.publishDate.localeCompare(a.publishDate)
        : a.publishDate.localeCompare(b.publishDate));
  }, [query, sort]);

  return (
    <>
      <PageHero eyebrow="Announcements" title="Community notices and archived updates">
        <p>Search current notices and older announcements published by the association.</p>
      </PageHero>
      <section className="section">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <label>
            <span className="label">Search announcements</span>
            <input className="field mt-1" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, content, or author" />
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
          {visible.map((item) => (
            <article key={item.id} className="rounded border border-stone bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-forest">
                <span>{formatDate(item.publishDate)}</span>
                <span>{item.author}</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-burgundy">{item.title}</h2>
              <p className="mt-3 leading-7">{item.content}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
