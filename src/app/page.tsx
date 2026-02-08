"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button, Section, SectionHeader, Card, CardIcon } from "@/components/ui";
import { VRSphere360 } from "@/components/effects/vr-sphere-360";
import { Target, Building2, ShoppingCart, Cpu, Glasses, Rocket, type LucideIcon } from "lucide-react";

function AnimatedSection({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MorphingBlob() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyber-cyan/20 via-cyber-purple/15 to-cyber-magenta/10 blur-3xl animate-morph"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyber-magenta/15 via-cyber-purple/10 to-cyber-cyan/15 blur-3xl animate-morph"
        style={{ animationDuration: "10s", animationDelay: "-4s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-cyber-purple/10 to-cyber-cyan/10 blur-3xl animate-morph"
        style={{ animationDuration: "12s", animationDelay: "-2s" }}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <MorphingBlob />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void-950" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block mb-6 text-xs font-semibold tracking-[0.3em] uppercase text-cyber-cyan">
            Web Design / Digital Presence / Immersive VR
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight text-white"
        >
          Professional Websites That Convert and VR Experiences That Wow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10"
        >
          We build modern, high-performing websites that help your business grow. Need to go further? We create immersive VR storefronts and virtual experiences that bring your brand into the future.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link href="/start-project">
            <Button size="lg">Start Your Project</Button>
          </Link>
          <Link href="/vr">
            <Button variant="secondary" size="lg">Explore VR Experiences</Button>
          </Link>
        </motion.div>

        {/* 360° VR Environment Sphere */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="h-96 md:h-[500px]"
        >
          <VRSphere360 />
        </motion.div>
      </div>
    </section>
  );
}

const services = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Website Design & Development",
    description: "Modern, mobile-responsive websites built for businesses, creators, and brands who want to grow their online presence. From landing pages to full eCommerce-we build sites that convert.",
    glow: "magenta" as const,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: "Branding & Design Assets",
    description: "Logos, social graphics, video assets, and promotional content that make your brand stand out. Consistent visual identity across every platform-web, social, and VR.",
    glow: "purple" as const,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "Immersive VR Experiences",
    description: "Take your brand to the next level with custom VR storefronts, interactive environments, and virtual spaces. Perfect for brands ready to innovate and create unforgettable customer experiences.",
    glow: "cyan" as const,
  },
];

function ServicesSection() {
  return (
    <Section className="relative">
      <AnimatedSection>
        <SectionHeader
          tag="Our Core Services"
          title="Web Design, Branding, & Immersive "
          highlight="Experiences"
          description="From professional websites to VR storefronts - we build digital solutions that work together to strengthen your brand."
        />
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <AnimatedSection key={service.title} delay={0.1 * (index + 1)}>
            <Card glow={service.glow} className="h-full">
              <CardIcon>{service.icon}</CardIcon>
              <h3 className="text-xl font-display font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.description}</p>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </Section>
  );
}

function AboutSection() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <AnimatedSection>
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-cyber-cyan">
            About Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">
            A Creative Studio Built for the
            <br />
            Digital Era
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            Media4U is a web design and creative studio that helps businesses, creators, and communities build their online presence-and go beyond it. We specialize in professional websites, visual branding, and for those ready to innovate, immersive VR experiences.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Whether you need a website that converts, branding that connects, or a VR storefront that sets you apart-we create cohesive digital solutions where every piece strengthens your overall presence.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyber-cyan/20 via-cyber-purple/20 to-cyber-magenta/20 rounded-3xl blur-2xl" />
            <div className="relative glass-elevated rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  What We Do
                </h3>
                <p className="text-gray-400 text-sm">
                  Three core services that work together
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <Link href="/portfolio" className="text-center group cursor-pointer transition-transform hover:scale-105">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-cyber-magenta/20 to-cyber-magenta/10 border border-cyber-magenta/30 flex items-center justify-center group-hover:border-cyber-magenta group-hover:shadow-[0_0_20px_rgba(255,45,146,0.4)] transition-all">
                    <div className="w-3 h-3 rounded-full bg-cyber-magenta group-hover:w-4 group-hover:h-4 transition-all"></div>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1 group-hover:text-cyber-magenta transition-colors">Web</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Professional sites that convert</div>
                </Link>

                <Link href="/start-project" className="text-center group cursor-pointer transition-transform hover:scale-105">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-cyber-purple/20 to-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center group-hover:border-cyber-purple group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                    <div className="w-3 h-3 rounded-full bg-cyber-purple group-hover:w-4 group-hover:h-4 transition-all"></div>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1 group-hover:text-cyber-purple transition-colors">Branding</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Visual identity that stands out</div>
                </Link>

                <Link href="/vr" className="text-center group cursor-pointer transition-transform hover:scale-105">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center group-hover:border-cyber-cyan group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all">
                    <div className="w-3 h-3 rounded-full bg-cyber-cyan group-hover:w-4 group-hover:h-4 transition-all"></div>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1 group-hover:text-cyber-cyan transition-colors">VR</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Immersive experiences</div>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  );
}

