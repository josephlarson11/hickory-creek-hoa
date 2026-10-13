import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[560px] overflow-hidden bg-ink text-white">
        <Image src="/images/entrance.jpg" alt="Hickory Creek entrance monument and landscaping" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="section relative flex min-h-[560px] items-center py-16">
          <div className="max-w-3xl">
            <Image src="/images/entrance-logo.png" alt="Hickory Creek" width={240} height={150} className="h-auto w-44 rounded bg-cream p-2 shadow-soft sm:w-56" />
            <h1 className="mt-7 font-serif text-4xl font-bold leading-tight sm:text-5xl">Hickory Creek Owners Association</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-cream">Serving the 85-home Hickory Creek community in Brandon, Florida.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/sign-in"><LockKeyhole size={18} aria-hidden="true" />Resident sign in</Link>
              <Link className="btn-secondary border-white text-white hover:border-forest" href="/access-request">Request access<ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section grid gap-8 md:grid-cols-3">
        <Info icon={<ShieldCheck />} title="Private community resources">Documents, announcements, proposals, and community activity are available only to approved accounts.</Info>
        <Info icon={<LockKeyhole />} title="Board-reviewed access">Residents verify their email and property information. A board member reviews every request before access is granted.</Info>
        <Info icon={<Mail />} title="Contact the association">Official correspondence will use board@hickorycreekbrandon.com after mail activation is completed.</Info>
      </section>
    </>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="border-t-4 border-forest pt-5"><span className="text-forest">{icon}</span><h2 className="mt-3 font-serif text-2xl font-bold text-burgundy">{title}</h2><p className="mt-3 leading-7">{children}</p></div>;
}
