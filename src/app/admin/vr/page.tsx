/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import {
  Glasses,
  Sparkles,
  Pencil,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";

interface VRExperienceFormData {
  title: string;
  slug: string;
  type: "property" | "destination";
  categories: string[];
  description: string;
  fullDescription?: string;
  thumbnailImage: string;
  gallery?: string[];
  features?: Array<{ name: string; description: string }>;
  multiverseUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  price?: number;
  gradient: string;
  featured: boolean;
  testimonial?: string;
}

interface VRExperience extends VRExperienceFormData {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

const gradients = [
  "from-brand-light via-brand to-brand-dark",
  "from-brand via-brand-dark to-brand-dark",
  "from-emerald-500 via-teal-500 to-blue-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-brand-light via-brand to-brand-dark",
];

const types = ["property", "destination"] as const;

const availableCategories = [
  "Mall",
  "Shopping",
  "Multiverse",
  "Welcome Center",
  "Event Space",
  "Penthouse",
  "Apartment",
  "Community",
  "Entertainment",
];

export default function VRAdminPage() {
  const experiences = useQuery(api.vr.getAllExperiences);
  const createExperience = useMutation(api.vr.createExperience);
  const updateExperience = useMutation(api.vr.updateExperience);
  const deleteExperience = useMutation(api.vr.deleteExperience);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [newFeature, setNewFeature] = useState({ name: "", description: "" });
  const [formData, setFormData] = useState<VRExperienceFormData>({
    title: "",
    slug: "",
    type: "property",
    categories: [],
    description: "",
    fullDescription: "",
    thumbnailImage: "",
    gallery: [],
    features: [],
    multiverseUrl: "",
    websiteUrl: "",
    contactEmail: "",
    price: undefined,
    gradient: gradients[0],
    featured: false,
    testimonial: "",
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);

      const file = files[i];

      try {
        const apiFormData = new FormData();
        apiFormData.append("file", file);

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
            // First image becomes thumbnail, rest go to gallery
            if (!formData.thumbnailImage && newImages.length > 0) {
              setFormData({
                ...formData,
                thumbnailImage: newImages[0],
                gallery: [...(formData.gallery || []), ...newImages.slice(1)],
              });
            } else {
              setFormData({
                ...formData,
                gallery: [...(formData.gallery || []), ...newImages],
              });
            }
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

  function removeImage(url: string) {
    if (url === formData.thumbnailImage) {
      const newGallery = formData.gallery || [];
      setFormData({
        ...formData,
        thumbnailImage: newGallery[0] || "",
        gallery: newGallery.slice(1),
      });
    } else {
      setFormData({
        ...formData,
        gallery: (formData.gallery || []).filter((img) => img !== url),
      });
    }
  }

  function addCategory() {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory],
      });
      setNewCategory("");
    }
  }

  function removeCategory(category: string) {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    });
  }

  function addFeature() {
    if (newFeature.name && newFeature.description) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature],
      });
      setNewFeature({ name: "", description: "" });
    }
  }

  function removeFeature(index: number) {
    setFormData({
      ...formData,
      features: (formData.features || []).filter((_, i) => i !== index),
    });
  }

  function handleNewExperience() {
    setIsCreating(true);
    setSelectedId(null);
    setFormData({
      title: "",
      slug: "",
      type: "property",
      categories: [],
      description: "",
      fullDescription: "",
      thumbnailImage: "",
      gallery: [],
      features: [],
      multiverseUrl: "",
      websiteUrl: "",
      contactEmail: "",
      price: undefined,
      gradient: gradients[0],
      featured: false,
      testimonial: "",
    });
  }

  function handleSelectExperience(experience: VRExperience) {
    setSelectedId(experience._id);
    setIsCreating(false);
    setFormData({
      title: experience.title,
      slug: experience.slug,
      type: experience.type,
      categories: experience.categories,
      description: experience.description,
      fullDescription: experience.fullDescription || "",
      thumbnailImage: experience.thumbnailImage,
      gallery: experience.gallery || [],
      features: experience.features || [],
      multiverseUrl: experience.multiverseUrl || "",
      websiteUrl: experience.websiteUrl || "",
      contactEmail: experience.contactEmail || "",
      price: experience.price || undefined,
      gradient: experience.gradient,
      featured: experience.featured,
      testimonial: experience.testimonial || "",
    });
  }

  async function handleSave() {
    // Detailed validation with helpful messages
    if (!formData.title || formData.title.trim().length === 0) {
      alert("Please enter a title");
      return;
    }

    if (!formData.slug || formData.slug.trim().length === 0) {
      alert("Please enter a slug (URL-friendly name, e.g., 'my-property')");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter a description");
      return;
    }

    if (!formData.thumbnailImage) {
      alert("Please upload a thumbnail image first");
      return;
    }

    if (formData.categories.length === 0) {
      alert("Please add at least one category");
      return;
    }

    try {
      if (isCreating) {
        await createExperience(formData);
        alert("Experience created!");
      } else if (selectedId) {
        await updateExperience({
          id: selectedId as Id<"vrExperiences">,
          ...formData,
        });
        alert("Experience updated!");
      }
      handleNewExperience();
    } catch (error) {
      alert("Error saving experience: " + (error instanceof Error ? error.message : String(error)));
      console.error(error);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm("Delete this experience?")) return;

    try {
      await deleteExperience({ id: selectedId as Id<"vrExperiences"> });
      alert("Experience deleted!");
      setSelectedId(null);
    } catch (error) {
      alert("Error deleting experience");
      console.error(error);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">VR Experiences</h1>
          <p className="text-gray-400">Create and manage VR properties and destinations</p>
        </div>
        <button
          onClick={handleNewExperience}
          className="px-6 py-3 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/50 font-medium"
        >
          + New Experience
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: experiences?.length ?? 0, color: "text-brand-light" },
          { label: "Properties", value: experiences?.filter((e: any) => e.type === "property").length ?? 0, color: "text-blue-400" },
          { label: "Destinations", value: experiences?.filter((e: any) => e.type === "destination").length ?? 0, color: "text-purple-400" },
          { label: "Featured", value: experiences?.filter((e: any) => e.featured).length ?? 0, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="glass-elevated rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Experiences List Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-1 ${selectedId || isCreating ? 'hidden lg:block' : ''}`}
        >
          <div className="glass-elevated rounded-2xl overflow-hidden h-full">
            <div className="p-4 border-b border-white/10 bg-white/5 sticky top-0">
              <p className="text-sm font-semibold text-gray-300">{experiences?.length || 0} Experiences</p>
            </div>
            {experiences && experiences.length > 0 ? (
              <div className="divide-y divide-white/10 overflow-y-auto max-h-[calc(100vh-300px)]">
                {experiences.map((experience: any) => (
                  <motion.button
                    key={experience._id}
                    onClick={() => handleSelectExperience(experience)}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    className={`w-full p-4 text-left transition-all border-l-4 ${
                      selectedId === experience._id
                        ? "border-brand-light bg-white/10"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white text-sm truncate">{experience.title}</p>
                    <div className="flex gap-2 mt-1">
                      <p className="text-xs text-gray-400 capitalize">{experience.type}</p>
                      {experience.featured && (
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                          Featured
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">No experiences yet</p>
                <p className="text-xs mt-2">Create your first one →</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Form or Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-3 ${!selectedId && !isCreating ? 'hidden lg:block' : ''}`}
        >
          {!isCreating && !selectedId ? (
            <div className="glass-elevated rounded-2xl p-12 flex flex-col items-center justify-center min-h-96">
              <div className="text-center">
                <Glasses className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-white mb-2">No Experience Selected</h2>
                <p className="text-gray-400 mb-8">Choose an experience from the list to edit it, or create a new one.</p>
                <button
                  onClick={handleNewExperience}
                  className="px-8 py-3 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/50 font-medium"
                >
                  + Create New Experience
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
              <button
                onClick={() => { setSelectedId(null); setIsCreating(false); }}
                className="lg:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to list
              </button>
              {/* Form Header */}
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  {isCreating ? (
                    <>
                      <Sparkles className="w-6 h-6" /> Create New Experience
                    </>
                  ) : (
                    <>
                      <Pencil className="w-6 h-6" /> Edit Experience
                    </>
                  )}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isCreating ? "Add a new VR property or destination" : formData.title || "Configure this experience"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="Experience title"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                placeholder="experience-slug"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "property" | "destination" })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gradient</label>
                <select
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
              <div className="flex gap-2 mb-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50"
                >
                  Add
                </button>
              </div>
              {formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((cat) => (
                    <div
                      key={cat}
                      className="px-3 py-1 rounded-full bg-brand-light/20 border border-brand-light/50 text-brand-light text-sm flex items-center gap-2"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
                rows={2}
                placeholder="Short description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
              <textarea
                value={formData.fullDescription || ""}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
                rows={3}
                placeholder="Detailed description"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Images (Thumbnail + Gallery)
              </label>
              <div className="mb-4 p-4 rounded-lg bg-brand-light/10 border border-brand-light/30">
                <p className="text-sm text-brand-light flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 inline-block mt-0.5 flex-shrink-0" />
                  <span><strong>Tip:</strong> First image uploaded becomes the thumbnail. Additional images go to gallery.</span>
                </p>
              </div>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-brand-light/50 transition-colors">
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
                <p className="text-sm text-brand-light mt-2">{uploadProgress}</p>
              )}

              {/* Thumbnail Image */}
              {formData.thumbnailImage && (
                <div className="mt-6">
                  <p className="text-sm text-gray-300 mb-3 font-medium">Thumbnail Image</p>
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.thumbnailImage}
                      alt="Thumbnail"
                      className="w-full h-48 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(formData.thumbnailImage)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Gallery Images */}
              {formData.gallery && formData.gallery.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-300 mb-3 font-medium">Gallery Images ({formData.gallery.length})</p>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.gallery.map((img, idx) => (
                      <div key={idx} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
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

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="Feature name"
                />
                <textarea
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
                  rows={2}
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="w-full px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50"
                >
                  Add Feature
                </button>
              </div>
              {formData.features && formData.features.length > 0 && (
                <div className="space-y-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{feature.name}</p>
                          <p className="text-sm text-gray-400">{feature.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Multiverse URL</label>
                <input
                  type="url"
                  value={formData.multiverseUrl || ""}
                  onChange={(e) => setFormData({ ...formData, multiverseUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                <input
                  type="url"
                  value={formData.websiteUrl || ""}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price (Meta Coins)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Testimonial</label>
              <textarea
                value={formData.testimonial || ""}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
                rows={2}
                placeholder="Optional testimonial or quote"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-300">Featured Experience</span>
            </label>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/50 font-medium"
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
          )}
        </motion.div>
      </div>
    </div>
  );
}
