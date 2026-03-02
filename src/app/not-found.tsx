"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, MessageCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen mesh-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-8xl md:text-9xl font-display font-bold text-white/10 mb-4"
        >
          404
        </motion.p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-zinc-950 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-zinc-300 rounded-full text-sm font-medium hover:border-white/40 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Us
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
