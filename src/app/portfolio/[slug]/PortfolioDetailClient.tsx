"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PortfolioProject {
  _id: string
  title: string
  slug: string
  category: string
  description: string
  fullDescription?: string
  gradient: string
  featured: boolean
  technologies?: string[]
  images?: string[]
  testimonial?: string
  results?: string[]
  createdAt: number
  updatedAt: number
}

export function PortfolioDetailClient({ project }: { project: PortfolioProject }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hasImages = project.images && project.images.length > 0;
  const mainImage = hasImages ? project.images![0] : null;
  const galleryImages = hasImages ? project.images!.slice(1) : [];
  const allImages = hasImages ? project.images! : [];

  return (
    <div className="min-h-screen mesh-bg">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-sm font-semibold mb-6 uppercase tracking-wider">
                {project.category}
              </span>

              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                {project.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {project.description}
              </p>

              {project.technologies && project.technologies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-3"
                >
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Right: Image (16:9) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              {mainImage ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedImage(mainImage)}
                  className="cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImage}
                    alt={project.title}
                    className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
                  />
                </motion.div>
              ) : (
                <div className={`aspect-video bg-gradient-to-br ${project.gradient} rounded-2xl shadow-2xl`} />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Description Section */}
      {project.fullDescription && (
        <Section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">About This Project</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
                {project.fullDescription}
              </p>
            </div>
          </motion.div>
        </Section>
      )}

      {/* Results Section */}
      {project.results && project.results.length > 0 && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12">Results & Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/[0.06] hover:border-cyan-500/30 transition-all"
                >
                  <p className="text-gray-300 text-lg">{result}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>
      )}

      {/* Gallery Section */}
      {hasImages && galleryImages.length > 0 && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12">Project Gallery</h2>
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
      {project.testimonial && (
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
                &quot;{project.testimonial}&quot;
              </p>
              <div className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-sm font-semibold">
                Client Testimonial
              </div>
            </div>
          </motion.div>
        </Section>
      )}

      {/* CTA Section */}
      <Section className="py-20 border-t border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Let&apos;s create something amazing together. Get in touch with our team today.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Get In Touch
            </Button>
          </Link>
        </motion.div>
      </Section>

      {/* Navigation */}
      <div className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between">
          <Link href="/portfolio" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Portfolio
          </Link>
          <div className="text-gray-500 text-sm">
            {project.category}
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
