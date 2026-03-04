"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Send, CheckCircle } from "lucide-react";
import { defaultPoolContent, type PoolContent } from "./content";

export function PoolQuoteForm({
  content,
}: {
  content?: Partial<PoolContent>;
}) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // In production, this would call a Convex mutation
    setSubmitted(true);
  }

  return (
    <section id="quote" className="py-24 relative" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
            Free Estimate
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            Get a{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Quick Quote
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-8"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

          {submitted ? (
            <div className="relative z-10 text-center py-12">
              <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-display text-white mb-2">
                Quote Request Sent!
              </h3>
              <p className="text-zinc-400">
                We will get back to you within 24 hours with a custom quote.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">
                    Service Needed
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  >
                    <option value="" className="bg-zinc-900">
                      Select a service
                    </option>
                    {c.quoteForm.serviceTypes.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">
                    Pool Type
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  >
                    <option value="" className="bg-zinc-900">
                      Select pool type
                    </option>
                    {c.quoteForm.poolTypes.map((p) => (
                      <option key={p} value={p} className="bg-zinc-900">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">
                  Zip Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="92508"
                  maxLength={10}
                  className="w-full sm:w-48 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 mt-2"
              >
                <Send className="w-4 h-4" />
                Request Free Quote
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
