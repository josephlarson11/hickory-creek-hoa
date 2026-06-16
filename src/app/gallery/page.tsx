"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { galleryImages } from "@/lib/content";
import { collection, getDocs, query as firestoreQuery, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type GalleryImage = {
  id: string;
  title: string;
  src: string;
};

export default function GalleryPage() {
  const [liveImages, setLiveImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    async function loadLiveImages() {
      if (!db) {
        return;
      }

      const snapshot = await getDocs(firestoreQuery(
        collection(db, "galleryItems"),
        where("public", "==", true)
      ));

      setLiveImages(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          title: String(data.title ?? ""),
          src: String(data.src ?? "/images/entrance.jpg")
        };
      }));
    }

    loadLiveImages().catch(() => setLiveImages([]));
  }, []);

  const images = useMemo(() => {
    const staticIds = new Set(liveImages.map((item) => item.id));
    return [...liveImages, ...galleryImages.filter((item) => !staticIds.has(item.id))];
  }, [liveImages]);

  const [active, setActive] = useState<GalleryImage | null>(null);
  const selected = active ?? images[0];

  return (
    <>
      <PageHero eyebrow="Gallery" title="Community photos">
        <p>Photos can be updated by replacing approved image files in the public gallery folder.</p>
      </PageHero>
      <section className="section">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <button key={image.id} type="button" className="group text-left" onClick={() => setActive(image)}>
              <span className="relative block aspect-[4/3] overflow-hidden rounded border border-stone bg-white">
                <Image src={image.src} alt={image.title} fill className="object-cover transition group-hover:scale-105" />
              </span>
              <span className="mt-2 block font-bold text-burgundy">{image.title}</span>
            </button>
          ))}
        </div>
        {selected ? (
          <div className="mt-8 rounded border border-stone bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold text-burgundy">{selected.title}</h2>
              <button className="rounded border border-stone p-2" type="button" onClick={() => setActive(images[0])} aria-label="Reset gallery preview">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="relative mt-4 aspect-video overflow-hidden rounded bg-cream">
              <Image src={selected.src} alt={selected.title} fill className="object-cover" />
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
