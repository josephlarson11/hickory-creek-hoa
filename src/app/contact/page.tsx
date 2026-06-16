import { Mail } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ResidentRequestForm } from "@/components/resident-request-form";

export const metadata = {
  title: "Contact",
  description: "Contact Hickory Creek Owners Association of Brandon Florida."
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Contact the association">
        <p>
          Email the association at{" "}
          <a className="font-bold text-burgundy underline" href="mailto:info@hickorycreekbrandon.com">
            info@hickorycreekbrandon.com
          </a>{" "}
          or use the contact form.
        </p>
      </PageHero>
      <section className="section grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded border border-stone bg-white p-6 shadow-soft">
          <Mail aria-hidden="true" className="text-forest" size={34} />
          <h2 className="mt-4 font-serif text-2xl font-bold text-burgundy">Association Email</h2>
          <a className="mt-3 block break-words font-bold text-forest" href="mailto:info@hickorycreekbrandon.com">
            info@hickorycreekbrandon.com
          </a>
        </div>
        <ResidentRequestForm kind="contact" title="Contact Form" includeTopic={false} />
      </section>
    </>
  );
}
