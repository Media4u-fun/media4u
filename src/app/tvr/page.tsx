"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Mic, Heart, Users, Play } from "lucide-react";

export default function TVRHomePage() {
  return (
    <div className="min-h-screen bg-[#1a1025] pt-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/tvr-logo.png"
              alt="Tri Virtual Roundtable"
              width={160}
              height={160}
              priority
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-tvr-light/10 border border-tvr-light/30">
              <Mic className="w-4 h-4 text-tvr-light" />
              <span className="text-sm font-medium text-tvr-light">Faith-Driven Podcast</span>
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-white">
              Where Truth, Faith &<br />
              <span className="bg-gradient-to-r from-tvr-light via-tvr to-tvr-dark bg-clip-text text-transparent">
                Technology Meet
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Three diverse hosts blending real conversations about culture, healing, and the future - all through the lens of faith and innovation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://open.spotify.com/show/2xwFFH8uFmSUMgAU662Xz4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-tvr text-white font-semibold hover:bg-tvr-dark transition-colors"
              >
                <Play className="w-5 h-5" />
                Listen on Spotify
              </a>
              <a
                href="https://youtube.com/@trivirtualroundtable"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/10"
              >
                Watch on YouTube
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hosts Preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-tvr-light text-sm font-medium uppercase tracking-wider">The Hosts</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mt-3">
            Three Voices, One Mission
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "MrHarmony",
              role: "Tech Visionary & VR Creator",
              description: "Faith-driven leader with a background in ministry and innovation. Builds immersive virtual spaces.",
            },
            {
              name: "Iceman",
              role: "The Voice of Truth",
              description: "Grounded, fearless, and brutally honest. A survivalist and conservative thinker who speaks from the heart.",
            },
            {
              name: "Doc Maasi",
              role: "Doctor & Entrepreneur",
              description: "Expertise in health, finance, and mentorship. Brings insight and balance to every episode.",
            },
          ].map((host, idx) => (
            <motion.div
              key={host.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-tvr-light/10 hover:border-tvr-light/30 transition-all hover:translate-y-[-4px]"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tvr-light to-tvr-dark flex items-center justify-center text-white text-2xl font-bold mb-4">
                {host.name.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{host.name}</h3>
              <p className="text-tvr-light text-sm mb-3">{host.role}</p>
              <p className="text-gray-400 text-sm">{host.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/tvr/hosts"
            className="text-tvr-light hover:text-white text-sm font-medium transition-colors"
          >
            Meet the full team &rarr;
          </Link>
        </div>
      </section>

      {/* H.E.A.R.T. Preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-tvr-light/10 via-tvr-deeper/20 to-tvr-bg/30" />
          <div className="absolute inset-0 backdrop-blur-sm border border-tvr-light/10 rounded-3xl" />

          <div className="relative text-center">
            <Heart className="w-12 h-12 text-tvr-light mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              H.E.A.R.T. Initiative
            </h2>
            <p className="text-xl text-tvr-light font-medium mb-4">
              Helping Every American Reconnect Together
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Turning conversations into action. Each host champions a local partner, coordinating real-world service that restores dignity and builds bridges across California, Washington, and Pennsylvania.
            </p>
            <Link
              href="/tvr/heart"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-tvr text-white font-semibold hover:bg-tvr-dark transition-colors"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Shows Callout */}
      <section className="max-w-7xl mx-auto px-6 py-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Users className="w-10 h-10 text-tvr-light mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Live Sunday Broadcasts
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Join us live every Sunday inside our 3D VR showroom on the Multiverse platform. Real talk, real community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://patreon.com/TriVirtualRoundtable"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-tvr-light/20 text-tvr-light font-semibold hover:bg-tvr-light/30 transition-colors border border-tvr-light/30"
            >
              Support on Patreon
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
