import { Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata = { title: "Contact", description: "Contact Hickory Creek Owners Association of Brandon Florida." };

export default function ContactPage() {
  const emailActive = process.env.NEXT_PUBLIC_OFFICIAL_EMAIL_ACTIVE === "true";
  return <><PageHero eyebrow="Contact" title="Contact the association"><p>Hickory Creek Owners Association serves the Hickory Creek community in Brandon, Florida.</p></PageHero><section className="section max-w-3xl"><div className="rounded border border-stone bg-white p-6 shadow-soft"><Mail className="text-forest" size={34} aria-hidden="true" /><h2 className="mt-4 font-serif text-2xl font-bold text-burgundy">Official board email</h2><p className="mt-3 font-bold text-forest">board@hickorycreekbrandon.com</p>{emailActive ? <a className="btn-primary mt-5" href="mailto:board@hickorycreekbrandon.com">Send email</a> : <p className="mt-4 rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">Mailbox activation is in progress. Please do not use this address until this notice is removed.</p>}<p className="mt-6 flex items-center gap-2"><MapPin size={18} className="text-forest" aria-hidden="true" />Brandon, Florida</p></div></section></>;
}
