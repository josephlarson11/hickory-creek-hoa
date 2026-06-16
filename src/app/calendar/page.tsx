"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CalendarEvent, events } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { collection, getDocs, query as firestoreQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CalendarPage() {
  const [view, setView] = useState<"list" | "month">("list");
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    async function loadLiveEvents() {
      if (!db) {
        return;
      }

      const snapshot = await getDocs(firestoreQuery(
        collection(db, "calendarEvents"),
        where("public", "==", true)
      ));

      setLiveEvents(snapshot.docs.map((item) => {
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

    loadLiveEvents().catch(() => setLiveEvents([]));
  }, []);

  const allEvents = useMemo(() => {
    const staticIds = new Set(liveEvents.map((item) => item.id));
    return [...liveEvents, ...events.filter((item) => !staticIds.has(item.id))]
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [liveEvents]);

  return (
    <>
      <PageHero eyebrow="Calendar" title="Meetings, annual events, and association deadlines">
        <p>View upcoming board meetings, annual meeting notices, and community events.</p>
      </PageHero>
      <section className="section">
        <div className="mb-6 inline-flex rounded border border-stone bg-white p-1">
          <button className={view === "list" ? "btn-primary" : "btn-secondary border-transparent"} onClick={() => setView("list")} type="button">
            <List aria-hidden="true" size={17} /> List
          </button>
          <button className={view === "month" ? "btn-primary" : "btn-secondary border-transparent"} onClick={() => setView("month")} type="button">
            <CalendarDays aria-hidden="true" size={17} /> Month
          </button>
        </div>
        {view === "list" ? (
          <div className="grid gap-5">
            {allEvents.length ? allEvents.map((event) => <EventCard key={event.id} event={event} />) : <EmptyCalendar />}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {allEvents.length ? allEvents.map((event) => <EventCard key={event.id} event={event} compact />) : <EmptyCalendar />}
          </div>
        )}
      </section>
    </>
  );
}

function EmptyCalendar() {
  return (
    <p className="rounded border border-stone bg-white p-6 shadow-soft">
      No public calendar events are currently posted.
    </p>
  );
}

function EventCard({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  return (
    <article className="rounded border border-stone bg-white p-6 shadow-soft">
      <p className="text-sm font-bold text-forest">{event.type}</p>
      <h2 className="mt-2 font-serif text-2xl font-bold text-burgundy">{event.title}</h2>
      <p className="mt-3 font-bold">{formatDate(event.date)} at {event.time}</p>
      {!compact ? <p className="mt-2 leading-7">{event.location}</p> : null}
    </article>
  );
}
