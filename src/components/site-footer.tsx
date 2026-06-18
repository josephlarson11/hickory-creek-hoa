import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="section grid gap-8 md:grid-cols-[1fr_1fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Hickory Creek Owners Association</h2>
          <p className="mt-3 text-sm leading-6 text-cream">
            Public information, community notices, and board resources for
            Hickory Creek in Brandon, Florida.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-stone">Contact</h2>
          <div className="mt-3 space-y-3 text-sm text-cream">
            <a href="mailto:info@hickorycreekbrandon.com" className="flex items-center gap-2 hover:text-white">
              <Mail aria-hidden="true" size={17} />
              info@hickorycreekbrandon.com
            </a>
            <p className="flex items-center gap-2">
              <MapPin aria-hidden="true" size={17} />
              Brandon, Florida
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-stone">Resident Resources</h2>
          <div className="mt-3 grid gap-2 text-sm text-cream">
            <Link href="/documents" className="hover:text-white">Document access</Link>
            <Link href="/calendar" className="hover:text-white">Community calendar</Link>
            <Link href="/resident-requests" className="hover:text-white">Submission forms</Link>
            <Link href="/board-portal" className="hover:text-white">Board Portal</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-xs text-cream">
        Copyright {new Date().getFullYear()} Hickory Creek Owners Association of Brandon Florida.
      </div>
    </footer>
  );
}
