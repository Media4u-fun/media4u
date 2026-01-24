"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";

interface ProjectFormData {
  title: string;
  slug: string;
  category: string;
  description: string;
  fullDescription?: string;
  gradient: string;
  featured: boolean;
  technologies?: string[];
  images?: string[];
  testimonial?: string;
  results?: string[];
}

interface PortfolioProject extends ProjectFormData {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

const gradients = [
  "from-cyan-500 via-blue-600 to-purple-600",
  "from-purple-500 via-pink-500 to-rose-500",
  "from-emerald-500 via-teal-500 to-blue-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-indigo-500 via-purple-500 to-pink-500",
];

const categories = ["vr", "web", "integrated"];

export default function PortfolioAdminPage() {
  const projects = useQuery(api.portfolio.getAllProjects);
  const createProject = useMutation(api.portfolio.createProject);
  const updateProject = useMutation(api.portfolio.updateProject);
  const deleteProject = useMutation(api.portfolio.deleteProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    slug: "",
    category: "web",
    description: "",
    fullDescription: "",
    gradient: gradients[0],
    featured: false,
    technologies: [],
    images: [],
    testimonial: "",
    results: [],
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);

      const file = files[i];

      try {
        // Create FormData for our API route
        const apiFormData = new FormData();
        apiFormData.append("file", file);

        // Upload through our secure API route
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: apiFormData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          url?: string;
          error?: string;
        };

        if (data.success && data.url) {
          newImages.push(data.url);

          if (newImages.length === files.length) {
            setFormData({
              ...formData,
              images: [...(formData.images || []), ...newImages],
            });
            setUploadProgress("");
          }
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadProgress(`Error uploading ${file.name}`);
      }
    }
  }

  function removeImage(index: number) {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || [],
    });
  }

  function handleNewProject() {
    setIsCreating(true);
    setSelectedId(null);
    setFormData({
      title: "",
      slug: "",
      category: "web",
      description: "",
      fullDescription: "",
      gradient: gradients[0],
      featured: false,
      technologies: [],
      images: [],
      testimonial: "",
      results: [],
    });
  }

  function handleSelectProject(project: PortfolioProject) {
    setSelectedId(project._id);
    setIsCreating(false);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.description,
      fullDescription: project.fullDescription || "",
      gradient: project.gradient,
      featured: project.featured,
      technologies: project.technologies || [],
      images: project.images || [],
      testimonial: project.testimonial || "",
      results: project.results || [],
    });
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert("Please fill in title and slug");
      return;
    }

    try {
      if (isCreating) {
        await createProject(formData);
        alert("Project created!");
      } else if (selectedId) {
        await updateProject({
          id: selectedId as Id<"portfolioProjects">,
          ...formData,
        });
        alert("Project updated!");
      }
      handleNewProject();
    } catch (error) {
      alert("Error saving project");
      console.error(error);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm("Delete this project?")) return;

    try {
      await deleteProject({ id: selectedId as Id<"portfolioProjects"> });
      alert("Project deleted!");
      setSelectedId(null);
    } catch (error) {
      alert("Error deleting project");
      console.error(error);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Portfolio Projects</h1>
          <p className="text-gray-400">Create and manage your portfolio</p>
        </div>
        <button
          onClick={handleNewProject}
          className="px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium"
        >
          + New Project
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects List Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden h-full">
            <div className="p-4 border-b border-white/10 bg-white/5 sticky top-0">
              <p className="text-sm font-semibold text-gray-300">{projects?.length || 0} Projects</p>
            </div>
            <div className="divide-y divide-white/10 overflow-y-auto max-h-[calc(100vh-300px)]">
              {projects?.map((project) => (
                <motion.button
                  key={project._id}
                  onClick={() => handleSelectProject(project)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === project._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">{project.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{project.category}</p>
                  <div className="flex gap-2 mt-2">
                    {project.featured && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                        Featured
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="glass-elevated rounded-2xl p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="Project title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="project-slug"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gradient</label>
                <select
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {gradients.map((g) => (
                    <option key={g} value={g}>
                      {g.split(" ").slice(0, 2).join(" ")}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                rows={2}
                placeholder="Short description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
              <textarea
                value={formData.fullDescription || ""}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                rows={2}
                placeholder="Detailed description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Images {formData.images?.length ? `(${formData.images.length})` : ""}
              </label>
              <div className="mb-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-400">
                  💡 <strong>Tip:</strong> Upload images in 16:9 aspect ratio (e.g., 1920x1080, 1600x900) for best display
                </p>
              </div>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-cyan-500/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
              {uploadProgress && (
                <p className="text-sm text-cyan-400 mt-2">{uploadProgress}</p>
              )}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-300 mb-3">Uploaded Images:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Project ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-300">Featured Project</span>
            </label>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium"
              >
                {isCreating ? "Create" : "Update"}
              </button>
              {!isCreating && (
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
