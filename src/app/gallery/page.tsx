"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { galleryImages } from "@/lib/content";

export default function GalleryPage() {
  const [active, setActive] = useState(galleryImages[0]);

  return (
    <>
      <PageHero eyebrow="Gallery" title="Community photos">
        <p>Photos can be updated by replacing approved image files in the public gallery folder.</p>
      </PageHero>
      <section className="section">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((image) => (
            <button key={image.id} type="button" className="group text-left" onClick={() => setActive(image)}>
              <span className="relative block aspect-[4/3] overflow-hidden rounded border border-stone bg-white">
                <Image src={image.src} alt={image.title} fill className="object-cover transition group-hover:scale-105" />
              </span>
              <span className="mt-2 block font-bold text-burgundy">{image.title}</span>
            </button>
          ))}
        </div>
        {active ? (
          <div className="mt-8 rounded border border-stone bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold text-burgundy">{active.title}</h2>
              <button className="rounded border border-stone p-2" type="button" onClick={() => setActive(galleryImages[0])} aria-label="Reset gallery preview">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="relative mt-4 aspect-video overflow-hidden rounded bg-cream">
              <Image src={active.src} alt={active.title} fill className="object-cover" />
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
