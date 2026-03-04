"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star, Quote } from "lucide-react";
import { defaultPoolContent, type PoolContent } from "./content";

function ReviewCard({
  name,
  location,
  rating,
  text,
  index,
}: {
  name: string;
  location: string;
  rating: number;
  text: string;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      className="relative rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6"
    >
      <Quote className="w-8 h-8 text-cyan-500/20 mb-4" />

      <div className="flex gap-1 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-cyan-400 text-cyan-400"
          />
        ))}
      </div>

      <p className="text-zinc-300 text-sm leading-relaxed mb-4">
        &ldquo;{text}&rdquo;
      </p>

      <div>
        <p className="text-white font-medium text-sm">{name}</p>
        <p className="text-zinc-500 text-xs">{location}</p>
      </div>
    </motion.div>
  );
}

export function PoolReviews({ content }: { content?: Partial<PoolContent> }) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="reviews" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            What Our Clients{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {c.reviews.map((review, i) => (
            <ReviewCard key={review.name} {...review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
