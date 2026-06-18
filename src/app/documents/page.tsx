import Link from "next/link";
import { Lock } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Documents",
  description: "Document access information for Hickory Creek Owners Association."
};

export default function DocumentsPage() {
  return (
    <>
      <PageHero eyebrow="Documents" title="Document access is restricted">
        <p>
          Association documents are maintained in the secure board workspace and are not
          available for public download from this website.
        </p>
      </PageHero>
      <section className="section">
        <div className="max-w-2xl rounded border border-stone bg-white p-6 shadow-soft">
          <Lock aria-hidden="true" className="text-forest" size={34} />
          <h2 className="mt-4 font-serif text-2xl font-bold text-burgundy">
            Board document access
          </h2>
          <p className="mt-3 leading-7">
            Authorized board members can sign in to the Board Portal to access
            restricted document links and board-only records.
          </p>
          <Link className="btn-primary mt-5 w-fit" href="/board-portal">
            Go to Board Portal
          </Link>
        </div>
      </section>
    </>
  );
}
