"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Droplets,
  Wrench,
  Cpu,
  Paintbrush,
  Thermometer,
  Shield,
} from "lucide-react";
import { defaultPoolContent, type PoolContent } from "./content";

const iconMap = {
  Droplets,
  Wrench,
  Cpu,
  Paintbrush,
  Thermometer,
  Shield,
} as const;

function ServiceCard({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = iconMap[icon] ?? Droplets;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6 hover:bg-white/[0.06] hover:border-cyan-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 hover:scale-[1.02]"
    >
      {/* Gradient border glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-colors duration-300">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function PoolServices({ content }: { content?: Partial<PoolContent> }) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="services" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            Our{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.services.map((service, i) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
