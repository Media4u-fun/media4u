"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Zap, Rocket, Crown, Loader2, ArrowLeft,
  Building2, Mail, Globe, Check,
} from "lucide-react";

const PLAN_INFO = {
  starter: { name: "Starter", price: 79, icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  growth: { name: "Growth", price: 149, icon: Rocket, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  enterprise: { name: "Enterprise", price: 299, icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const planKey = (searchParams?.get("plan") || "starter") as keyof typeof PLAN_INFO;
  const plan = PLAN_INFO[planKey] || PLAN_INFO.starter;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !business.trim()) return;

    setSubmitting(true);

    // For now, this just shows a success message.
    // In production, this would create a Stripe Checkout session
    // and redirect to payment.
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">You&apos;re all set!</h1>
          <p className="text-gray-400 mb-6">
            We&apos;ve received your signup for the <span className={plan.color}>{plan.name}</span> plan.
            Our team will reach out within 24 hours to get your site started.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Check your email ({email}) for next steps.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium text-sm hover:bg-cyan-500/30 transition-all"
          >
            Back to Media4U
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Link
          href="/factory/pricing"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pricing
        </Link>

        {/* Plan badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${plan.bg} ${plan.color} border ${plan.border} text-sm font-semibold mb-4`}>
          <plan.icon className="w-4 h-4" />
          {plan.name} - ${plan.price}/mo
        </div>

        <h1 className="text-2xl font-bold mb-2">Get your website started</h1>
        <p className="text-gray-400 text-sm mb-8">
          Fill out your info and we&apos;ll have your site ready within 24-48 hours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Your Name *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@business.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Business Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Orangecrest Pools"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Industry</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Pool service"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !email.trim() || !business.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Start My Website
                <Check className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-600 text-center mt-3">
            By signing up you agree to our terms of service. Your site will be set up within 24-48 hours.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
