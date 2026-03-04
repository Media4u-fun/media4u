"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  category?: string;
}

interface GalleryPageProps {
  items: GalleryItem[];
  categories?: string[];
}

export function GalleryPage({ items, categories = [] }: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const nextImage = () => {
    if (lightboxIndex !== null && lightboxIndex < filtered.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  return (
    <section id="gallery" className="py-20 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
          Our Work
        </h2>
        <p className="text-zinc-400 text-center mb-12">
          Browse our portfolio of completed projects.
        </p>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                !activeCategory
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/[0.05] text-zinc-400 border border-white/[0.06] hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  activeCategory === cat
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/[0.05] text-zinc-400 border border-white/[0.06] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, index) => (
            <div
              key={item._id}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={item.imageUrl}
                alt={item.title || "Gallery image"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                {item.title && (
                  <p className="p-4 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <img
              src={filtered[lightboxIndex].imageUrl}
              alt={filtered[lightboxIndex].title || "Gallery image"}
              className="max-w-[90vw] max-h-[85vh] object-contain"
            />

            {lightboxIndex < filtered.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="absolute bottom-4 text-center w-full">
              {filtered[lightboxIndex].title && (
                <p className="text-sm text-white mb-1">
                  {filtered[lightboxIndex].title}
                </p>
              )}
              <p className="text-xs text-zinc-500">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
