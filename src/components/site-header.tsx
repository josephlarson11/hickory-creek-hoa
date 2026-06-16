"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Announcements", "/announcements"],
  ["Documents", "/documents"],
  ["Calendar", "/calendar"],
  ["Gallery", "/gallery"],
  ["Requests", "/resident-requests"],
  ["Contact", "/contact"],
  ["Board", "/board"]
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-stone/80 bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/images/entrance-logo.png" alt="" width={80} height={52} className="h-12 w-auto shrink-0 rounded bg-white" />
          <span className="min-w-0">
            <span className="block truncate font-serif text-lg font-bold text-burgundy">
              Hickory Creek
            </span>
            <span className="block truncate text-xs font-bold uppercase tracking-[0.12em] text-forest">
              Owners Association
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded border border-stone bg-white text-ink lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "rounded px-3 py-2 text-sm font-bold transition",
                  active ? "bg-burgundy text-white" : "text-ink hover:bg-white hover:text-burgundy"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {open ? (
        <div className="border-t border-stone bg-cream px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-3 font-bold hover:bg-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
