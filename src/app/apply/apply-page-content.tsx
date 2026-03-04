"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/section";
import { ApplyForm } from "./apply-form";
import { CheckCircle2, Zap, Map, Calendar } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const benefits = [
  {
    icon: CheckCircle2,
    title: "Custom Design",
    description: "Built specifically for your business",
  },
  {
    icon: Zap,
    title: "48-Hour Turnaround",
    description: "See your new site in 2 days",
  },
  {
    icon: Calendar,
    title: "Booking & Scheduling",
    description: "Customers book directly from your site",
  },
  {
    icon: Map,
    title: "GPS Service Mapping",
    description: "Show exactly where you work",
  },
];

export function ApplyPageContent() {
  return (
    <div className="mesh-bg min-h-screen">
      <Section className="pt-32 md:pt-40">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand-light">
            QuickSite Pro
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-6">
            Focus on Your Business
            <br />
            <span className="text-gradient">We&apos;ll Handle the Website</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
            Professional websites for service businesses - starting at $79/mo
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built, managed, and optimized. Live in 48 hours.
            <br />
            Or <strong className="text-gray-300">own it outright</strong> starting at $899.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 lg:gap-16"
        >
          {/* Left Column - More Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                How It Works
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-light font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Fill Out the Form
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Tell us about your business in 2 minutes
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-light font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      We Build Your Site
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Custom design with booking, reviews, and more - ready in 48 hours
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-light font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      You Review & Launch
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Click through every page, test on your phone, and go live
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 bg-gradient-to-br from-brand-dark/20 to-transparent border border-brand-light/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Two Ways to Get Started
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-1">Subscribe</h3>
                  <p className="text-gray-400 text-sm mb-1">
                    Simple monthly plans from $79/mo. Everything included.
                  </p>
                  <p className="text-brand-light text-sm font-medium">$79 / $149 / $299 per month</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-1">Own It</h3>
                  <p className="text-gray-400 text-sm mb-1">
                    One-time build fee + low monthly maintenance. Your site, your asset.
                  </p>
                  <p className="text-brand-light text-sm font-medium">From $899 + $39/mo maintenance</p>
                </div>
              </div>
              <Link
                href="/factory/pricing"
                className="inline-block mt-4 text-sm text-brand-light hover:text-white transition-colors font-medium"
              >
                View full pricing &rarr;
              </Link>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Who Is This For?
              </h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
                  <span>Contractors (doors, HVAC, plumbing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
                  <span>Pool services & home services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
                  <span>Auto services & pest control</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
                  <span>Landscaping & barbershops</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
                  <span>Law firms & professional services</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right Column - Application Form */}
          <motion.div variants={itemVariants}>
            <div className="glass-card p-8 lg:sticky lg:top-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Get Started
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                Fill out this quick form and we&apos;ll get started on your site today
              </p>
              <ApplyForm />
            </div>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}
