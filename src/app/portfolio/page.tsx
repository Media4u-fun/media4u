"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";
import Link from "next/link";

type ProjectCategory = "all" | "vr" | "web" | "integrated";

interface DbProject {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  gradient: string;
  featured: boolean;
  fullDescription?: string;
  technologies?: string[];
  images?: string[];
  testimonial?: string;
  results?: string[];
  createdAt: number;
  updatedAt: number;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  category: Exclude<ProjectCategory, "all">;
  description: string;
  gradient: string;
  images?: string[];
}

// Fallback projects data kept for future use if Convex is unavailable
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FALLBACK_PROJECTS: Project[] = [
  {
    id: "virtual-conference-hall",
    slug: "virtual-conference-hall",
    title: "Virtual Conference Hall",
    category: "vr",
    description: "Immersive 3D conference space with real-time collaboration tools for remote teams.",
    gradient: "from-cyan-500 via-blue-600 to-purple-600",
  },
  {
    id: "tech-startup-landing",
    slug: "tech-startup-landing",
    title: "Tech Startup Landing Page",
    category: "web",
    description: "High-converting landing page with dynamic animations and seamless user experience.",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    id: "connected-brand",
    slug: "connected-brand",
    title: "Connected Brand Experience",
    category: "integrated",
    description: "Cross-platform brand presence spanning web, VR, and interactive installations.",
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    id: "virtual-art-gallery",
    slug: "virtual-art-gallery",
    title: "Virtual Art Gallery",
    category: "vr",
    description: "Museum-quality virtual space showcasing digital and traditional artwork collections.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    id: "ecommerce-platform",
    slug: "ecommerce-platform",
    title: "E-Commerce Platform",
    category: "web",
    description: "Full-featured online store with 3D product previews and AR try-on capabilities.",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  {
    id: "educational-vr-campus",
    slug: "educational-vr-campus",
    title: "Educational VR Campus",
    category: "vr",
    description: "Interactive virtual campus environment for immersive learning experiences.",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
  },
];

const FILTER_TABS: { value: ProjectCategory; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "web", label: "Websites" },
  { value: "vr", label: "VR Experiences" },
  { value: "integrated", label: "Web + VR" },
];

const CATEGORY_LABELS: Record<Exclude<ProjectCategory, "all">, string> = {
  vr: "VR Experience",
  web: "Website",
  integrated: "Web + VR",
};

const CATEGORY_COLORS: Record<Exclude<ProjectCategory, "all">, string> = {
  vr: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  web: "bg-magenta-500/20 text-magenta-400 border-magenta-500/30",
  integrated: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>("all");

  // Fetch projects from Convex
  const convexProjects = useQuery(api.portfolio.getAllProjects);
  const isLoading = convexProjects === undefined;

  // Transform Convex data when available
  const PROJECTS = convexProjects
    ? convexProjects.map((p: DbProject) => ({
        id: p._id,
        slug: p.slug,
        title: p.title,
        category: p.category as Exclude<ProjectCategory, "all">,
        description: p.description,
        gradient: p.gradient,
        images: p.images,
      }))
    : [];

  const filteredProjects =
    activeFilter === "all"
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === activeFilter);

  return (
    <div className="min-h-screen mesh-bg">
      <Section className="pt-32 md:pt-40">
        <SectionHeader
          tag="Our Work"
          title="Client "
          highlight="Projects"
          description="Web design, VR experiences, and integrated solutions that bring brands to life. Ready to add your project here? Let's talk."
        />

        <FilterTabs
          tabs={FILTER_TABS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <ProjectGrid projects={filteredProjects} isLoading={isLoading} />
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
  isLoading: boolean;
}

function ProjectGrid({ projects, isLoading }: ProjectGridProps) {
  // Show 6 skeleton cards while loading
  const skeletonCount = 6;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProjectCardSkeleton key={`skeleton-${index}`} index={index} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-2xl font-display font-bold text-white mb-2">No Projects Found</h3>
        <p className="text-gray-400">Try selecting a different category or check back soon!</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="wait">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ProjectCardSkeletonProps {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProjectCardSkeleton({ index: _index }: ProjectCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
    >
      {/* Image skeleton */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-3">
        {/* Category badge skeleton */}
        <div className="h-6 bg-white/5 rounded-full w-24 mb-2 animate-pulse" />
        {/* Title skeleton */}
        <div className="h-6 bg-white/5 rounded w-3/4 animate-pulse" />
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProjectCard({ project, index: _index }: ProjectCardProps) {
  const hasImage = project.images && project.images.length > 0;

  return (
    <Link href={`/portfolio/${project.slug}`}>
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -8 }}
        className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_60px_rgba(0,212,255,0.15)] cursor-pointer h-full"
      >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.images![0]}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          </>
        )}
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
    </Link>
  );
}

function CTASection() {
  return (
    <Section className="border-t border-white/[0.06]">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
          Let&apos;s Build Something{" "}
          <span className="text-gradient-cyber">Amazing</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Whether you need a professional website, an immersive VR experience, or both working together-
          we&apos;re here to help your brand grow.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Start Your Project
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="secondary" size="lg">
              See Our Services
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
