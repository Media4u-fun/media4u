"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Search, ExternalLink, Calendar, Package, Lock } from "lucide-react";
import Link from "next/link";

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

export default function ClientProjectsPage() {
  const projects = useQuery(api.projects.getMyProjects);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects by search
  const filtered = projects?.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.projectType.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">My Projects</h1>
        <p className="text-gray-400">View and track your website projects</p>
      </motion.div>

      {/* Search Bar */}
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

      {/* Projects Grid */}
      {filtered && filtered.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {filtered.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-elevated rounded-2xl p-6 hover:scale-[1.02] transition-transform"
            >
              {/* Header */}
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

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

              {/* Details */}
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

              {/* Actions */}
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50 transition-colors text-sm font-medium justify-center ${!project.liveUrl ? 'col-span-2' : ''}`}
                >
                  <Lock className="w-4 h-4" />
                  Setup Vault
                </Link>
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-elevated rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No projects yet</p>
          <p className="text-gray-500 text-sm">
            Your projects will appear here once they&apos;re created
          </p>
        </div>
      )}
    </div>
  );
}
