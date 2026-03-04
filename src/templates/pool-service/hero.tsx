"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Droplets, Waves, ChevronDown } from "lucide-react";
import { defaultPoolContent, type PoolContent } from "./content";

// Floating icon component
function FloatingIcon({
  icon: Icon,
  className,
  delay,
  duration,
}: {
  icon: typeof Droplets;
  className: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none text-cyan-400/20 ${className}`}
      animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
  );
}

export function PoolHero({ content }: { content?: Partial<PoolContent> }) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-[#141419] to-blue-950/30" />

      {/* Animated gradient orb */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(6, 182, 212, 0.4), rgba(59, 130, 246, 0.2), transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating icons */}
      <FloatingIcon
        icon={Droplets}
        className="top-[15%] left-[10%]"
        delay={0}
        duration={6}
      />
      <FloatingIcon
        icon={Waves}
        className="top-[25%] right-[15%]"
        delay={1}
        duration={7}
      />
      <FloatingIcon
        icon={Droplets}
        className="bottom-[30%] left-[20%]"
        delay={2}
        duration={5}
      />
      <FloatingIcon
        icon={Waves}
        className="bottom-[20%] right-[10%]"
        delay={0.5}
        duration={8}
      />
      <FloatingIcon
        icon={Droplets}
        className="top-[60%] left-[5%]"
        delay={1.5}
        duration={6.5}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 pt-32 pb-24 w-full text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-6"
        >
          {c.business.name}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {c.hero.headline}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {c.hero.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href="#quote"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105"
          >
            {c.hero.ctaPrimary}
          </a>
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            {c.hero.ctaSecondary}
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-zinc-500" />
        </motion.div>
      </div>
    </section>
  );
}
