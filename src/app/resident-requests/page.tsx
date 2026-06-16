import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Resident Requests",
  description: "Submit board meeting or annual meeting agenda requests."
};

export default function ResidentRequestsPage() {
  return (
    <>
      <PageHero eyebrow="Resident Submissions" title="Submit agenda requests online">
        <p>Requests are stored with a status of Submitted, then reviewed by authorized board members.</p>
      </PageHero>
      <section className="section grid gap-5 md:grid-cols-2">
        <RequestLink title="Board Meeting Agenda Request" href="/resident-requests/board-meeting" />
        <RequestLink title="Annual Meeting Agenda Request" href="/resident-requests/annual-meeting" />
      </section>
    </>
  );
}

function RequestLink({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href} className="group rounded border border-stone bg-white p-6 shadow-soft transition hover:border-forest">
      <h2 className="font-serif text-2xl font-bold text-burgundy">{title}</h2>
      <p className="mt-3 leading-7">Provide your name, address, email, topic, description, and optional attachment.</p>
      <span className="mt-5 inline-flex items-center gap-2 font-bold text-forest">
        Open form <ArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" size={17} />
      </span>
    </Link>
  );
}
