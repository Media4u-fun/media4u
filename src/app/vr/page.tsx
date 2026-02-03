/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ReactElement } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card, CardIcon } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Home, Globe, Star, Coins } from "lucide-react";

const FEATURES = [
  { label: "Interactive Elements", icon: "touch" },
  { label: "Multi-User Support", icon: "users" },
  { label: "Cross-Platform", icon: "devices" },
] as const;

const USE_CASES = [
  {
    title: "Virtual Events",
    description: "Host conferences, concerts, and gatherings in immersive 3D spaces that transcend physical limitations.",
    icon: "event",
    glow: "cyan" as const,
  },
  {
    title: "Virtual Showrooms",
    description: "Showcase products in interactive environments where customers can explore and engage from anywhere.",
    icon: "showroom",
    glow: "magenta" as const,
  },
  {
    title: "Education & Training",
    description: "Create hands-on learning experiences with realistic simulations and interactive tutorials.",
    icon: "education",
    glow: "purple" as const,
  },
  {
    title: "Entertainment",
    description: "Build gaming worlds, interactive narratives, and social experiences that captivate audiences.",
    icon: "entertainment",
    glow: "cyan" as const,
  },
  {
    title: "Art & Galleries",
    description: "Transform digital art into walkable exhibitions with immersive viewing experiences.",
    icon: "gallery",
    glow: "magenta" as const,
  },
  {
    title: "Multiverse Hubs",
    description: "Design interconnected virtual spaces that serve as gateways to endless digital experiences.",
    icon: "hub",
    glow: "purple" as const,
  },
];

function FeatureIcon({ type }: { type: string }): ReactElement | null {
  const icons: Record<string, ReactElement> = {
    touch: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    devices: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    event: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
    showroom: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    education: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    entertainment: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    gallery: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    hub: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
      </svg>
    ),
  };

  return icons[type] || null;
}

function VRHeadsetVisual() {
  const [particles, setParticles] = useState<Array<{ top: string; left: string }> | null>(null);

  // Generate particle positions only on client
  if (typeof window !== "undefined" && !particles) {
    setParticles(
      [...Array(6)].map(() => ({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
      }))
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Morphing gradient shape */}
      <motion.div
        className="absolute inset-8 animate-morph bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500"
        style={{
          filter: "blur(1px)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner dark core */}
      <motion.div
        className="absolute inset-16 rounded-full bg-[#03030a]/80 backdrop-blur-xl border border-white/10"
        animate={{
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* VR Headset Icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          className="w-24 h-24 md:w-32 md:h-32 text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={0.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      </motion.div>

      {/* Floating particles - only render if positions are generated */}
      {particles && particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cyan-400/60"
          style={{
            top: particle.top,
            left: particle.left,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function VRPage() {
  const experiences = useQuery(api.vr.getAllExperiences);
  const [filterType, setFilterType] = useState<"all" | "property" | "destination">("all");

  const filteredExperiences = experiences
    ? experiences.filter((exp) => filterType === "all" || exp.type === filterType)
    : [];

  return (
    <div className="mesh-bg min-h-screen pt-24">
      {/* Hero Section */}
      <Section className="pt-12 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
            Immersive Technology
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-white">
            VR Environments
            <br />
            &amp; Multiverse
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Step into new dimensions with custom virtual reality experiences that blur the line between digital and reality.
          </p>
        </motion.div>
      </Section>

      {/* VR Overview Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
              Crafting Immersive Experiences
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              We design and develop cutting-edge VR environments that transport users to extraordinary digital realms.
              From virtual showrooms to expansive multiverse hubs, our solutions combine stunning visuals with intuitive
              interactions to create unforgettable experiences.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-4">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-full glass border border-white/10 hover:border-cyan-400/30 transition-colors"
                >
                  <span className="text-cyan-400">
                    <FeatureIcon type={feature.icon} />
                  </span>
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* VR Visual Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VRHeadsetVisual />
          </motion.div>
        </div>
      </Section>

      {/* Featured Experiences Section */}
      {experiences && experiences.length > 0 && (
        <Section>
          <SectionHeader
            tag="Explore"
            title="Featured VR "
            highlight="Experiences"
            description="Discover our curated collection of virtual properties and destinations across the multiverse."
          />

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {["all", "property", "destination"].map((type) => (
              <motion.button
                key={type}
                onClick={() => setFilterType(type as "all" | "property" | "destination")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-medium transition-all border ${
                  filterType === type
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-cyan-500/30"
                }`}
              >
                {type === "all" ? "All" : type === "property" ? "Properties" : "Destinations"}
              </motion.button>
            ))}
          </div>

          {/* Experiences Grid */}
          {filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map((experience: any, idx: any) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Link href={`/vr/${experience.slug}`}>
                    <Card
                      glow="cyan"
                      className="h-full overflow-hidden hover:translate-y-[-8px] transition-all cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden rounded-lg mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={experience.thumbnailImage}
                          alt={experience.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {experience.categories.slice(0, 2).map((cat: any) => (
                            <span
                              key={cat}
                              className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            >
                              {cat}
                            </span>
                          ))}
                          {experience.categories.length > 2 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-400">
                              +{experience.categories.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2">{experience.title}</h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {experience.description}
                        </p>

                        {/* Type Badge & Price */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 flex items-center gap-1">
                            {experience.type === "property" ? (
                              <><Home className="w-3 h-3" /> Property</>
                            ) : (
                              <><Globe className="w-3 h-3" /> Destination</>
                            )}
                          </span>
                          {experience.featured && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        {experience.price !== undefined && experience.price > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-cyan-400 flex items-center gap-1">
                              <Coins className="w-4 h-4" /> {experience.price.toLocaleString()} Meta Coins
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <Button variant="ghost" size="sm" className="w-full">
                          View Experience →
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No experiences found. Stay tuned!</p>
            </div>
          )}
        </Section>
      )}

      {/* Use Cases Grid */}
      <Section>
        <SectionHeader
          tag="Applications"
          title="Endless "
          highlight="Possibilities"
          description="Discover how VR technology can transform your industry and create meaningful connections."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card glow={useCase.glow} className="h-full">
                <CardIcon>
                  <FeatureIcon type={useCase.icon} />
                </CardIcon>
                <h3 className="text-xl font-display font-semibold mb-3 text-white">
                  {useCase.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute inset-0 glass" />

          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl border border-white/10" />

          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">
              Ready to Enter the Virtual World?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Let us build your gateway to the multiverse. From concept to deployment,
              we handle every aspect of your VR journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="secondary" size="lg">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
