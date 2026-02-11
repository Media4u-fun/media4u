"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Search, ExternalLink, Calendar, Package, Lock, Globe, Palette, Glasses, Rocket, ArrowRight, Plus, ChevronLeft, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ProjectWizard } from "../../start-project/project-wizard";
import { IntakeForm } from "./IntakeForm";
import { CustomDealPanel } from "./CustomDealPanel";

type ProjectStatus = "new" | "planning" | "design" | "development" | "review" | "completed" | "launched";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  planning: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  design: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  development: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  launched: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const statusLabels: Record<ProjectStatus, string> = {
  new: "New",
  planning: "Planning",
  design: "Design",
  development: "Development",
  review: "Review",
  completed: "Completed",
  launched: "Launched",
};

const BUILD_OPTIONS = [
  {
    icon: Globe,
    title: "Professional Website",
    description: "Modern, mobile-responsive websites that convert visitors into customers. Landing pages, business sites, eCommerce, and more.",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "hover:border-cyan-500/50",
    iconColor: "text-cyan-400",
    tag: "Most Popular",
    tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    icon: Palette,
    title: "Branding & Design",
    description: "Logos, social graphics, video assets, and visual identity that make your brand stand out across every platform.",
    gradient: "from-purple-500/20 to-purple-500/5",
    borderColor: "hover:border-purple-500/50",
    iconColor: "text-purple-400",
    tag: null,
    tagColor: "",
  },
  {
    icon: Glasses,
    title: "VR Experience",
    description: "Immersive virtual storefronts, showrooms, and interactive 3D environments that put your brand in a league of its own.",
    gradient: "from-pink-500/20 to-pink-500/5",
    borderColor: "hover:border-pink-500/50",
    iconColor: "text-pink-400",
    tag: "Innovative",
    tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  {
    icon: Rocket,
    title: "Website + VR Bundle",
    description: "The complete package - a professional website that connects seamlessly to an immersive VR environment. One unified brand presence.",
    gradient: "from-orange-500/20 to-orange-500/5",
    borderColor: "hover:border-orange-500/50",
    iconColor: "text-orange-400",
    tag: "Best Value",
    tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
];

function BuildYourProject({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-10">
        <span className="inline-block mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
          Get Started
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          Build Your Project
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Choose what you want to build and we will guide you through the process. No commitment - just a clear path forward.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {BUILD_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <button onClick={onStart} className="w-full text-left">
                <div
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${option.gradient} border border-white/10 ${option.borderColor} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                >
                  {option.tag && (
                    <span className={`inline-block mb-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${option.tagColor}`}>
                      {option.tag}
                    </span>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors flex-shrink-0">
                      <Icon className={`w-6 h-6 ${option.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1.5">{option.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{option.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-elevated rounded-2xl p-6 text-center"
      >
        <p className="text-gray-400 mb-4">
          Not sure where to start? Our project wizard will help you figure it out - step by step.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors"
        >
          Start the Process
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// Custom deal project view - intake form + invoice/subscription panel
function CustomDealView({ project }: { project: Doc<"projects"> }) {
  const [intakeSubmitted, setIntakeSubmitted] = useState(!!project.intakeSubmittedAt);
  const [view, setView] = useState<"status" | "edit-intake">("status");

  if (!intakeSubmitted || view === "edit-intake") {
    return (
      <div>
        {intakeSubmitted && (
          <button
            onClick={() => setView("status")}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Project Status
          </button>
        )}
        <IntakeForm
          project={project}
          onSubmitted={() => {
            setIntakeSubmitted(true);
            setView("status");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Project header */}
      <div className="glass-elevated rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-0.5">{project.projectType}</h2>
              {project.company && <p className="text-sm text-gray-400">{project.company}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[project.status as ProjectStatus] ?? statusColors.new}`}>
                  {statusLabels[project.status as ProjectStatus] ?? project.status}
                </span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  Intake submitted
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setView("edit-intake")}
            className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Update intake info
          </button>
        </div>
      </div>

      {/* Invoice + Subscription panels */}
      <CustomDealPanel project={project} />
    </div>
  );
}

export default function ClientProjectsPage() {
  const projects = useQuery(api.projects.getMyProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  // Separate custom deal projects from standard projects
  const customDealProjects = projects?.filter((p) => p.isCustomDeal) ?? [];
  const standardProjects = projects?.filter((p) => !p.isCustomDeal) ?? [];

  const filtered = standardProjects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.projectType.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query)
    );
  });

  const hasStandardProjects = standardProjects.length > 0;
  const hasCustomDeal = customDealProjects.length > 0;
  const hasAnyProjects = projects && projects.length > 0;

  // If the client has a custom deal project and no standard projects yet,
  // show the custom deal flow instead of the build options
  if (projects !== undefined && hasCustomDeal && !showWizard) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold mb-2">My Projects</h1>
          <p className="text-gray-400">View and track your projects</p>
        </motion.div>

        {/* Custom deal projects */}
        <div className="space-y-8">
          {customDealProjects.map((project) => (
            <CustomDealView key={project._id} project={project} />
          ))}
        </div>

        {/* Standard projects below if they also have some */}
        {hasStandardProjects && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Other Projects</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {standardProjects.map((project) => (
                <StandardProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          {showWizard ? (
            <>
              <button
                onClick={() => setShowWizard(false)}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Projects
              </button>
              <h1 className="text-4xl font-display font-bold mb-2">Start a Project</h1>
              <p className="text-gray-400">Fill out the steps below and we will follow up within 1-2 business days.</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-display font-bold mb-2">My Projects</h1>
              <p className="text-gray-400">View and track your website projects</p>
            </>
          )}
        </div>
        {hasAnyProjects && !showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </motion.div>

      {/* Inline wizard */}
      {showWizard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProjectWizard />
        </motion.div>
      )}

      {/* Show build options when no projects and not in wizard */}
      {!showWizard && projects !== undefined && !hasAnyProjects && (
        <BuildYourProject onStart={() => setShowWizard(true)} />
      )}

      {/* Show projects grid when they have standard projects and not in wizard */}
      {hasStandardProjects && !showWizard && (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.length > 0 ? (
              filtered.map((project) => (
                <StandardProjectCard key={project._id} project={project} />
              ))
            ) : (
              <div className="col-span-2 glass-elevated rounded-2xl p-8 text-center">
                <p className="text-gray-400">No projects match your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StandardProjectCard({ project }: { project: Doc<"projects"> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-elevated rounded-2xl p-6 hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{project.projectType}</h3>
          {project.company && (
            <p className="text-sm text-gray-400">{project.company}</p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
            statusColors[project.status as ProjectStatus]
          }`}
        >
          {statusLabels[project.status as ProjectStatus]}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-white/10">
        {project.budget && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{project.budget}</span>
          </div>
        )}
        {project.timeline && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{project.timeline}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50 transition-colors text-sm font-medium justify-center"
          >
            <ExternalLink className="w-4 h-4" />
            Live Site
          </a>
        )}
        <Link
          href={`/portal/projects/${project._id}/vault`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50 transition-colors text-sm font-medium justify-center ${!project.liveUrl ? "col-span-2" : ""}`}
        >
          <Lock className="w-4 h-4" />
          Setup Vault
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}
