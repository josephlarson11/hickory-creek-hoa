import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Megaphone, Send } from "lucide-react";
import { announcements, documents, events } from "@/lib/content";
import { formatDate } from "@/lib/format";

const latestAnnouncements = announcements.slice(0, 3);
const upcomingEvents = events.slice(0, 3);
const recentDocuments = documents.slice(0, 4);

export default function HomePage() {
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
                View documents
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
          {latestAnnouncements.map((item) => (
            <article key={item.id} className="border-b border-stone/70 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-bold text-forest">{formatDate(item.publishDate)}</p>
              <h2 className="mt-1 font-serif text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6">{item.summary}</p>
            </article>
          ))}
        </HomePanel>

        <HomePanel
          title="Upcoming Meetings"
          icon={<CalendarDays aria-hidden="true" size={22} />}
          href="/calendar"
          cta="View calendar"
        >
          {upcomingEvents.map((item) => (
            <article key={item.id} className="border-b border-stone/70 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-bold text-forest">{formatDate(item.date)}</p>
              <h2 className="mt-1 font-serif text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6">{item.location}</p>
            </article>
          ))}
        </HomePanel>

        <HomePanel
          title="Recent Documents"
          icon={<FileText aria-hidden="true" size={22} />}
          href="/documents"
          cta="Document library"
        >
          {recentDocuments.map((item) => (
            <article key={item.id} className="border-b border-stone/70 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-bold text-forest">{item.category}</p>
              <h2 className="mt-1 font-serif text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6">Updated {formatDate(item.updatedAt)}</p>
            </article>
          ))}
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
              Find approved governing documents, request agenda time, contact the association,
              and keep track of meetings without needing to email the board for routine items.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Board meeting agenda request", "/resident-requests/board-meeting"],
              ["Annual meeting agenda request", "/resident-requests/annual-meeting"],
              ["Contact the association", "/contact"],
              ["Board portal", "/board"]
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
