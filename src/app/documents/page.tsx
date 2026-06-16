"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { DocumentItem, documents } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { collection, getDocs, query as firestoreQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [liveDocuments, setLiveDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    async function loadLiveDocuments() {
      if (!db) {
        return;
      }

      const snapshot = await getDocs(firestoreQuery(
        collection(db, "publicDocuments"),
        where("approved", "==", true),
        where("public", "==", true)
      ));

      setLiveDocuments(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: String(data.title ?? ""),
          category: String(data.category ?? "Policies"),
          updatedAt: String(data.updatedAtText ?? data.updatedAt ?? new Date().toISOString().slice(0, 10)),
          description: String(data.description ?? ""),
          href: String(data.href ?? "#"),
          isApproved: Boolean(data.approved)
        };
      }));
    }

    loadLiveDocuments().catch(() => setLiveDocuments([]));
  }, []);

  const allDocuments = useMemo(() => {
    const staticIds = new Set(liveDocuments.map((item) => item.id));
    return [
      ...liveDocuments,
      ...documents.filter((item) => !staticIds.has(item.id))
    ];
  }, [liveDocuments]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(allDocuments.map((item) => item.category)))],
    [allDocuments]
  );

  const visible = useMemo(() => {
    return allDocuments.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery = `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery && item.isApproved;
    });
  }, [allDocuments, category, query]);

  return (
    <>
      <PageHero eyebrow="Documents" title="Approved public governing documents and meeting records">
        <p>Only approved documents are published publicly. Drafts and private records remain in the secure board portal.</p>
      </PageHero>
      <section className="section">
        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_280px]">
          <label>
            <span className="label">Search documents</span>
            <span className="relative mt-1 block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest" size={18} />
              <input className="field pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, category, or description" />
            </span>
          </label>
          <label>
            <span className="label">Category</span>
            <select className="field mt-1" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((item) => (
            <article key={item.id} className="rounded border border-stone bg-white p-6 shadow-soft">
              <p className="text-sm font-bold text-forest">{item.category}</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-burgundy">{item.title}</h2>
              <p className="mt-3 leading-7">{item.description}</p>
              <p className="mt-3 text-sm">Updated {formatDate(item.updatedAt)}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a className="btn-secondary" href={item.href} target="_blank" rel="noreferrer">
                  <Eye aria-hidden="true" size={17} />
                  Preview PDF
                </a>
                <a className="btn-primary" href={item.href} download>
                  <Download aria-hidden="true" size={17} />
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
