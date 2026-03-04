"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Check, Zap, Rocket, Crown, ArrowRight,
  Globe, FileText, Calendar, Star, Image,
  Mail, BarChart, Map, Users, Lock,
} from "lucide-react";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 79,
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

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="text-center pt-20 pb-12 px-4">
        <Link href="/" className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 inline-block hover:text-cyan-300">
          Media4U Website Factory
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          A website that works{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            as hard as you do
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Professional websites for service businesses. Built, managed, and optimized - so you can focus on what you do best.
        </p>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? "text-white" : "text-gray-500"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              annual ? "bg-cyan-500" : "bg-white/20"
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              annual ? "translate-x-7" : "translate-x-1"
            }`} />
          </button>
          <span className={`text-sm ${annual ? "text-white" : "text-gray-500"}`}>
            Annual <span className="text-green-400 text-xs">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, idx) => {
          const colors = COLOR_MAP[plan.color];
          const price = annual ? Math.round(plan.price * 0.8) : plan.price;

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
                <span className="text-4xl font-bold">${price}</span>
                <span className="text-gray-500">/mo</span>
                {annual && (
                  <span className="text-xs text-gray-600 ml-2 line-through">${plan.price}/mo</span>
                )}
              </div>

              <Link
                href={`/factory/signup?plan=${plan.key}`}
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
