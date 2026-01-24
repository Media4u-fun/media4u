"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card, CardIcon } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Innovation",
    description:
      "We push the boundaries of what's possible, embracing cutting-edge technology to create experiences that captivate and inspire.",
    glow: "cyan" as const,
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Collaboration",
    description:
      "Your vision drives our work. We partner closely with every client to transform ideas into immersive digital realities.",
    glow: "purple" as const,
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    title: "Excellence",
    description:
      "Quality is non-negotiable. Every pixel, every interaction, every experience is crafted to exceed expectations.",
    glow: "magenta" as const,
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We dive deep into your goals, audience, and vision to understand what makes your project unique.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Concepts evolve into stunning visuals and interactive prototypes that bring your vision to life.",
  },
  {
    number: "03",
    title: "Development",
    description:
      "Our engineers transform designs into high-performance, immersive digital experiences.",
  },
  {
    number: "04",
    title: "Delivery",
    description:
      "Rigorous testing and optimization ensure a flawless launch that exceeds expectations.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function AboutContent(): ReactElement {
  return (
    <div className="mesh-bg">
      {/* Hero Section */}
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6">
            The Team Behind{" "}
            <span className="text-gradient-cyber">Media4U</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            We are creators, innovators, and dreamers dedicated to crafting
            immersive digital experiences that blur the line between reality and
            imagination.
          </p>
        </motion.div>
      </Section>

      {/* Mission & Values Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-purple-400">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Building the Future of{" "}
              <span className="text-gradient-cyber">Digital Reality</span>
            </h2>
            <div className="space-y-4 text-gray-400">
              <p>
                At Media4U, we believe technology should inspire wonder. Our
                mission is to create immersive VR environments and digital
                solutions that connect people, spark creativity, and transform
                the way we experience the digital world.
              </p>
              <p>
                From custom multiverse experiences to stunning web platforms, we
                combine artistic vision with technical excellence to deliver
                projects that leave lasting impressions.
              </p>
            </div>
            {/* Decorative Element */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
          </motion.div>

          {/* Value Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {VALUES.map((value) => (
              <motion.div key={value.title} variants={itemVariants}>
                <Card glow={value.glow} className="flex items-start gap-4">
                  <CardIcon>{value.icon}</CardIcon>
                  <div>
                    <h3 className="text-xl font-display font-semibold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Process Timeline */}
      <Section className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2" />

        <SectionHeader
          tag="Our Process"
          title="From Vision to "
          highlight="Reality"
          description="A proven approach that transforms ambitious ideas into exceptional digital experiences."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 relative z-10"
        >
          {PROCESS_STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative group"
            >
              {/* Connector Line (hidden on last item and mobile) */}
              {index < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}

              <div className="relative">
                {/* Large Gradient Number */}
                <div className="text-7xl md:text-8xl font-display font-bold text-gradient-cyber opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  {step.number}
                </div>

                {/* Content */}
                <div className="-mt-8 relative z-10">
                  <h3 className="text-xl md:text-2xl font-display font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* CTA Section */}
      <Section className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-magenta-500/10" />
          <div className="absolute inset-0 glass" />

          {/* Animated Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
            >
              Let&apos;s{" "}
              <span className="text-gradient-cyber">Work Together</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-400 text-lg max-w-xl mx-auto mb-8"
            >
              Ready to bring your vision to life? Let&apos;s create something
              extraordinary together.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start a Project
                </Button>
              </Link>
              <Link href="/#services" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Services
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
