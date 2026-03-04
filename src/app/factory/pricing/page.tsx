"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Check, Zap, Rocket, Crown, ArrowRight,
  Globe, FileText, Calendar, Star, Image,
  Mail, BarChart, Map, Users, Lock,
  MapPin, Clock, MessageSquare, Navigation,
} from "lucide-react";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 79,
    ownPrice: 899,
    ownMaintenance: 39,
    icon: Zap,
    color: "blue",
    description: "Everything you need to get online",
    features: [
      { name: "Core Pages (Home, About, Contact)", icon: Globe },
      { name: "Contact Form", icon: Mail },
      { name: "Photo Gallery", icon: Image },
      { name: "SEO Optimized", icon: BarChart },
      { name: "Mobile Responsive", icon: Globe },
      { name: "SSL Certificate", icon: Lock },
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: 149,
    ownPrice: 1399,
    ownMaintenance: 79,
    icon: Rocket,
    color: "purple",
    popular: true,
    description: "Grow your business with powerful tools",
    features: [
      { name: "Everything in Starter", icon: Check },
      { name: "Blog System", icon: FileText },
      { name: "Online Booking", icon: Calendar },
      { name: "Customer Reviews", icon: Star },
      { name: "Quote Request Widget", icon: Mail },
      { name: "Newsletter Signup", icon: Mail },
      { name: "Email Notifications", icon: Mail },
      { name: "Analytics Dashboard", icon: BarChart },
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 299,
    ownPrice: 1999,
    ownMaintenance: 149,
    icon: Crown,
    color: "amber",
    description: "Full-featured platform for serious businesses",
    features: [
      { name: "Everything in Growth", icon: Check },
      { name: "GPS Service Area Mapping", icon: Map },
      { name: "Client Portal", icon: Users },
      { name: "Integration Hub", icon: Lock },
      { name: "PDF Export (Quotes/Invoices)", icon: FileText },
      { name: "Community Features", icon: Users },
      { name: "Advanced Scheduling", icon: Calendar },
      { name: "Priority Support", icon: Star },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", gradient: "from-blue-500 to-blue-600" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", gradient: "from-purple-500 to-purple-600" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", gradient: "from-amber-500 to-amber-600" },
};

const HIGHLIGHTS = [
  {
    icon: Calendar,
    title: "Online Booking & Scheduling",
    description: "Customers book appointments directly from your site. No phone tag, no missed leads.",
  },
  {
    icon: Map,
    title: "GPS Service Area Mapping",
    description: "Show exactly where you work with interactive maps. Customers see instantly if you cover their area.",
  },
  {
    icon: Star,
    title: "Customer Reviews",
    description: "Collect and showcase real reviews right on your site. Build trust before the first phone call.",
  },
  {
    icon: FileText,
    title: "Quotes & Invoices",
    description: "Generate professional PDF quotes and invoices. Look polished, get paid faster.",
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description: "See who visits your site, where they come from, and what they click. Know what works.",
  },
  {
    icon: MessageSquare,
    title: "Quote Request Widget",
    description: "Visitors request quotes in seconds. Leads land straight in your inbox - ready to close.",
  },
];

export default function PricingPage() {
  const [ownIt, setOwnIt] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <div className="text-center pt-20 pb-16 px-4">
        <Link href="/" className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 inline-block hover:text-cyan-300">
          QuickSite Pro
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Focus on your business.{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            We&apos;ll handle the website.
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
          Professional websites for service businesses - built, managed, and optimized.
          Live in 48 hours. No tech skills needed.
        </p>
        <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10">
          Booking, scheduling, GPS mapping, reviews, quotes - everything a service business needs, built in.
        </p>

        {/* Subscribe / Own It toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${!ownIt ? "text-white" : "text-gray-500"}`}>Subscribe</span>
          <button
            onClick={() => setOwnIt(!ownIt)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              ownIt ? "bg-cyan-500" : "bg-white/20"
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              ownIt ? "translate-x-7" : "translate-x-1"
            }`} />
          </button>
          <span className={`text-sm ${ownIt ? "text-white" : "text-gray-500"}`}>
            Own It
          </span>
        </div>
        {ownIt && (
          <p className="text-xs text-cyan-400/70 mt-2">
            One-time build fee + low monthly maintenance. Your site, your asset.
          </p>
        )}
      </div>

      {/* Pricing cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, idx) => {
          const colors = COLOR_MAP[plan.color];

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-6 rounded-2xl border ${
                plan.popular
                  ? `${colors.border} bg-gradient-to-b from-purple-500/5 to-transparent`
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <plan.icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
              </div>

              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                {ownIt ? (
                  <>
                    <span className="text-4xl font-bold">${plan.ownPrice.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm ml-1">one-time</span>
                    <p className="text-sm text-gray-400 mt-1">+ ${plan.ownMaintenance}/mo maintenance</p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/mo</span>
                  </>
                )}
              </div>

              <Link
                href={`/factory/signup?plan=${plan.key}&type=${ownIt ? "own" : "subscribe"}`}
                className={`block w-full py-3 rounded-xl text-center font-semibold text-sm transition-all mb-6 ${
                  plan.popular
                    ? `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
                    : `${colors.bg} ${colors.text} border ${colors.border} hover:bg-opacity-20`
                }`}
              >
                Get Started
                <ArrowRight className="w-4 h-4 inline-block ml-1" />
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-2 text-sm">
                    <feature.icon className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                    <span className="text-gray-300">{feature.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            More than just a website
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every QuickSite Pro plan comes loaded with tools built specifically for service businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LeadRoute GPS Section */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-4">
                <Navigation className="w-3.5 h-3.5" />
                Built-in LeadRoute GPS Mapping
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Show customers exactly{" "}
                <span className="text-emerald-400">where you work</span>
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                LeadRoute GPS mapping lets your customers see your service area instantly.
                Draw your coverage zones, highlight the neighborhoods you serve, and
                never waste time on out-of-area calls again.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  { icon: MapPin, text: "Interactive service area maps on your site" },
                  { icon: Navigation, text: "Draw custom coverage zones by neighborhood" },
                  { icon: Users, text: "Customers check coverage before they call" },
                  { icon: Clock, text: "Save hours filtering out-of-area leads" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <item.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500">
                Included in the Enterprise plan. Available as an add-on for Growth.{" "}
                <Link href="/leadroute" className="text-emerald-400/70 hover:text-emerald-400">
                  How we use LeadRoute
                </Link>
              </p>
            </div>

            {/* Map visual */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl bg-[#0f1923] border border-emerald-500/10 overflow-hidden relative">
                {/* Fake map grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-emerald-500/10" />
                    ))}
                  </div>
                </div>

                {/* Coverage zone blob */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 border-dashed flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-emerald-400" />
                    </div>

                    {/* Fake pins */}
                    <div className="absolute top-4 right-6 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                    <div className="absolute bottom-8 left-4 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <div className="absolute top-12 left-8 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-4 right-12 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "1.5s" }} />
                  </div>
                </div>

                {/* Label */}
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

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "How fast will my website be live?",
              a: "Most sites go live within 24-48 hours after you provide your business information. We handle the entire setup for you.",
            },
            {
              q: "What's the difference between Subscribe and Own It?",
              a: "Subscribe is a simple monthly fee that covers everything. Own It is a one-time build fee so the site is yours, plus a lower monthly rate for hosting and maintenance. Same great site either way.",
            },
            {
              q: "Can I upgrade my plan later?",
              a: "Yes, you can upgrade or downgrade at any time. New features are enabled instantly when you upgrade.",
            },
            {
              q: "Do I need technical knowledge?",
              a: "Not at all. We build, manage, and maintain your site. You just tell us what you want and we make it happen.",
            },
            {
              q: "What if I want to cancel?",
              a: "You can cancel anytime. No contracts, no cancellation fees. Your site simply goes offline at the end of your billing period.",
            },
          ].map((item) => (
            <div key={item.q} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-2">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
