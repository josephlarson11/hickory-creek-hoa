"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, FileText, Lock, Megaphone, Send } from "lucide-react";
import { Announcement, announcements, CalendarEvent, events } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { collection, getDocs, query as firestoreQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function HomePage() {
  const [liveAnnouncements, setLiveAnnouncements] = useState<Announcement[]>([]);
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    async function loadHomeContent() {
      if (!db) {
        return;
      }

      const [announcementSnapshot, eventSnapshot] = await Promise.all([
        getDocs(firestoreQuery(
          collection(db, "publicAnnouncements"),
          where("published", "==", true)
        )),
        getDocs(firestoreQuery(
          collection(db, "calendarEvents"),
          where("public", "==", true)
        ))
      ]);

      setLiveAnnouncements(announcementSnapshot.docs.map((item) => {
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

      setLiveEvents(eventSnapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: String(data.title ?? ""),
          date: String(data.date ?? new Date().toISOString().slice(0, 10)),
          time: String(data.time ?? ""),
          location: String(data.location ?? ""),
          type: String(data.type ?? "Community Event") as CalendarEvent["type"]
        };
      }));
    }

    loadHomeContent().catch(() => {
      setLiveAnnouncements([]);
      setLiveEvents([]);
    });
  }, []);

  const latestAnnouncements = useMemo(() => {
    const staticIds = new Set(liveAnnouncements.map((item) => item.id));
    return [...liveAnnouncements, ...announcements.filter((item) => !staticIds.has(item.id))]
      .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
      .slice(0, 3);
  }, [liveAnnouncements]);

  const upcomingEvents = useMemo(() => {
    const today = localDateString();
    const staticIds = new Set(liveEvents.map((item) => item.id));
    return [...liveEvents, ...events.filter((item) => !staticIds.has(item.id))]
      .filter((item) => item.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [liveEvents]);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/entrance.jpg"
            alt="Hickory Creek entrance monument with oak tree landscaping"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        </div>
        <div className="section relative flex min-h-[620px] items-center pb-24 pt-24">
          <div className="max-w-3xl">
            <Image
              src="/images/entrance-logo.png"
              alt="Hickory Creek Owners Association logo"
              width={180}
              height={180}
              className="mb-8 h-28 w-28 rounded bg-cream p-3 shadow-soft sm:h-36 sm:w-36"
            />
            <p className="eyebrow text-stone">Brandon, Florida</p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Welcome to Hickory Creek Owners Association
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cream sm:text-xl">
              Serving the residents of Hickory Creek in Brandon, Florida.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/documents">
                <FileText aria-hidden="true" size={18} />
                Document access
              </Link>
              <Link className="btn-secondary border-white text-white hover:border-forest" href="/resident-requests">
                <Send aria-hidden="true" size={18} />
                Submit a request
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section grid gap-6 lg:grid-cols-3">
        <HomePanel
          title="Latest Announcements"
          icon={<Megaphone aria-hidden="true" size={22} />}
          href="/announcements"
          cta="All announcements"
        >
          {latestAnnouncements.length ? latestAnnouncements.map((item) => (
            <article key={item.id} className="border-b border-stone/70 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-bold text-forest">{formatDate(item.publishDate)}</p>
              <h2 className="mt-1 font-serif text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6">{item.summary}</p>
            </article>
          )) : <p className="text-sm leading-6">No current announcements.</p>}
        </HomePanel>

        <HomePanel
          title="Upcoming Meetings"
          icon={<CalendarDays aria-hidden="true" size={22} />}
          href="/calendar"
          cta="View calendar"
        >
          {upcomingEvents.length ? upcomingEvents.map((item) => (
            <article key={item.id} className="border-b border-stone/70 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-bold text-forest">{formatDate(item.date)}</p>
              <h2 className="mt-1 font-serif text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6">{item.location}</p>
            </article>
          )) : <p className="text-sm leading-6">No upcoming meetings posted.</p>}
        </HomePanel>

        <HomePanel
          title="Board Documents"
          icon={<Lock aria-hidden="true" size={22} />}
          href="/board-portal"
          cta="Board Portal"
        >
          <p className="text-sm leading-6">
            Association documents are restricted to authorized board members through the secure Board Portal.
          </p>
        </HomePanel>
      </section>

      <section className="bg-white">
        <div className="section grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow">Quick Links</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-burgundy">
              Common resident tasks in one place
            </h2>
            <p className="mt-4 max-w-3xl leading-7">
              Request agenda time, contact the association,
              and keep track of meetings without needing to email the board for routine items.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Board meeting agenda request", "/resident-requests/board-meeting"],
              ["Annual meeting agenda request", "/resident-requests/annual-meeting"],
              ["Contact the association", "/contact"],
              ["Board Portal", "/board-portal"]
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between rounded border border-stone bg-cream px-4 py-4 font-bold text-ink transition hover:border-forest hover:bg-white"
              >
                {label}
                <ArrowRight aria-hidden="true" className="text-forest transition group-hover:translate-x-1" size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function HomePanel({
  title,
  icon,
  href,
  cta,
  children
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="contrast-ring rounded border border-stone bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-bold text-burgundy">{title}</h2>
        <span className="rounded bg-cream p-2 text-forest">{icon}</span>
      </div>
      <div className="space-y-4">{children}</div>
      <Link href={href} className="mt-6 inline-flex items-center gap-2 font-bold text-forest">
        {cta}
        <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </div>
  );
}
