import Link from "next/link";
import { Lock, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="section grid gap-8 md:grid-cols-[1fr_1fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl font-bold">Hickory Creek Owners Association</h2>
          <p className="mt-3 text-sm leading-6 text-cream">
            Essential association information and secure resident services for Hickory Creek in Brandon, Florida.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-stone">Contact</h2>
          <div className="mt-3 space-y-3 text-sm text-cream">
            <a href="mailto:board@hickorycreekbrandon.com" className="flex items-center gap-2 hover:text-white">
              <Mail aria-hidden="true" size={17} />
              board@hickorycreekbrandon.com
            </a>
            <p className="flex items-center gap-2">
              <MapPin aria-hidden="true" size={17} />
              Brandon, Florida
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-stone">Secure Access</h2>
          <div className="mt-3 grid gap-2 text-sm text-cream">
            <Link href="/sign-in" className="flex items-center gap-2 hover:text-white"><Lock size={16} />Sign in</Link>
            <Link href="/access-request" className="hover:text-white">Request resident access</Link>
            <Link href="/contact" className="hover:text-white">Contact information</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-xs text-cream">
        Copyright {new Date().getFullYear()} Hickory Creek Owners Association of Brandon Florida.
      </div>
    </footer>
  );
}
