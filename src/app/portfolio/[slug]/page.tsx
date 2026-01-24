"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

interface ProjectDetail {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  fullDescription?: string;
  gradient: string;
  images?: string[];
  technologies?: string[];
  results?: string[];
  testimonial?: string;
  featured: boolean;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = useQuery(api.portfolio.getProjectBySlug, { slug });

  if (project === undefined) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Section className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-8">We couldn't find the project you're looking for.</p>
          <Link href="/portfolio">
            <Button variant="primary">Back to Portfolio</Button>
          </Link>
        </Section>
      </div>
    );
  }

  const hasImages = project.images && project.images.length > 0;
  const mainImage = hasImages ? project.images[0] : null;
  const galleryImages = hasImages ? project.images.slice(1) : [];

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
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImage}
                    alt={project.title}
                    className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
                  />
                </>
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
                  className="overflow-hidden rounded-2xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full aspect-video object-cover"
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
                "{project.testimonial}"
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
            Let's create something amazing together. Get in touch with our team today.
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
    </div>
  );
}