const possibilities: {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  examples: string[];
}[] = [
  {
    title: "Landing Pages",
    description: "High-converting single pages that capture leads and drive action",
    icon: Target,
    color: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "hover:border-cyan-500/50",
    examples: ["Product launches", "Event pages", "Lead capture"],
  },
  {
    title: "Business Websites",
    description: "Professional multi-page sites that establish credibility and trust",
    icon: Building2,
    color: "from-blue-500/20 to-blue-500/5",
    borderColor: "hover:border-blue-500/50",
    examples: ["Company sites", "Service businesses", "Portfolios"],
  },
  {
    title: "E-Commerce",
    description: "Online stores with seamless checkout and inventory management",
    icon: ShoppingCart,
    color: "from-green-500/20 to-green-500/5",
    borderColor: "hover:border-green-500/50",
    examples: ["Product stores", "Digital downloads", "Subscriptions"],
  },
  {
    title: "Web Applications",
    description: "Custom apps with user accounts, dashboards, and real-time features",
    icon: Cpu,
    color: "from-purple-500/20 to-purple-500/5",
    borderColor: "hover:border-purple-500/50",
    examples: ["Client portals", "Booking systems", "SaaS tools"],
  },
  {
    title: "VR Experiences",
    description: "Immersive 360° environments and virtual storefronts",
    icon: Glasses,
    color: "from-pink-500/20 to-pink-500/5",
    borderColor: "hover:border-pink-500/50",
    examples: ["Virtual tours", "VR storefronts", "3D showcases"],
  },
  {
    title: "Full Stack Solutions",
    description: "Complete systems with databases, APIs, and admin panels",
    icon: Rocket,
    color: "from-orange-500/20 to-orange-500/5",
    borderColor: "hover:border-orange-500/50",
    examples: ["Custom platforms", "Integrations", "Automation"],
  },
];

function PossibilitiesSection() {
  return (
    <Section className="relative">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-cyber-cyan">
            What We Build
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-white">
            What&apos;s <span className="text-gradient">Possible</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From simple landing pages to full-stack applications - we build what your business needs
          </p>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {possibilities.map((item, index) => {
          const Icon = item.icon;
          return (
          <AnimatedSection key={item.title} delay={0.05 * (index + 1)}>
            <div className={`group relative h-full p-6 rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 ${item.borderColor} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}>
              <div className="mb-4 p-3 rounded-xl bg-white/10 w-fit">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.examples.map((example) => (
                  <span
                    key={example}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-500 group-hover:text-gray-300 transition-colors"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        );
        })}
      </div>

      <AnimatedSection delay={0.4}>
        <div className="text-center mt-10">
          <Link href="/start-project">
            <Button variant="secondary">Start Your Project</Button>
          </Link>
        </div>
      </AnimatedSection>
    </Section>
  );
}

const processSteps = [
  { number: "01", title: "Discovery", description: "We learn about your goals and vision" },
  { number: "02", title: "Design", description: "We create mockups you can see and feel" },
  { number: "03", title: "Build", description: "We develop your project with care" },
  { number: "04", title: "Launch", description: "We deploy and celebrate together" },
];

function ProcessSection() {
  return (
    <Section className="relative">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-cyber-purple">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-white">
            Simple <span className="text-gradient">Process</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            From idea to launch in four clear steps
          </p>
        </div>
      </AnimatedSection>

      <div className="relative">
        {/* Connection line - hidden on mobile */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <AnimatedSection key={step.number} delay={0.1 * (index + 1)}>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyber-cyan/20 via-cyber-purple/20 to-cyber-magenta/20 border border-white/10 mb-4">
                  <span className="text-xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CTASection() {
  return (
    <Section className="relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-cyber-cyan/10 via-cyber-purple/10 to-cyber-magenta/10 rounded-full blur-3xl" />
      </div>

      <AnimatedSection>
        <div className="relative text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">
            Ready to Build Your Digital Presence?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Whether you&apos;re starting with a professional website, elevating your brand with custom design, or creating an immersive VR experience-we&apos;re here to help you show up with clarity and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-project">
              <Button size="lg">Start Your Project</Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" size="lg">Explore All Services</Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </Section>
  );
}

export default function HomePage() {
  return (
    <main className="relative mesh-bg">
      <HeroSection />
      <PossibilitiesSection />
      <ProcessSection />
      <ServicesSection />
      <AboutSection />
      <CTASection />
    </main>
  );
}
