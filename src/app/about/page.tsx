import Image from "next/image";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "About",
  description: "Learn about Hickory Creek Owners Association in Brandon, Florida."
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About the Community" title="A small Brandon neighborhood with an established Florida character">
        <p>
          Hickory Creek is an 85-home community in Brandon, Florida, organized to preserve property
          values, maintain common interests, and keep residents informed.
        </p>
      </PageHero>
      <section className="section grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Image
          src="/images/entrance.jpg"
          alt="Hickory Creek entrance monument"
          width={1200}
          height={760}
          className="rounded border border-stone object-cover shadow-soft"
        />
        <div className="space-y-6">
          <Info title="HOA Mission">
            Maintain a professional, transparent, and neighborly association that protects the
            appearance and long-term value of Hickory Creek while making official information easy
            for residents to access.
          </Info>
          <Info title="Location">
            Hickory Creek is located in Brandon, Florida, with access to local services, schools,
            shopping, and the broader Tampa Bay area.
          </Info>
          <Info title="Community History">
            The neighborhood identity is anchored by its entrance monument, mature oak canopy, and
            the distinct phases documented in the community restrictions.
          </Info>
        </div>
      </section>
    </>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-l-4 border-forest bg-white p-5 shadow-soft">
      <h2 className="font-serif text-2xl font-bold text-burgundy">{title}</h2>
      <p className="mt-2 leading-7">{children}</p>
    </article>
  );
}
