"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder images - real client would supply their own
const placeholderImages = [
  { src: "/placeholder-pool-1.jpg", alt: "Sparkling clean pool", caption: "Weekly Maintenance" },
  { src: "/placeholder-pool-2.jpg", alt: "Pool resurfacing", caption: "Resurfacing Project" },
  { src: "/placeholder-pool-3.jpg", alt: "Equipment installation", caption: "New Pump Install" },
  { src: "/placeholder-pool-4.jpg", alt: "Green to clean", caption: "Green-to-Clean Rescue" },
  { src: "/placeholder-pool-5.jpg", alt: "Pool lighting", caption: "LED Lighting Upgrade" },
  { src: "/placeholder-pool-6.jpg", alt: "Backyard oasis", caption: "Complete Renovation" },
];

function LightboxModal({
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  images: typeof placeholderImages;
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <div
        className="max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Placeholder colored box since we don't have real images yet */}
        <div className="aspect-video rounded-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-display text-white mb-2">
              {images[index].caption}
            </p>
            <p className="text-sm text-zinc-400">
              {images[index].alt}
            </p>
            <p className="text-xs text-zinc-500 mt-4">
              Photo {index + 1} of {images.length}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </motion.div>
  );
}

export function PoolGallery({
  images = placeholderImages,
}: {
  images?: typeof placeholderImages;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
            Our Work
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            Project{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="break-inside-avoid group cursor-pointer"
              onClick={() => setLightboxIndex(i)}
            >
              <div
                className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-white/[0.06] group-hover:border-cyan-500/20 transition-all duration-300 ${
                  i % 3 === 0
                    ? "aspect-[4/5]"
                    : i % 3 === 1
                      ? "aspect-square"
                      : "aspect-[4/3]"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-zinc-500">{img.caption}</p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-sm font-medium text-white">
                    {img.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <LightboxModal
            images={images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={() =>
              setLightboxIndex((prev) =>
                prev !== null ? (prev + 1) % images.length : 0
              )
            }
            onPrev={() =>
              setLightboxIndex((prev) =>
                prev !== null
                  ? (prev - 1 + images.length) % images.length
                  : 0
              )
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}
