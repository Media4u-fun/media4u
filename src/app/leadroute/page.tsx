"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  MapPin, Navigation, Users, Clock,
  ArrowRight, Check, Map, Compass,
  TrendingUp, Shield, Smartphone, Globe, ExternalLink,
} from "lucide-react";

const WHAT_WE_USE = [
  {
    icon: Map,
    title: "Interactive Service Area Maps",
    description: "Your customers see exactly where you work with a real, interactive map embedded on your QuickSite Pro site.",
  },
  {
    icon: MapPin,
    title: "Address Coverage Check",
    description: "Visitors type in their address and instantly find out if you serve their area. No phone call needed.",
  },
  {
    icon: Shield,
    title: "Lead Filtering",
    description: "Only get inquiries from customers in your coverage zone. No more wasted time on out-of-area leads.",
  },
  {
    icon: Smartphone,
    title: "Mobile-Friendly",
    description: "Works perfectly on phones and tablets - because that is how most of your customers will find you.",
  },
];

const FULL_PLATFORM = [
  { icon: Compass, title: "Smart Route Optimization", description: "Plan daily routes to minimize drive time and hit more jobs." },
  { icon: Users, title: "Team Dispatch", description: "Assign jobs to the closest available tech automatically." },
  { icon: TrendingUp, title: "Coverage Analytics", description: "See where leads come from and which zones convert best." },
  { icon: Navigation, title: "Territory Management", description: "Assign territories to your team with no overlaps or gaps." },
  { icon: Clock, title: "Schedule Builder", description: "Drag-and-drop daily schedules with optimized stop order." },
  { icon: Globe, title: "Multi-Location Support", description: "Manage coverage across multiple offices or regions." },
];

export default function LeadRoutePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold mb-6">
              <Navigation className="w-4 h-4" />
              Powered by LeadRoute
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              GPS mapping on every{" "}
              <span className="text-emerald-400">QuickSite Pro</span> website
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-4">
              We partnered with LeadRoute to bring interactive service area maps to our websites.
              Your customers see where you work - before they ever pick up the phone.
            </p>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10">
              LeadRoute is a full GPS and route management platform built for service businesses.
              We use their mapping technology to power the coverage maps on QuickSite Pro sites.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/factory/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
              >
                Get a QuickSite Pro Website
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://leadroute.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 transition-colors"
              >
                Visit LeadRoute.pro
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* What we use from LeadRoute */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            How we use LeadRoute
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every QuickSite Pro website gets LeadRoute&apos;s mapping technology built right in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {WHAT_WE_USE.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-emerald-500/10 hover:border-emerald-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Map visual */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Customers check your coverage{" "}
                <span className="text-emerald-400">before they call</span>
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The LeadRoute map widget embeds right on your QuickSite Pro site.
                Visitors type in their address and see instantly if you cover their area.
                No more answering calls just to say &quot;sorry, we don&apos;t go there.&quot;
              </p>
              <ul className="space-y-3">
                {[
                  "Included in Enterprise plans",
                  "Available as an add-on for Starter and Growth",
                  "You draw your zones - we set it up",
                  "Branded to match your website",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-xl bg-[#0f1923] border border-emerald-500/10 overflow-hidden relative">
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-emerald-500/10" />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 border-dashed flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="absolute top-4 right-6 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                    <div className="absolute bottom-8 left-4 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <div className="absolute top-12 left-8 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-4 right-12 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "1.5s" }} />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  Your Service Area
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 text-gray-400 text-xs">
                  LeadRoute
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The full LeadRoute platform */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <p className="text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3">
            The Full Platform
          </p>
          <h2 className="text-3xl font-bold mb-3">
            LeadRoute does way more than maps
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We use their mapping for your website - but if you need route optimization,
            team dispatch, territory management, and more, check out the full LeadRoute platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FULL_PLATFORM.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-white/10"
            >
              <feature.icon className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://leadroute.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Explore the full LeadRoute platform at leadroute.pro
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Get LeadRoute mapping on your website
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Every QuickSite Pro Enterprise plan includes LeadRoute GPS mapping built in.
            Want the full platform? Head over to LeadRoute.pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/factory/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
            >
              View QuickSite Pro Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://leadroute.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 text-white font-semibold border border-white/10 hover:bg-white/10 transition-colors"
            >
              Visit LeadRoute.pro
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
