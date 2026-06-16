"use client";

import { useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { events } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default function CalendarPage() {
  const [view, setView] = useState<"list" | "month">("list");

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
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((event) => <EventCard key={event.id} event={event} compact />)}
          </div>
        )}
      </section>
    </>
  );
}

function EventCard({ event, compact = false }: { event: (typeof events)[number]; compact?: boolean }) {
  return (
    <article className="rounded border border-stone bg-white p-6 shadow-soft">
      <p className="text-sm font-bold text-forest">{event.type}</p>
      <h2 className="mt-2 font-serif text-2xl font-bold text-burgundy">{event.title}</h2>
      <p className="mt-3 font-bold">{formatDate(event.date)} at {event.time}</p>
      {!compact ? <p className="mt-2 leading-7">{event.location}</p> : null}
    </article>
  );
}
