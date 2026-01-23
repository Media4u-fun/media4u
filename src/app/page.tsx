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
            VR / Web / Multiverse
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
        >
          Bringing Your{" "}
          <span className="text-gradient-cyber">Digital Vision</span>
          <br />
          to Life
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          We craft immersive VR environments, stunning web experiences, and
          cutting-edge multiverse projects that push the boundaries of digital creation.
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    title: "VR Environments",
    description: "Immersive virtual reality experiences that transport users to entirely new worlds. From interactive showrooms to training simulations.",
    glow: "cyan" as const,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
    title: "Web Design",
    description: "Stunning, responsive websites that combine aesthetic excellence with flawless functionality. Built for performance and conversion.",
    glow: "purple" as const,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Multiverse Projects",
    description: "Cross-platform digital experiences that seamlessly bridge virtual and physical realities. The future of interactive engagement.",
    glow: "magenta" as const,
  },
];

function ServicesSection() {
  return (
    <Section className="relative">
      <AnimatedSection>
        <SectionHeader
          tag="What We Do"
          title="Our Services"
          highlight="Services"
          description="We specialize in creating digital experiences that captivate, engage, and inspire."
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
            Crafting Digital
            <br />
            <span className="text-gradient-cyber">Experiences</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            At Media4U, we believe in pushing the boundaries of what&apos;s possible in the digital realm.
            Our team of passionate creators, developers, and visionaries work together to transform
            ambitious ideas into stunning realities.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Whether you&apos;re looking to establish a commanding web presence, create immersive VR
            experiences, or explore the emerging multiverse landscape, we have the expertise
            and creativity to bring your vision to life.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyber-cyan/20 via-cyber-purple/20 to-cyber-magenta/20 rounded-3xl blur-2xl" />
            <div className="relative glass-elevated rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient-cyber mb-2">
                    50+
                  </div>
                  <div className="text-gray-400 text-sm">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-gradient-cyber mb-2">
                    100%
                  </div>
                  <div className="text-gray-400 text-sm">Client Satisfaction</div>
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
            Ready to Start Your{" "}
            <span className="text-gradient-cyber">Project</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Let&apos;s collaborate and create something extraordinary together.
            Your digital vision is just a conversation away.
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
