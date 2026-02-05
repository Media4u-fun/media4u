/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Search, Plus, X, ExternalLink } from "lucide-react";

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

export default function ProjectsAdminPage() {
  const projects = useQuery(api.projects.getAllProjects);
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Project Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    description: "",
    requirements: "",
    budget: "",
    timeline: "",
    notes: "",
  });

  // Filter by status first, then search
  let filtered = projects;

  if (filterStatus !== "all" && filtered) {
    filtered = filtered.filter((p: any) => p.status === filterStatus);
  }

  if (searchQuery.trim() && filtered) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((p: any) =>
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query) ||
      p.projectType.toLowerCase().includes(query)
    );
  }

  const selected = projects?.find((p: any) => p._id === selectedId);

  async function handleStatusChange(id: Id<"projects">, newStatus: ProjectStatus) {
    await updateProject({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"projects">) {
    if (confirm("Delete this project? This cannot be undone.")) {
      await deleteProject({ id });
      setSelectedId(null);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.projectType || !formData.description) {
      alert("Please fill in Name, Email, Project Type, and Description");
      return;
    }

    await createProject({
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      phone: formData.phone || undefined,
      projectType: formData.projectType,
      description: formData.description,
      requirements: formData.requirements || undefined,
      budget: formData.budget || undefined,
      timeline: formData.timeline || undefined,
      notes: formData.notes || undefined,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      projectType: "",
      description: "",
      requirements: "",
      budget: "",
      timeline: "",
      notes: "",
    });
    setIsAddModalOpen(false);
  }

  async function handleUpdateField(field: string, value: string) {
    if (!selected) return;
    await updateProject({
      id: selected._id,
      [field]: value,
    });
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Client Projects</h1>
          <p className="text-gray-400">Manage your website and VR projects</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, company, or project type..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {(["all", "new", "planning", "design", "development", "review", "completed", "launched"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filterStatus === status
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {filtered?.length || 0} Projects
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filtered?.map((project: any) => (
                <motion.button
                  key={project._id}
                  onClick={() => setSelectedId(project._id)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === project._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">{project.name}</p>
                  <p className="text-xs text-gray-400 truncate">{project.projectType}</p>
                  {project.company && (
                    <p className="text-xs text-gray-500 truncate mt-1">{project.company}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[project.status as ProjectStatus]}`}
                    >
                      {statusLabels[project.status as ProjectStatus]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Client Name</p>
                <p className="text-xl font-semibold text-white">{selected.name}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-cyan-400 hover:text-cyan-300">
                    {selected.email}
                  </a>
                </div>

                {selected.phone && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${selected.phone}`} className="text-cyan-400 hover:text-cyan-300">
                      {selected.phone}
                    </a>
                  </div>
                )}
              </div>

              {selected.company && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Company</p>
                  <p className="text-white">{selected.company}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Project Type</p>
                <p className="text-white">{selected.projectType}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
                <p className="text-gray-300 whitespace-pre-wrap">{selected.description}</p>
              </div>

              {selected.requirements && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Requirements</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.requirements}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {selected.budget && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Budget</p>
                    <p className="text-white">{selected.budget}</p>
                  </div>
                )}

                {selected.timeline && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Timeline</p>
                    <p className="text-white">{selected.timeline}</p>
                  </div>
                )}
              </div>

              {/* Live URL (editable) */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Live Site URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={selected.liveUrl || ""}
                    onChange={(e) => handleUpdateField("liveUrl", e.target.value)}
                    placeholder="https://client-site.com"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  {selected.liveUrl && (
                    <a
                      href={selected.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </a>
                  )}
                </div>
              </div>

              {/* Notes (editable) */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Project Notes</p>
                <textarea
                  value={selected.notes}
                  onChange={(e) => handleUpdateField("notes", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Add notes about this project..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Created</p>
                  <p className="text-sm text-gray-300">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm text-gray-300">
                    {new Date(selected.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Project Status</p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "planning", "design", "development", "review", "completed", "launched"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusChange(selected._id, status)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selected.status === status
                          ? statusColors[status] + " border"
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDelete(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium"
              >
                Delete Project
              </button>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select a project to view details</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Project</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
                  required
                >
                  <option value="">Select project type...</option>
                  <option value="VR Website">VR Website</option>
                  <option value="Standard Website">Standard Website</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Web App">Web App</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Brief description of the project..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Specific features, pages, functionality needed..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Initial Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-all font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
