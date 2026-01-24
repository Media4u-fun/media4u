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

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-20 right-20 w-2 h-2 bg-cyber-cyan rounded-full shadow-glow-cyan animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-40 left-32 w-3 h-3 bg-cyber-purple rounded-full shadow-glow-purple animate-float"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="absolute bottom-32 right-40 w-2 h-2 bg-cyber-magenta rounded-full shadow-glow-magenta animate-float"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute bottom-48 left-20 w-1.5 h-1.5 bg-cyber-cyan rounded-full shadow-glow-cyan animate-float"
        style={{ animationDelay: "-1s" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-float"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <MorphingBlob />
      <FloatingOrbs />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void-950" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block mb-6 text-xs font-semibold tracking-[0.3em] uppercase text-cyber-cyan">
            VR Commerce / Metaverse / Global Business
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
        >
          Virtual Commerce for a{" "}
          <span className="text-gradient-cyber">Global Marketplace</span>
          <br />
          Powered by the Metaverse
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Create immersive virtual storefronts, buy and sell digital real estate, and
          conduct global commerce in the metaverse. Connect with customers worldwide in
          stunning, interactive VR environments.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/portfolio">
            <Button size="lg">View Our Work</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary" size="lg">Get in Touch</Button>
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6M5 19h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Virtual Storefronts",
    description: "Build immersive VR storefronts that showcase your products and services. Give customers a unique shopping experience in the metaverse with interactive displays and global reach.",
    glow: "cyan" as const,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2.149-2.149a3 3 0 014.243 0L12 12m0 0l2.149-2.149a3 3 0 014.243 0L21 12M3 12a9 9 0 0118 0m-9 9v-2.25a2.25 2.25 0 012.25-2.25h4.5A2.25 2.25 0 0121 16.5V21" />
      </svg>
    ),
    title: "Virtual Real Estate",
    description: "Buy, sell, and own digital properties in premium metaverse locations. From apartments to penthouses, invest in virtual real estate that appreciates in value.",
    glow: "purple" as const,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Global Commerce",
    description: "Conduct business across the metaverse. Reach customers worldwide, process transactions in virtual spaces, and scale your enterprise in the digital economy.",
    glow: "magenta" as const,
  },
];

function ServicesSection() {
  return (
    <Section className="relative">
      <AnimatedSection>
        <SectionHeader
          tag="Our Offerings"
          title="VR Commerce Solutions"
          highlight="Solutions"
          description="Build your metaverse empire with virtual storefronts, digital real estate, and global commerce capabilities."
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
            The Future of
            <br />
            <span className="text-gradient-cyber">Virtual Commerce</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            Media4U is pioneering the next generation of commerce by leveraging immersive virtual environments
            and metaverse platforms. We enable businesses and individuals to thrive in the digital economy.
          </p>
          <p className="text-gray-400 leading-relaxed">
            From building stunning virtual storefronts like Chesapeake Meta Malls to hosting premium digital
            real estate in Towers of Harmony, we connect global customers with innovative VR commerce
            solutions that break geographical boundaries and create new economic opportunities.
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
                  <div className="text-gray-400 text-sm">Customer Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient-cyber mb-2">
                    24/7
                  </div>
                  <div className="text-gray-400 text-sm">VR Operations</div>
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
            Ready to Enter the{" "}
            <span className="text-gradient-cyber">Metaverse</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Launch your virtual storefront, invest in digital real estate, or expand your
            business into the global VR marketplace. The future of commerce starts now.
          </p>
          <Link href="/contact">
            <Button size="lg">Get in Touch</Button>
          </Link>
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
