"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { useState } from "react";
import { Coins } from "lucide-react";

interface VRExperience {
  _id: string
  title: string
  slug: string
  type: "property" | "destination"
  categories: string[]
  description: string
  fullDescription?: string
  thumbnailImage: string
  gallery?: string[]
  features?: Array<{
    name: string
    description: string
  }>
  multiverseUrl?: string
  websiteUrl?: string
  contactEmail?: string
  price?: number
  gradient: string
  featured: boolean
  testimonial?: string
  createdAt: number
  updatedAt: number
}

export function VRDetailClient({ experience }: { experience: VRExperience }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const allImages = [experience.thumbnailImage, ...(experience.gallery || [])];
  const galleryImages = experience.gallery && experience.gallery.length > 0 ? experience.gallery : [];

  return (
    <div className="min-h-screen mesh-bg">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap gap-2 mb-6">
                {experience.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-block px-4 py-2 rounded-full bg-brand-light/20 border border-brand-light/50 text-brand-light text-xs font-semibold uppercase tracking-wider"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                {experience.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {experience.description}
              </p>

              {/* Price Display */}
              {experience.price !== undefined && experience.price > 0 && (
                <div className="mb-8 inline-block">
                  <div className="px-6 py-3 rounded-lg bg-brand-light/10 border border-brand-light/50">
                    <p className="text-sm text-brand-light mb-1">Price</p>
                    <p className="text-2xl font-display font-bold text-brand-light flex items-center gap-2">
                      <Coins className="w-6 h-6" /> {experience.price.toLocaleString()} Meta Coins
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {experience.multiverseUrl && (
                  <a href={experience.multiverseUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="lg">
                      View in Multiverse
                    </Button>
                  </a>
                )}
                {experience.websiteUrl && (
                  <a href={experience.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="lg">
                      Visit Website
                    </Button>
                  </a>
                )}
                {experience.contactEmail && (
                  <a href={`mailto:${experience.contactEmail}`}>
                    <Button variant="ghost" size="lg">
                      Request Info
                    </Button>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Right: Main Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedImage(experience.thumbnailImage)}
                className="cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={experience.thumbnailImage}
                  alt={experience.title}
                  className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Description Section */}
      {experience.fullDescription && (
        <Section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">About This Experience</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
                {experience.fullDescription}
              </p>
            </div>
          </motion.div>
        </Section>
      )}

      {/* Features Section */}
      {experience.features && experience.features.length > 0 && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12">Features & Amenities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experience.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-brand-light/10 to-brand-dark/10 border border-white/[0.06] hover:border-brand-light/30 transition-all"
                >
                  <h3 className="font-semibold text-white mb-2">{feature.name}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>
      )}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12">Photo Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(image)}
                  className="overflow-hidden rounded-2xl cursor-pointer group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full aspect-video object-cover group-hover:brightness-75 transition-all"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>
      )}

      {/* Testimonial Section */}
      {experience.testimonial && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
              <p className="text-2xl text-gray-300 italic mb-6 leading-relaxed">
                &quot;{experience.testimonial}&quot;
              </p>
              <div className="inline-block px-4 py-2 rounded-full bg-brand-light/20 border border-brand-light/50 text-brand-light text-sm font-semibold">
                Experience Testimonial
              </div>
            </div>
          </motion.div>
        </Section>
      )}

      {/* CTA Section */}
      {(experience.multiverseUrl || experience.websiteUrl || experience.contactEmail) && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              {experience.type === "property" ? "Ready to Own Your Digital Space?" : "Ready to Explore?"}
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              {experience.type === "property"
                ? "Take the next step in your virtual journey."
                : "Step into the future of virtual experiences."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {experience.multiverseUrl && (
                <a href={experience.multiverseUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg">
                    {experience.type === "property" ? "View Property" : "Enter Experience"}
                  </Button>
                </a>
              )}
              {experience.contactEmail && (
                <a href={`mailto:${experience.contactEmail}`}>
                  <Button variant="secondary" size="lg">
                    Get in Touch
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </Section>
      )}

      {/* Navigation */}
      <div className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between">
          <Link href="/vr" className="text-brand-light hover:text-brand-light transition-colors">
            ← Back to VR Experiences
          </Link>
          <div className="text-gray-500 text-sm">
            {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Gallery preview"
              className="w-full h-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/20"
            >
              ✕
            </button>

            {/* Navigation buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const currentIdx = allImages.indexOf(selectedImage);
                    const prevIdx = currentIdx === 0 ? allImages.length - 1 : currentIdx - 1;
                    setSelectedImage(allImages[prevIdx]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/20"
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    const currentIdx = allImages.indexOf(selectedImage);
                    const nextIdx = currentIdx === allImages.length - 1 ? 0 : currentIdx + 1;
                    setSelectedImage(allImages[nextIdx]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/20"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
