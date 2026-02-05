/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { FileText } from "lucide-react";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  gradient: string;
  imageStorageId?: string;
  featured: boolean;
  published: boolean;
}

interface BlogPost extends BlogFormData {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

const gradients = [
  "from-cyan-500 via-blue-500 to-purple-600",
  "from-purple-500 via-pink-500 to-rose-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-pink-500 via-purple-500 to-indigo-500",
];

export default function BlogAdminPage() {
  const posts = useQuery(api.blog.getAllPosts, {});
  const createPost = useMutation(api.blog.createBlogPost);
  const updatePost = useMutation(api.blog.updateBlogPost);
  const deletePost = useMutation(api.blog.deleteBlogPost);
  const generateUploadUrl = useMutation(api.blog.generateUploadUrl);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "VR Technology",
    date: new Date().toISOString().split("T")[0],
    readTime: "5 min read",
    gradient: gradients[0],
    featured: false,
    published: false,
  });

  // Filter posts based on published status
  const filteredPosts = posts && filterPublished !== "all"
    ? posts.filter((p: any) =>
        filterPublished === "published" ? p.published : !p.published
      )
    : posts;

  function handleNewPost() {
    setIsCreating(true);
    setSelectedId(null);
    setImageFile(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "VR Technology",
      date: new Date().toISOString().split("T")[0],
      readTime: "5 min read",
      gradient: gradients[0],
      featured: false,
      published: false,
    });
  }

  async function handleImageUpload(): Promise<string | undefined> {
    if (!imageFile) return undefined;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });

      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
      return undefined;
    } finally {
      setIsUploading(false);
    }
  }

  function handleSelectPost(post: BlogPost) {
    setSelectedId(post._id);
    setIsCreating(false);
    setImageFile(null);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      date: post.date,
      readTime: post.readTime,
      gradient: post.gradient,
      imageStorageId: (post as any).imageStorageId,
      featured: post.featured,
      published: post.published,
    });
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert("Please fill in title and slug");
      return;
    }

    try {
      let imageStorageId = formData.imageStorageId;

      if (imageFile) {
        const uploadedId = await handleImageUpload();
        if (uploadedId) {
          imageStorageId = uploadedId;
        }
      }

      if (isCreating) {
        await createPost({ ...formData, imageStorageId: imageStorageId as Id<"_storage"> | undefined });
        alert("Blog post created!");
      } else if (selectedId) {
        await updatePost({
          id: selectedId as Id<"blogPosts">,
          ...formData,
          imageStorageId: imageStorageId as Id<"_storage"> | undefined,
        });
        alert("Blog post updated!");
      }
      handleNewPost();
    } catch (error) {
      alert("Error saving blog post");
      console.error(error);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm("Delete this blog post?")) return;

    try {
      await deletePost({ id: selectedId as Id<"blogPosts"> });
      alert("Blog post deleted!");
      setSelectedId(null);
    } catch (error) {
      alert("Error deleting blog post");
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
          <h1 className="text-4xl font-display font-bold mb-2">Blog Posts</h1>
          <p className="text-gray-400">Create and manage your blog content</p>
        </div>
        <button
          onClick={handleNewPost}
          className="px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium"
        >
          + New Post
        </button>
      </motion.div>

      {/* Filter */}
      <div className="mb-6 flex gap-3">
        {(["all", "published", "draft"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterPublished(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filterPublished === filter
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {filter}
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
              <p className="text-sm font-semibold text-gray-300">{filteredPosts?.length || 0} Posts</p>
            </div>
            <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
              {filteredPosts?.map((post: any) => (
                <motion.button
                  key={post._id}
                  onClick={() => handleSelectPost(post)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === post._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">{post.category}</p>
                  <div className="flex gap-2 mt-2">
                    {post.published && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                        Published
                      </span>
                    )}
                    {post.featured && (
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

        {/* Form or Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {!isCreating && !selectedId ? (
            <div className="glass-elevated rounded-2xl p-12 flex flex-col items-center justify-center min-h-96">
              <div className="text-center">
                <FileText className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-white mb-2">No Post Selected</h2>
                <p className="text-gray-400 mb-8">Choose a post from the list to edit it, or create a new one.</p>
                <button
                  onClick={handleNewPost}
                  className="px-8 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium"
                >
                  + Create New Post
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="post-slug"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  placeholder="Category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Read Time</label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  placeholder="5 min read"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                rows={2}
                placeholder="Short summary of the post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image {formData.imageStorageId && "(Currently has image)"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
              />
              {imageFile && (
                <p className="text-sm text-gray-400 mt-2">Selected: {imageFile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-sm"
                rows={6}
                placeholder="Your blog post content..."
              />
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
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-300">Published</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-300">Featured</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isUploading}
                className="flex-1 px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : isCreating ? "Create" : "Update"}
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
