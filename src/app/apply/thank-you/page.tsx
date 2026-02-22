"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui/section";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6"
          >
            You&apos;re In!
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Your application has been received
          </motion.p>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              What Happens Next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-light font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    I&apos;ll Review Your Application
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Usually within 48 hours
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-light font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    I&apos;ll Start Building Your Site
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Custom design based on your business
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-light font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    You&apos;ll Get a Preview Link
                  </h3>
                  <p className="text-gray-400 text-sm">
                    See your new site live before deciding
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-gray-400 mb-6">
              Check your email for updates. We&apos;ll be in touch soon!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-zinc-700 text-zinc-300 rounded-full text-sm font-medium hover:border-zinc-600 hover:text-white transition-colors"
              >
                <Home className="h-5 w-5" />
                Back to Home
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-brand-light to-brand-dark text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                View Our Work
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 p-6 glass-card bg-gradient-to-br from-brand-dark/20 to-transparent border border-brand-light/20"
          >
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Just Doors Inc</strong> got their site in 48 hours.
              <br />
              <span className="text-gray-400">You&apos;re next.</span>
            </p>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}
