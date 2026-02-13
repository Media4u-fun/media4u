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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Connection",
    description:
      "We use technology as a bridge between people, creating spaces where connection happens naturally.",
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
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    title: "Integrity",
    description:
      "We create with honesty, excellence, and intention. Every project reflects our commitment to doing work that matters.",
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Purpose",
    description:
      "Faith-informed and purpose-driven, we're here to help you build something meaningful that serves everyone.",
    glow: "magenta" as const,
  },
];

const SERVICES = [
  {
    number: "01",
    title: "Professional Websites",
    description:
      "Modern, conversion-focused sites built for businesses, creators, and ministries who want to grow their reach and impact.",
  },
  {
    number: "02",
    title: "Visual Media & Branding",
    description:
      "Logos, promo assets, social content, video, and creative direction that help your brand stand out online and in VR. Consistent visual identity across every platform.",
  },
  {
    number: "03",
    title: "Web Hosting & Ongoing Support",
    description:
      "Reliable hosting, regular updates, SEO optimization, and technical support. We keep your website fast, secure, and performing at its best.",
  },
  {
    number: "04",
    title: "Immersive VR Environments",
    description:
      "Custom virtual storefronts, event spaces, and interactive experiences for brands ready to stand out. We build VR spaces that engage and inspire.",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Mr. Harmony",
    realName: "Devland Lister",
    role: "Founder & Visionary",
    bio: "Devland brings years of IT and tech experience into every project, but his real gift is seeing possibilities others miss. He's a builder at heart-whether it's a VR apartment complex, a digital community space, or a website that feels alive. He believes technology should foster harmony and connection, and that belief shapes everything Media4U creates. Devland leads with vision, purpose, and a deep commitment to doing work that matters.",
    gradient: "from-brand-light to-brand",
  },
  {
    name: "Mike",
    realName: "Iceman",
    role: "Visual Media Specialist",
    bio: "Mike turns ideas into visuals you can feel. From websites and branding to VR assets and promotional content, he brings the creative precision that makes every project polished and professional. He's the bridge between concept and execution-taking vision and turning it into something people can see, touch, and experience. His work supports both the technical and creative sides of every project we take on.",
    gradient: "from-brand to-brand-dark",
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
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand-light">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6 text-white">
            We Build Digital Experiences That Connect People
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Media4U is a web design and creative studio where professional websites, visual branding, and immersive VR come together. We help businesses, creators, and communities build their digital presence with clarity and confidence-online and in virtual spaces.
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
            <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand-light">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
              Building Meaningful Digital Experiences
            </h2>
            <div className="space-y-4 text-gray-400">
              <p>
                We exist to build meaningful digital experiences-spaces where people
                feel seen, heard, and welcomed. We believe technology should bring
                people closer, not just fill screens.
              </p>
              <p>
                We build websites that work. We create branding that resonates. And for those ready to push boundaries, we design VR experiences that set you apart. Media4U is purpose-driven and faith-informed, but we&apos;re here to serve everyone with excellence.
              </p>
            </div>
            {/* Decorative Element */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-brand-light/50 via-brand-dark/50 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-brand" />
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

      {/* What We Do */}
      <Section className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-light/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-dark/5 rounded-full blur-3xl -translate-y-1/2" />

        <SectionHeader
          tag="What We Do"
          title="More Than a Website Company. More Than "
          highlight="VR Studio"
          description="We&apos;re a hybrid creative partner that blends digital craftsmanship with immersive technology."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 relative z-10"
        >
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.number}
              variants={itemVariants}
              className="relative group"
            >
              {/* Connector Line (hidden on last item and mobile) */}
              {index < SERVICES.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}

              <div className="relative">
                {/* Large Number */}
                <div className="text-7xl md:text-8xl font-display font-bold text-white opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  {service.number}
                </div>

                {/* Content */}
                <div className="-mt-8 relative z-10">
                  <h3 className="text-xl md:text-2xl font-display font-semibold mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-brand-light/0 to-brand-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Meet the Team */}
      <Section>
        <SectionHeader
          tag="Meet the Team"
          title="The People Behind "
          highlight="Media4U"
          description="A small, dedicated team focused on building meaningful digital experiences."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto"
        >
          {TEAM_MEMBERS.map((member) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              className="group relative"
            >
              <Card className="h-full">
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-r ${member.gradient} opacity-80 rounded-t-2xl`} />

                {/* Content */}
                <div className="p-6 -mt-16 relative">
                  <div className="mb-4">
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500">({member.realName})</p>
                    <p className="text-brand-light font-semibold mt-2">{member.role}</p>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </Card>
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
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light/10 via-brand-dark/10 to-brand-dark/10" />
          <div className="absolute inset-0 glass" />

          {/* Animated Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 bg-brand-dark/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-white"
            >
              Let&apos;s Build Something Together
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-400 text-lg max-w-xl mx-auto mb-8"
            >
              Whether you need a website that converts, branding that connects, or a VR space that sets you apart-we&apos;re ready to help you show up with clarity and confidence. Let&apos;s build your digital presence together.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/start-project" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View All Services
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
