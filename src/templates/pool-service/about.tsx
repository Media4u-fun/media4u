"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import { defaultPoolContent, type PoolContent } from "./content";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function PoolAbout({ content }: { content?: Partial<PoolContent> }) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const stats = [
    { value: c.business.yearsInBusiness, suffix: "+", label: "Years Experience" },
    { value: c.business.poolsServiced, suffix: "+", label: "Pools Serviced" },
    { value: c.business.fiveStarReviews, suffix: "+", label: "5-Star Reviews" },
    { value: c.business.satisfaction, suffix: "%", label: "Satisfaction Rate" },
  ];

  return (
    <section id="about" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Story */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
              About Us
            </p>
            <h2 className="text-3xl md:text-4xl font-display tracking-tight mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {c.business.name}
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              {c.about.story}
            </p>
            <p className="text-zinc-400 leading-relaxed">
              {c.about.mission}
            </p>
          </motion.div>

          {/* Right - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6 text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
