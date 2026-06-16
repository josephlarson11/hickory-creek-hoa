import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://hickorycreekbrandon.com"),
  title: {
    default: "Hickory Creek Owners Association of Brandon Florida",
    template: "%s | Hickory Creek Owners Association"
  },
  description:
    "Public HOA information, governing documents, meeting minutes, announcements, calendar, resident forms, and board resources for Hickory Creek in Brandon, Florida.",
  openGraph: {
    title: "Hickory Creek Owners Association of Brandon Florida",
    description:
      "Serving the residents of Hickory Creek in Brandon, Florida.",
    url: "https://hickorycreekbrandon.com",
    siteName: "Hickory Creek Owners Association",
    locale: "en_US",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
