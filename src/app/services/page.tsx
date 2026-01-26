"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "web-design",
    title: "Professional Websites",
    description:
      "Modern, mobile-responsive websites built for businesses, creators, and brands who want to grow their online presence. From landing pages to full eCommerce-we build sites that convert.",
    features: [
      "Responsive mobile-first design",
      "SEO optimization built-in",
      "Fast & accessible performance",
      "Easy to maintain & update",
    ],
    gradient: "from-cyber-magenta to-cyber-cyan",
    glowColor: "magenta",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="web-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2d92" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        <rect
          x="15"
          y="20"
          width="70"
          height="50"
          rx="4"
          stroke="url(#web-grad)"
          strokeWidth="2"
          fill="none"
        />
        <line
          x1="15"
          y1="32"
          x2="85"
          y2="32"
          stroke="url(#web-grad)"
          strokeWidth="2"
        />
        <circle cx="22" cy="26" r="2" fill="#ff2d92" />
        <circle cx="29" cy="26" r="2" fill="#00d4ff" />
        <circle cx="36" cy="26" r="2" fill="#8b5cf6" />
        <rect x="20" y="38" width="25" height="4" rx="1" fill="url(#web-grad)" opacity="0.6" />
        <rect x="20" y="46" width="40" height="3" rx="1" fill="url(#web-grad)" opacity="0.4" />
        <rect x="20" y="52" width="35" height="3" rx="1" fill="url(#web-grad)" opacity="0.4" />
        <rect x="20" y="58" width="30" height="3" rx="1" fill="url(#web-grad)" opacity="0.4" />
        <path
          d="M40 80 L50 75 L60 80"
          stroke="url(#web-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "branding",
    title: "Branding & Design Assets",
    description:
      "Visual identity and promotional materials that make your brand memorable. Logos, social graphics, video assets, and multi-format designs that work seamlessly across your website, social channels, and VR spaces.",
    features: [
      "Logo & brand identity design",
      "Social media graphics (1x1, 16x9, 9x16)",
      "Video & podcast promo assets",
      "Print-ready & digital-optimized",
    ],
    gradient: "from-cyber-purple to-cyber-magenta",
    glowColor: "purple",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="vr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect
          x="15"
          y="30"
          width="70"
          height="40"
          rx="8"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="35" cy="50" r="8" stroke="url(#vr-grad)" strokeWidth="2" fill="none" />
        <circle cx="65" cy="50" r="8" stroke="url(#vr-grad)" strokeWidth="2" fill="none" />
        <path
          d="M10 50 L15 50"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M85 50 L90 50"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M43 50 L57 50"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "vr-environments",
    title: "VR Storefronts & Environments",
    description:
      "For brands ready to differentiate and innovate-we create immersive virtual spaces where your brand comes to life. Custom VR storefronts, showrooms, and interactive environments that engage customers in entirely new ways.",
    features: [
      "Custom 3D design & branding",
      "Interactive displays & portals",
      "Connect to web with hotlinks",
      "Multi-platform deployment",
    ],
    gradient: "from-cyber-cyan to-cyber-purple",
    glowColor: "cyan",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ff2d92" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="40" r="20" stroke="url(#brand-grad)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="40" r="12" stroke="url(#brand-grad)" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path
          d="M50 20 L58 30 L50 32 L42 30 Z"
          stroke="url(#brand-grad)"
          strokeWidth="2"
          fill="url(#brand-grad)"
          opacity="0.5"
        />
        <rect x="25" y="65" width="50" height="12" rx="2" stroke="url(#brand-grad)" strokeWidth="2" fill="none" />
        <line x1="35" y1="65" x2="35" y2="77" stroke="url(#brand-grad)" strokeWidth="1.5" />
        <line x1="50" y1="65" x2="50" y2="77" stroke="url(#brand-grad)" strokeWidth="1.5" />
        <line x1="65" y1="65" x2="65" y2="77" stroke="url(#brand-grad)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "multiverse",
    title: "Integrated Web + VR Experiences",
    description:
      "The best of both worlds: professional websites that connect seamlessly to VR storefronts. Create a unified brand presence where customers can explore your business online and step into immersive virtual spaces-all from one integrated experience.",
    features: [
      "Website ↔ VR portal integration",
      "Branded spaces across platforms",
      "Interactive hotlinks & navigation",
      "Unified brand experience",
    ],
    gradient: "from-cyber-magenta to-cyber-cyan",
    glowColor: "magenta",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="multi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ff2d92" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="30" stroke="url(#multi-grad)" strokeWidth="2" fill="none" />
        <ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="12"
          stroke="url(#multi-grad)"
          strokeWidth="2"
          fill="none"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="12"
          ry="30"
          stroke="url(#multi-grad)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="50" cy="20" r="4" fill="#8b5cf6" />
        <circle cx="50" cy="80" r="4" fill="#ff2d92" />
        <circle cx="20" cy="50" r="4" fill="#00d4ff" />
        <circle cx="80" cy="50" r="4" fill="#8b5cf6" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface ServiceCardProps {
  service: (typeof services)[number];
  isReversed: boolean;
}

function ServiceCard({ service, isReversed }: ServiceCardProps): React.ReactNode {
  const glowShadows: Record<string, string> = {
    cyan: "shadow-[0_0_80px_rgba(0,212,255,0.2)]",
    magenta: "shadow-[0_0_80px_rgba(255,45,146,0.2)]",
    purple: "shadow-[0_0_80px_rgba(139,92,246,0.2)]",
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-16 items-center`}
    >
      <motion.div
        whileHover={{ scale: 1.02, rotate: isReversed ? -2 : 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative w-[200px] h-[200px] flex-shrink-0 rounded-3xl bg-gradient-to-br ${service.gradient} p-[2px] ${glowShadows[service.glowColor]}`}
      >
        <div className="w-full h-full rounded-3xl bg-void-950 flex items-center justify-center p-8">
          {service.icon}
        </div>
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-20 blur-2xl -z-10`}
        />
      </motion.div>

      <div className="flex-1 text-center lg:text-left">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 text-white">
          {service.title}
        </h3>
        <p className="text-gray-400 text-lg mb-6 max-w-xl">
          {service.description}
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {service.features.map((feature, featureIndex) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + featureIndex * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-gray-300"
            >
              <span
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient}`}
              />
              {feature}
            </motion.li>
          ))}
        </ul>

        <Link href="/contact">
          <Button variant="secondary" size="md">
            Learn More
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ServicesPage(): React.ReactNode {
  return (
    <main className="min-h-screen bg-void-950">
      <Section className="pt-32 md:pt-40">
        <SectionHeader
          tag="What We Do"
          title="Websites First. VR When You're "
          highlight="Ready to Innovate"
          description="We're a full-service creative studio. Start with a professional website, add branding and media assets, and when you're ready-extend your presence into immersive VR environments."
        />
      </Section>

      <Section className="pt-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-24 lg:space-y-32"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              isReversed={index % 2 === 1}
            />
          ))}
        </motion.div>
      </Section>

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-[1px] bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-magenta"
        >
          <div className="rounded-3xl bg-void-900 px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                Start With a Website. Expand Into{" "}
                <span className="text-gradient-cyber">VR</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Most clients start with a professional website and branding. When they&apos;re ready to innovate, we extend their presence into VR. Every service works together to create a cohesive, powerful digital identity.
              </p>
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  Get a Custom Quote
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>
    </main>
  );
}
