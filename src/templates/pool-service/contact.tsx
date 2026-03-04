"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Phone, Mail, MapPin } from "lucide-react";
import { defaultPoolContent, type PoolContent } from "./content";

export function PoolContact({ content }: { content?: Partial<PoolContent> }) {
  const c = { ...defaultPoolContent, ...content };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const contactItems = [
    { icon: Phone, label: "Call Us", value: c.business.phone },
    { icon: Mail, label: "Email Us", value: c.business.email },
    { icon: MapPin, label: "Service Area", value: c.business.address },
  ];

  return (
    <section id="contact" className="py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-cyan-400 mb-4">
            Get in Touch
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
            Contact{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Us
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {contactItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-white font-medium">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent" />

          <div className="relative z-10 px-8 py-12 md:py-16 text-center">
            <h3 className="text-2xl md:text-3xl font-display text-white mb-4">
              Ready for a Sparkling Clean Pool?
            </h3>
            <p className="text-cyan-100/80 mb-8 max-w-xl mx-auto">
              Get your free, no-obligation quote today. Most new customers are
              set up within 48 hours.
            </p>
            <a
              href="#quote"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-700 rounded-full font-semibold hover:bg-cyan-50 transition-colors shadow-lg"
            >
              Get Your Free Quote
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
