"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { ProjectWizard } from "./project-wizard";
import { RefreshCw, TrendingUp, FileText, Palette, Zap, Sparkles, Target, Building2, ShoppingCart, Cpu, Glasses, Rocket } from "lucide-react";

type ProductType = "starter" | "professional" | null;

interface Package {
  name: string;
  badge: string;
  price: string;
  description: string;
  features: string[];
  bestFor: string;
  gradient: string;
  popular: boolean;
  productType: ProductType;
}

const PACKAGES: Package[] = [
  {
    name: "Starter",
    badge: "Best for Small Businesses",
    price: "$899",
    description: "3-4 page professional website",
    features: [
      "Mobile-responsive design",
      "SEO-ready structure",
      "Contact form integration",
      "30-day post-launch support",
    ],
    bestFor: "Small businesses, creators, and ministries who need a clean, professional online presence.",
    gradient: "from-brand to-brand-dark",
    popular: false,
    productType: "starter",
  },
  {
    name: "Professional",
    badge: "Most Popular",
    price: "$1,399",
    description: "6-8 page website or eCommerce site",
    features: [
      "Custom design & branding consultation",
      "Content & media support",
      "Advanced features (booking, payments, etc.)",
      "60-day post-launch support",
      "Optional VR storefront integration",
    ],
    bestFor: "Growing businesses ready to invest in a strong digital presence - with room to expand into VR.",
    gradient: "from-brand-light to-brand",
    popular: true,
    productType: "professional",
  },
  {
    name: "Enterprise / Custom",
    badge: "For Bold Brands",
    price: "Custom",
    description: "Large-scale websites or platforms",
    features: [
      "Full branding & visual identity",
      "Advanced functionality & integrations",
      "Immersive VR environments (optional)",
      "Ongoing partnership & support",
    ],
    bestFor: "Established brands and innovators ready to build something exceptional.",
    gradient: "from-orange-500 to-red-500",
    popular: false,
    productType: null,
  },
];

interface AddOn {
  title: string;
  description: string;
  highlight?: boolean;
  hasCheckout?: boolean;
  icon: typeof RefreshCw;
  gradient: string;
}

const ADD_ONS: AddOn[] = [
  {
    title: "Ongoing Web Care",
    description: "Keep your site updated, secure, and performing. Monthly maintenance plans custom-priced based on your package.",
    icon: RefreshCw,
    gradient: "from-brand-light/10 to-blue-500/10",
  },
  {
    title: "SEO & Optimization",
    description: "Improve your search rankings and site speed. One-time optimization or ongoing support available.",
    icon: TrendingUp,
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    title: "Content & Video",
    description: "Professional copywriting, photography, video editing, and social media assets.",
    icon: FileText,
    gradient: "from-orange-500/10 to-amber-500/10",
  },
  {
    title: "Branding & Visual Identity",
    description: "Logo design, brand guidelines, and marketing materials that keep your message consistent.",
    icon: Palette,
    gradient: "from-brand-dark/10 to-rose-500/10",
  },
  {
    title: "VR Environments",
    description: "Custom virtual storefronts, showrooms, and immersive experiences. A powerful extension - not required to get started.",
    highlight: true,
    icon: Zap,
    gradient: "from-brand-dark/20 to-fuchsia-500/20",
  },
];

// What We Build - matching homepage style
const PROJECT_TYPES = [
  {
    title: "Landing Pages",
    description: "High-converting single pages for campaigns, launches, or lead generation.",
    icon: Target,
    gradient: "from-brand-light/20 to-brand-light/5",
  },
  {
    title: "Business Websites",
    description: "Professional multi-page sites that establish credibility and drive growth.",
    icon: Building2,
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "E-Commerce",
    description: "Online stores with secure payments, inventory management, and smooth checkout.",
    icon: ShoppingCart,
    gradient: "from-green-500/20 to-green-500/5",
  },
  {
    title: "Web Applications",
    description: "Custom dashboards, portals, and interactive tools built for your workflow.",
    icon: Cpu,
    gradient: "from-brand-dark/20 to-brand-dark/5",
  },
  {
    title: "VR Experiences",
    description: "Immersive virtual environments, storefronts, and interactive 3D spaces.",
    icon: Glasses,
    gradient: "from-brand-dark/20 to-brand-dark/5",
  },
  {
    title: "Complete Solutions",
    description: "Complete systems with databases, user accounts, and backend integrations.",
    icon: Rocket,
    gradient: "from-orange-500/20 to-orange-500/5",
  },
];

// Our Process - matching homepage style
const PROCESS_STEPS = [
  { number: "01", title: "Discovery", description: "We learn about your goals, audience, and vision" },
  { number: "02", title: "Design", description: "We create mockups you can see, feel, and refine" },
  { number: "03", title: "Build", description: "We develop your project with care and precision" },
  { number: "04", title: "Launch", description: "We deploy, test, and celebrate together" },
];

