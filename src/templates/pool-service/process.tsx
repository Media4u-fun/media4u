"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Search, ClipboardList, Wrench, RefreshCw } from "lucide-react";
import { defaultPoolContent, type PoolContent } from "./content";

const stepIcons = [Search, ClipboardList, Wrench, RefreshCw];

export function PoolProcess({ content }: { content?: Partial<PoolContent> }) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="process" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            Our{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Process
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {c.process.map((step, i) => {
              const Icon = stepIcons[i] ?? Search;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.15,
                    ease: "easeOut",
                  }}
                  className="relative text-center"
                >
                  {/* Step number + icon */}
                  <div className="relative mx-auto w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex items-center justify-center mb-6 group hover:border-cyan-500/30 transition-colors duration-300">
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {step.step}
                    </div>
                    <Icon className="w-8 h-8 text-cyan-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
