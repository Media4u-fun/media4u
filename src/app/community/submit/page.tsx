/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Globe,
  ExternalLink,
  Instagram,
  Youtube,
  X,
  Send,
  ImagePlus,
  Loader2,
} from "lucide-react";

// Wrap the main content in Suspense for useSearchParams
export default function CommunitySubmitPage() {
  return (
    <Suspense fallback={
      <div className="mesh-bg min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <CommunitySubmitContent />
    </Suspense>
  );
}

function CommunitySubmitContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const validation = useQuery(api.community.validateInviteToken, { token });
  const submitEntry = useMutation(api.community.submitCommunityEntry);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    worldName: "",
    description: "",
    images: [] as string[],
    multiverseUrl: "",
    websiteUrl: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    twitter: "",
  });

  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload a single image file to Cloudflare
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  }, []);

  // Handle multiple file uploads
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(f => f.type.startsWith("image/"));

    // Limit total images to 5
    const availableSlots = 5 - formData.images.length;
    const filesToUpload = imageFiles.slice(0, availableSlots);

    if (filesToUpload.length === 0) return;

    setUploadingCount(filesToUpload.length);

    const uploadPromises = filesToUpload.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter((url): url is string => url !== null);

    if (successfulUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...successfulUrls],
      }));
    }

    setUploadingCount(0);

    if (successfulUrls.length < filesToUpload.length) {
      alert("Some images failed to upload. Please try again.");
    }
  }, [formData.images.length, uploadImage]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  }, [handleFiles]);

  function removeImage(index: number) {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.worldName.trim() || !formData.description.trim()) {
      alert("Please fill in the required fields");
      return;
    }

    if (formData.images.length === 0) {
      alert("Please add at least one image of your VR world");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEntry({
        token,
        worldName: formData.worldName.trim(),
        description: formData.description.trim(),
        images: formData.images,
        multiverseUrl: formData.multiverseUrl.trim() || undefined,
        websiteUrl: formData.websiteUrl.trim() || undefined,
        socialLinks: {
          instagram: formData.instagram.trim() || undefined,
          youtube: formData.youtube.trim() || undefined,
          tiktok: formData.tiktok.trim() || undefined,
          twitter: formData.twitter.trim() || undefined,
        },
      });

      setIsSubmitted(true);
    } catch (error: any) {
      alert(error.message || "Failed to submit. Please try again.");
    }
    setIsSubmitting(false);
  }

  // Invalid or used token
  if (validation && !validation.valid) {
    return (
      <div className="mesh-bg min-h-screen pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-elevated rounded-2xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite</h1>
            <p className="text-gray-400 mb-6">{validation.error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
            >
              Go to Homepage
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Successfully submitted
  if (isSubmitted) {
    return (
      <div className="mesh-bg min-h-screen pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-elevated rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Submission Received!</h1>
            <p className="text-gray-400 mb-6">
              Thank you for sharing your VR world with us. We&apos;ll review your submission and
              let you know once it&apos;s approved to appear in our community showcase.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
            >
              Back to Media4U
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading
  if (!validation) {
    return (
      <div className="mesh-bg min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Submission form
  return (
    <div className="mesh-bg min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Welcome to the Community
          </h1>
          <p className="text-gray-400">
            Hi {validation.invite?.name}! Share your VR world with the Media4U Multiverse Community.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-elevated rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* World Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              World/Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.worldName}
              onChange={(e) => setFormData({ ...formData, worldName: e.target.value })}
              placeholder="e.g., Neon City VR, Crystal Island, etc."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your VR world. What makes it special? What can visitors experience there?"
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              required
            />
          </div>

          {/* Images - Drag and Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Images <span className="text-red-400">*</span>
              <span className="text-gray-500 font-normal"> (Upload up to 5 images)</span>
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Drag and drop zone */}
            {formData.images.length < 5 && (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragging
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/20 hover:border-cyan-500/50 hover:bg-white/5"
                  }
                  ${uploadingCount > 0 ? "pointer-events-none opacity-60" : ""}
                `}
              >
                {uploadingCount > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-gray-400">
                      Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isDragging ? "bg-cyan-500/20" : "bg-white/5"}
                    `}>
                      <ImagePlus className={`w-6 h-6 ${isDragging ? "text-cyan-400" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {isDragging ? "Drop images here" : "Drag & drop images here"}
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse - {5 - formData.images.length} slots remaining
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded images preview */}
            {formData.images.length > 0 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {formData.images.map((img, idx) => (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              Supported: JPG, PNG, GIF, WebP - Max 5 images
            </p>
          </div>

          {/* Links */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Multiverse Link
              </label>
              <input
                type="url"
                value={formData.multiverseUrl}
                onChange={(e) => setFormData({ ...formData, multiverseUrl: e.target.value })}
                placeholder="Link to your VR world"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                Website
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="Your website (optional)"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Social Links <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-400" />
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="Instagram URL"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-400" />
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="YouTube URL"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  placeholder="TikTok URL"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-white" />
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="X/Twitter URL"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit for Review
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Your submission will be reviewed before appearing in the community showcase.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
