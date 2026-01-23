"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";
import Link from "next/link";

type ProjectCategory = "all" | "vr" | "web" | "multiverse";

interface Project {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, "all">;
  description: string;
  gradient: string;
}

interface ConvexProject {
  _id: string;
  slug: string;
  title: string;
  category: Exclude<ProjectCategory, "all">;
  description: string;
  gradient: string;
}

const FALLBACK_PROJECTS: Project[] = [
  {
    id: "virtual-conference-hall",
    title: "Virtual Conference Hall",
    category: "vr",
    description: "Immersive 3D conference space with real-time collaboration tools for remote teams.",
    gradient: "from-cyan-500 via-blue-600 to-purple-600",
  },
  {
    id: "tech-startup-landing",
    title: "Tech Startup Landing Page",
    category: "web",
    description: "High-converting landing page with dynamic animations and seamless user experience.",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    id: "connected-brand",
    title: "Connected Brand Experience",
    category: "multiverse",
    description: "Cross-platform brand presence spanning web, VR, and interactive installations.",
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    id: "virtual-art-gallery",
    title: "Virtual Art Gallery",
    category: "vr",
    description: "Museum-quality virtual space showcasing digital and traditional artwork collections.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    category: "web",
    description: "Full-featured online store with 3D product previews and AR try-on capabilities.",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  {
    id: "educational-vr-campus",
    title: "Educational VR Campus",
    category: "vr",
    description: "Interactive virtual campus environment for immersive learning experiences.",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
  },
];

const FILTER_TABS: { value: ProjectCategory; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "vr", label: "VR Environments" },
  { value: "web", label: "Web Design" },
  { value: "multiverse", label: "Multiverse" },
];

const CATEGORY_LABELS: Record<Exclude<ProjectCategory, "all">, string> = {
  vr: "VR Environment",
  web: "Web Design",
  multiverse: "Multiverse",
};

const CATEGORY_COLORS: Record<Exclude<ProjectCategory, "all">, string> = {
  vr: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  web: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  multiverse: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");

  // Fetch projects from Convex
  const convexProjects = useQuery(api.portfolio.getAllProjects);

  // Use Convex projects if available, fallback to hardcoded data
  const PROJECTS = (convexProjects && convexProjects.length > 0
    ? convexProjects.map((p: ConvexProject) => ({
        id: p._id || p.slug,
        title: p.title,
        category: p.category,
        description: p.description,
        gradient: p.gradient,
      }))
    : FALLBACK_PROJECTS) as Project[];

  const filteredProjects =
    activeFilter === "all"
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === activeFilter);

  return (
    <div className="min-h-screen mesh-bg">
      <Section className="pt-32 md:pt-40">
        <SectionHeader
          tag="Our Work"
          title="Featured "
          highlight="Projects"
          description="Explore our portfolio of immersive VR environments, cutting-edge web experiences, and innovative multiverse solutions."
        />

        <FilterTabs
          tabs={FILTER_TABS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <ProjectGrid projects={filteredProjects} />
      </Section>

      <CTASection />
    </div>
  );
}

interface FilterTabsProps {
  tabs: { value: ProjectCategory; label: string }[];
  activeFilter: ProjectCategory;
  onFilterChange: (filter: ProjectCategory) => void;
}

function FilterTabs({ tabs, activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={`
            relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300
            ${
              activeFilter === tab.value
                ? "text-white"
                : "text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
            }
          `}
        >
          {activeFilter === tab.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

interface ProjectGridProps {
  projects: Project[];
}

function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_60px_rgba(0,212,255,0.15)]"
    >
      <div
        className={`relative h-48 bg-gradient-to-br ${project.gradient} overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="absolute bottom-4 left-4">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${CATEGORY_COLORS[project.category]}`}
          >
            {CATEGORY_LABELS[project.category]}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-gradient-cyber transition-all duration-300">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl border border-cyan-500/20" />
      </div>
    </motion.article>
  );
}

function CTASection() {
  return (
    <Section className="border-t border-white/[0.06]">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
          Ready to Start{" "}
          <span className="text-gradient-cyber">Your Project</span>?
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Transform your vision into reality with our cutting-edge VR and web solutions.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Get in Touch
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="secondary" size="lg">
              View Services
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
