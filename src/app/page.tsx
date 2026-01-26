"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button, Section, SectionHeader, Card, CardIcon } from "@/components/ui";

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
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
        >
          Professional Websites That Convert and{" "}
          <span className="text-gradient-cyber">VR Experiences</span>
          <br />
          That Wow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          We build modern, high-performing websites that help your business grow. Need to go further? We create immersive VR storefronts and virtual experiences that bring your brand into the future.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/contact">
            <Button size="lg">Build My Website</Button>
          </Link>
          <Link href="/vr">
            <Button variant="secondary" size="lg">Explore VR Experiences</Button>
          </Link>
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
          description="From professional websites to VR storefronts-we build digital solutions that work together to strengthen your brand."
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            A Creative Studio Built for the
            <br />
            <span className="text-gradient-cyber">Digital Era</span>
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
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient-cyber mb-2">
                    Global
                  </div>
                  <div className="text-gray-400 text-sm">Worldwide Client Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient-cyber mb-2">
                    24/7
                  </div>
                  <div className="text-gray-400 text-sm">Always-On Presence</div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple border-2 border-void-950"
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-400">
                    Trusted by industry leaders worldwide
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to Build Your{" "}
            <span className="text-gradient-cyber">Digital Presence</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Whether you&apos;re starting with a professional website, elevating your brand with custom design, or creating an immersive VR experience-we&apos;re here to help you show up with clarity and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Start My Website Project</Button>
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
    <main className="relative">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <CTASection />
    </main>
  );
}
