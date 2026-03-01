"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "@convex/_generated/dataModel";
import { FileText, ArrowLeft, Check, AlertCircle, Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";

const NewsletterEditor = dynamic(
  () => import("@/components/admin/NewsletterEditor"),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-white/5 border border-white/10 animate-pulse" /> }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  gradient: string;
  imageStorageId?: string; // legacy
  imageUrl?: string; // Cloudflare URL
  featured: boolean;
  published: boolean;
}

interface BlogPost extends BlogFormData {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRADIENTS = [
  { label: "Brand Blue", value: "from-brand-light via-brand to-brand-dark" },
  { label: "Deep Brand", value: "from-brand via-brand-dark to-brand-dark" },
  { label: "Teal", value: "from-emerald-500 via-teal-500 to-teal-400" },
  { label: "Amber", value: "from-orange-500 via-amber-500 to-yellow-500" },
  { label: "Purple", value: "from-purple-500 via-violet-500 to-indigo-500" },
];

const EMPTY_FORM: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "VR Technology",
  date: new Date().toISOString().split("T")[0],
  readTime: "5 min read",
  gradient: GRADIENTS[0].value,
  featured: false,
  published: false,
};

// ---------------------------------------------------------------------------
// Toast component
// ---------------------------------------------------------------------------

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl ${
        type === "success"
          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
          : "bg-red-500/20 border-red-500/40 text-red-300"
      }`}
    >
      {type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BlogAdminPage() {
  const posts = useQuery(api.blog.getAllPosts, {});
  const createPost = useMutation(api.blog.createBlogPost);
  const updatePost = useMutation(api.blog.updateBlogPost);
  const deletePost = useMutation(api.blog.deleteBlogPost);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [formData, setFormData] = useState<BlogFormData>(EMPTY_FORM);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  // Auto-generate slug from title
  function handleTitleChange(title: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData((f) => ({ ...f, title, slug: f.slug === autoSlug(f.title) ? slug : f.slug }));
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  const filteredPosts = posts
    ? filterPublished === "all"
      ? posts
      : posts.filter((p) => (filterPublished === "published" ? p.published : !p.published))
    : undefined;

  function handleNewPost() {
    setIsCreating(true);
    setSelectedId(null);
    setImageFile(null);
    setFormData({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
  }

  function handleSelectPost(post: BlogPost) {
    setSelectedId(post._id);
    setIsCreating(false);
    setImageFile(null);
    const p = post as BlogPost & { imageUrl?: string };
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      date: post.date,
      readTime: post.readTime,
      gradient: post.gradient,
      imageUrl: p.imageUrl,
      featured: post.featured,
      published: post.published,
    });
  }

  async function handleImageUpload(): Promise<string | undefined> {
    if (!imageFile) return undefined;
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url as string;
    } catch {
      showToast("Failed to upload featured image", "error");
      return undefined;
    }
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.slug.trim()) {
      showToast("Title and slug are required", "error");
      return;
    }
    if (!formData.content || formData.content === "<p></p>") {
      showToast("Content cannot be empty", "error");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploaded = await handleImageUpload();
        if (uploaded) imageUrl = uploaded;
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        date: formData.date,
        readTime: formData.readTime,
        gradient: formData.gradient,
        imageUrl,
        featured: formData.featured,
        published: formData.published,
      };

      if (isCreating) {
        await createPost(payload);
        showToast("Blog post created!", "success");
      } else if (selectedId) {
        await updatePost({ id: selectedId as Id<"blogPosts">, ...payload });
        showToast("Blog post updated!", "success");
      }
      handleNewPost();
    } catch (err) {
      console.error(err);
      showToast("Failed to save blog post", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    try {
      await deletePost({ id: selectedId as Id<"blogPosts"> });
      showToast("Blog post deleted", "success");
      setSelectedId(null);
      setIsCreating(false);
    } catch {
      showToast("Failed to delete blog post", "error");
    }
  }

  const showForm = isCreating || !!selectedId;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Blog Posts</h1>
          <p className="text-gray-400">Create and manage your blog content</p>
        </div>
        <button
          onClick={handleNewPost}
          className="px-6 py-3 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/50 font-medium"
        >
          + New Post
        </button>
      </motion.div>

      {/* Filter */}
      <div className="mb-6 flex gap-3">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterPublished(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filterPublished === f
                ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-1 ${showForm ? "hidden lg:block" : ""}`}
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              {posts === undefined ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading posts...
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-300">{filteredPosts?.length ?? 0} Posts</p>
              )}
            </div>

            {posts === null ? (
              <div className="p-6 text-center text-red-400 text-sm">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                Failed to load posts. Please refresh.
              </div>
            ) : (
              <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                {filteredPosts?.map((post) => (
                  <motion.button
                    key={post._id}
                    onClick={() => handleSelectPost(post as unknown as BlogPost)}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    className={`w-full p-4 text-left transition-all border-l-4 ${
                      selectedId === post._id
                        ? "border-brand-light bg-white/10"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white text-sm truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{post.category}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${post.published ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                      {post.featured && (
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Featured
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
                {filteredPosts?.length === 0 && (
                  <div className="p-8 text-center text-gray-600 text-sm">No posts found</div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Form / Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-2 ${!showForm ? "hidden lg:block" : ""}`}
        >
          {!showForm ? (
            <div className="glass-elevated rounded-2xl p-12 flex flex-col items-center justify-center min-h-96">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">No Post Selected</h2>
              <p className="text-gray-400 mb-8">Choose a post from the list or create a new one.</p>
              <button
                onClick={handleNewPost}
                className="px-8 py-3 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/50 font-medium"
              >
                + Create New Post
              </button>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-6 space-y-5">
              {/* Back button (mobile) */}
              <button
                onClick={() => { setSelectedId(null); setIsCreating(false); }}
                className="lg:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to list
              </button>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 transition-colors"
                  placeholder="Post title"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 transition-colors font-mono text-sm"
                  placeholder="post-slug"
                />
              </div>

              {/* Category + Read Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 transition-colors"
                    placeholder="Category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData((f) => ({ ...f, readTime: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 transition-colors"
                    placeholder="5 min read"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none transition-colors"
                  rows={2}
                  placeholder="Short summary shown in post previews"
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Featured Image {formData.imageUrl && <span className="text-emerald-400 text-xs ml-1">(image set)</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-light/20 file:text-brand-light hover:file:bg-brand-light/30 text-sm"
                />
                {imageFile && (
                  <p className="text-xs text-gray-400 mt-1.5">Selected: {imageFile.name}</p>
                )}
              </div>

              {/* Rich Text Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Content *</label>
                <NewsletterEditor
                  content={formData.content}
                  onChange={(html) => setFormData((f) => ({ ...f, content: html }))}
                />
              </div>

              {/* Gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Card Gradient</label>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setFormData((f) => ({ ...f, gradient: g.value }))}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        formData.gradient === g.value
                          ? "border-brand-light/60 bg-brand-light/10 text-brand-light"
                          : "border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-sm bg-gradient-to-r ${g.value}`} />
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setFormData((f) => ({ ...f, published: !f.published }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${formData.published ? "bg-emerald-500" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.published ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Published</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setFormData((f) => ({ ...f, featured: !f.featured }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${formData.featured ? "bg-yellow-500" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.featured ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Featured</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-white/8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/50 font-medium disabled:opacity-50"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isCreating ? "Create Post" : "Update Post"}
                </button>
                {!isCreating && (
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium disabled:opacity-50"
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
