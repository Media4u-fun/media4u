/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import {
  Target, Building2, ShoppingCart, Cpu, Glasses, Rocket,
  ArrowRight, Globe, Users, Star, Heart, type LucideIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

function Reveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 pt-32 pb-24 w-full">
        <div className="max-w-4xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm tracking-[0.2em] uppercase text-zinc-500 mb-8">
            Web Design & VR Studio
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display tracking-tight mb-8">
            Websites that perform.<br /><em>VR that immerses.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
            We craft high-converting websites and immersive virtual experiences
            for businesses that refuse to blend in.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4">
            <Link href="/start-project"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-zinc-950 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors">
              Start a project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/portfolio"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-brand/40 text-zinc-300 rounded-full text-sm font-medium hover:border-brand-light hover:text-white transition-colors">
              See our work
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const offerings: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Target, title: "Landing Pages", desc: "High-converting single pages that capture leads and drive action" },
  { icon: Building2, title: "Business Websites", desc: "Professional multi-page sites that establish credibility and trust" },
  { icon: ShoppingCart, title: "E-Commerce", desc: "Online stores with seamless checkout and inventory management" },
  { icon: Cpu, title: "Web Applications", desc: "Custom apps with dashboards, accounts, and live features" },
  { icon: Glasses, title: "VR Experiences", desc: "Immersive 360-degree environments and virtual storefronts" },
  { icon: Rocket, title: "Complete Solutions", desc: "End-to-end systems with databases, APIs, and admin panels" },
];

function Services() {
  return (
    <section className="py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <Reveal>
          <p className="text-sm tracking-[0.2em] uppercase text-zinc-500 mb-4">What we build</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display mb-16">
            From landing pages to virtual worlds
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offerings.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={0.05 * (i + 1)}>
                <div className="group h-full p-7 rounded-xl bg-[#1a1a21] hover:bg-[#1e1e26] border border-zinc-800/40 hover:border-zinc-700/60 transition-all duration-300">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-5">
                    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { num: "01", title: "Discovery", desc: "We learn about your goals and vision" },
  { num: "02", title: "Design", desc: "We create mockups you can see and feel" },
  { num: "03", title: "Build", desc: "We develop your project with precision" },
  { num: "04", title: "Launch", desc: "We deploy and support your success" },
];

function Process() {
  return (
    <section className="py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <Reveal>
          <p className="text-sm tracking-[0.2em] uppercase text-zinc-500 mb-4">How it works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display mb-16">Four steps to launch</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.1 * (i + 1)}>
              <span className="text-5xl md:text-6xl font-display text-zinc-800 block mb-4">{step.num}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-500 text-sm">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-sm tracking-[0.2em] uppercase text-zinc-500 mb-4">About us</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display mb-8">
              A creative studio built for the digital era
            </h2>
            <div className="space-y-4 text-zinc-400 leading-relaxed">
              <p>Media4U helps businesses, creators, and communities build their online presence - and go beyond it.</p>
              <p>We specialize in professional websites, visual branding, and immersive VR experiences. Every piece works together to strengthen your digital presence.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Web", desc: "Sites that convert", href: "/portfolio" },
                { label: "Brand", desc: "Identity that connects", href: "/services" },
                { label: "VR", desc: "Worlds that immerse", href: "/vr" },
              ].map((item) => (
                <Link key={item.label} href={item.href}
                  className="rounded-lg bg-[#1a1a21] border border-zinc-800/40 hover:border-zinc-700/60 p-5 text-center hover:bg-[#1e1e26] transition-all duration-300 group">
                  <div className="text-xl font-semibold text-white mb-1 group-hover:text-zinc-300 transition-colors">{item.label}</div>
                  <div className="text-xs text-zinc-500">{item.desc}</div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-zinc-500" />
      <span className="text-white font-semibold">{value}</span>
      <span className="text-zinc-500 text-sm">{label}</span>
    </div>
  );
}

function Community() {
  const stats = useQuery(api.community.getCommunityStats);
  const members = useQuery(api.community.getApprovedMembers);
  const thumbnails = (members || []).slice(0, 5);

  return (
    <section className="py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <Reveal>
          <div className="rounded-2xl border border-zinc-700/50 bg-[#16161d] shadow-[0_4px_48px_rgba(0,0,0,0.5)] p-10 md:p-14">
            <div className="flex flex-col lg:flex-row items-start gap-12">
              <div className="flex-1">
                <p className="text-sm tracking-[0.2em] uppercase text-zinc-500 mb-4">Community</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display mb-4">Join our VR community</h2>
                <p className="text-zinc-400 max-w-lg mb-6">A curated showcase of creators building meaningful spaces in the virtual world.</p>
                {stats && (
                  <div className="flex flex-wrap gap-6 mb-8">
                    <Stat icon={Globe} value={stats.totalWorlds} label="Worlds" />
                    <Stat icon={Users} value={stats.totalCreators} label="Creators" />
                    <Stat icon={Star} value={stats.featuredCount} label="Featured" />
                    {stats.totalLikes > 0 && <Stat icon={Heart} value={stats.totalLikes} label="Likes" />}
                  </div>
                )}
                <Link href="/community"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 text-white rounded-full text-sm font-medium hover:border-zinc-500 transition-colors">
                  Explore community <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {thumbnails.length > 0 && (
                <div className="flex-shrink-0 grid grid-cols-3 gap-2 max-w-xs">
                  {thumbnails.map((member, idx) => (
                    <div key={member._id} className={`rounded-lg overflow-hidden border border-zinc-800 ${idx === 0 ? "col-span-2 row-span-2 h-40" : "h-[4.5rem]"}`}>
                      {member.images?.[0] ? (
                        <img src={member.images[0]} alt={member.worldName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-zinc-700" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display mb-6">
            Ready to build something<br /><em>worth visiting?</em>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
            Whether you need a website, a brand refresh, or an immersive VR experience - let&apos;s make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-project"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-zinc-950 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors">
              Start a project <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/services"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-brand/40 text-zinc-300 rounded-full text-sm font-medium hover:border-brand-light hover:text-white transition-colors">
              Explore all services
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      {/* <GlobeShowcase /> */}
      <Services />
      <Process />
      <About />
      <Community />
      <CTA />
    </main>
  );
}