export function StartProjectContent(): ReactElement {
  const scrollToForm = () => {
    document.getElementById("project-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mesh-bg">
      {/* SECTION 1 - HERO / INTRO */}
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6 text-white">
            Let&apos;s Build Your Website - and Anything Beyond It
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            We start with professional, conversion-focused websites. When you&apos;re ready to go further, we create immersive VR experiences and visual branding that set you apart.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">
            Whether you&apos;re launching your first business site, redesigning your online presence, or exploring what&apos;s possible with VR - we&apos;re here to help you show up with clarity and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm}>
              Start Your Project
            </Button>
            <Button variant="secondary" size="lg" onClick={scrollToPackages}>
              View Packages Below
            </Button>
          </div>
        </motion.div>
      </Section>

      {/* SECTION 2 - WHAT WE BUILD */}
      <Section>
        <SectionHeader
          tag="What We Build"
          title="Your Vision,"
          highlight="Any Scale"
          description="From simple landing pages to complex web applications - we build what you need."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {PROJECT_TYPES.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${type.gradient} border border-white/10 hover:border-white/20 transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{type.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* SECTION 3 - OUR PROCESS */}
      <Section className="border-t border-white/10">
        <SectionHeader
          tag="Our Process"
          title="How We"
          highlight="Work"
          description="A clear, collaborative approach from start to finish."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {PROCESS_STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="text-5xl font-display font-bold text-white/10 group-hover:text-brand-light/30 transition-colors duration-300 mb-3">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* SECTION 4 - PROJECT WIZARD */}
      <Section id="project-form" className="border-t border-white/10">
        <SectionHeader
          tag="Build Your Blueprint"
          title="Design Your Website"
          highlight="Step by Step"
          description="A guided experience to capture your vision. No commitment - just a clear path forward. We'll review and follow up within 1-2 business days."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12"
        >
          <ProjectWizard />
        </motion.div>
      </Section>

      {/* SECTION 5 - PACKAGES / STARTING POINTS */}
      <Section id="packages" className="border-t border-white/10">
        <SectionHeader
          tag="Pricing"
          title="Starting"
          highlight="Points"
          description="Every project is different. These packages give you a starting point - final pricing depends on your specific needs, features, and timeline."
        />

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <Card className={`h-full ${pkg.popular ? "border-brand-light/50 shadow-[0_0_40px_rgba(0,212,255,0.15)]" : ""}`}>
                {/* Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${pkg.gradient} text-white`}>
                    {pkg.badge}
                  </span>
                </div>

                {/* Name & Price */}
                <h3 className="text-2xl font-display font-bold mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Starting at </span>
                  <span className="text-4xl font-display font-bold text-white">{pkg.price}</span>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6">{pkg.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-brand-light mt-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Best For */}
                <div className="border-t border-white/10 pt-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2">Best For:</p>
                  <p className="text-sm text-gray-400">{pkg.bestFor}</p>
                </div>

                {/* CTA */}
                {pkg.productType ? (
                  <CheckoutButton
                    productType={pkg.productType}
                    variant={pkg.popular ? "primary" : "secondary"}
                    className="w-full"
                  />
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={scrollToForm}
                  >
                    Let&apos;s Talk
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pricing Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm mt-8 max-w-2xl mx-auto"
        >
          <strong>Final pricing depends on scope, features, and timeline.</strong> We&apos;ll work with you to find a solution that fits your goals and budget.
        </motion.p>
      </Section>

      {/* SECTION 6 - WHAT'S INCLUDED / ADD-ONS */}
      <Section className="border-t border-white/10">
        <SectionHeader
          tag="Extend Your Project"
          title="Add-Ons & Extended"
          highlight="Services"
          description="Need more? We offer flexible add-ons to grow with you."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {ADD_ONS.map((addon, index) => {
            const Icon = addon.icon;
            return (
              <motion.div
                key={addon.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`relative overflow-hidden h-full group ${addon.highlight ? "border-brand-dark/30" : ""}`}>
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${addon.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

                  {/* Content */}
                  <div className="relative">
                    {/* Icon */}
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-display font-semibold mb-2 text-white flex items-center gap-2">
                      {addon.title}
                      {addon.highlight && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-dark/20 border border-brand-dark/30 text-xs text-brand-light">
                          <Sparkles className="w-3 h-3" />
                          Optional
                        </span>
                      )}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {addon.description}
                    </p>

                    {addon.hasCheckout && (
                      <CheckoutButton
                        productType="webcare"
                        variant="secondary"
                        size="sm"
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 mt-8"
        >
          Not sure what you need? That&apos;s okay. We&apos;ll help you figure it out together.
        </motion.p>
      </Section>

      {/* SECTION 7 - TRUST & CLOSE */}
      <Section className="border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
            We Meet You Where You Are
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            Starting a project can feel overwhelming - especially if you&apos;re not sure exactly what you need. That&apos;s where we come in.
          </p>
          <p className="text-gray-400 leading-relaxed mb-8">
            Media4U works collaboratively. We help clarify your ideas, set realistic timelines, and build solutions that actually work for your goals and budget. Whether you&apos;re launching your first website or ready to explore immersive VR, we&apos;re here to guide you through it.
          </p>
          <p className="text-gray-400">
            <strong>Questions first?</strong>{" "}
            <Link href="/contact" className="text-brand-light hover:text-brand-light transition-colors">
              Contact us here
            </Link>
          </p>
        </motion.div>
      </Section>
    </div>
  );
}
