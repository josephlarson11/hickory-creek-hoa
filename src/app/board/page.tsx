import { Mail } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { boardMembers } from "@/lib/content";

export const metadata = {
  title: "Board",
  description: "Current Hickory Creek Owners Association board members."
};

export default function BoardPage() {
  return (
    <>
      <PageHero eyebrow="Board" title="Board of Directors">
        <p>
          Current board positions for Hickory Creek Owners Association of Brandon Florida.
          For board-only tools, use the Board Portal link in the footer.
        </p>
      </PageHero>

      <section className="section">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {boardMembers.map((member) => (
            <article key={member.position} className="rounded border border-stone bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-forest">
                {member.position}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-burgundy">
                {member.name}
              </h2>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded border border-stone bg-cream p-6">
          <h2 className="font-serif text-2xl font-bold text-burgundy">Contact the Board</h2>
          <a className="mt-3 inline-flex items-center gap-2 font-bold text-forest" href="mailto:info@hickorycreekbrandon.com">
            <Mail aria-hidden="true" size={18} />
            info@hickorycreekbrandon.com
          </a>
        </div>
      </section>
    </>
  );
}
