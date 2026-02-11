"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { motion } from "motion/react";
import { Upload, X, CheckCircle, Loader2, FileImage } from "lucide-react";

interface IntakeFormProps {
  project: Doc<"projects">;
  onSubmitted: () => void;
}

export function IntakeForm({ project, onSubmitted }: IntakeFormProps) {
  const generateLogoUploadUrl = useMutation(api.projects.generateLogoUploadUrl);
  const submitIntake = useMutation(api.projects.submitIntake);

  const [company, setCompany] = useState(project.company ?? "");
  const [phone, setPhone] = useState(project.phone ?? "");
  const [primaryColor, setPrimaryColor] = useState(project.brandColors?.primary ?? "");
  const [secondaryColor, setSecondaryColor] = useState(project.brandColors?.secondary ?? "");
  const [websiteGoals, setWebsiteGoals] = useState(project.websiteGoals ?? "");
  const [requirements, setRequirements] = useState(project.requirements ?? "");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function clearLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let logoStorageId: string | undefined;

      if (logoFile) {
        setUploading(true);
        const uploadUrl = await generateLogoUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": logoFile.type },
          body: logoFile,
        });
        if (!res.ok) throw new Error("Logo upload failed");
        const { storageId } = await res.json() as { storageId: string };
        logoStorageId = storageId;
        setUploading(false);
      }

      await submitIntake({
        projectId: project._id,
        company: company.trim() || undefined,
        phone: phone.trim() || undefined,
        brandColors: (primaryColor || secondaryColor) ? {
          primary: primaryColor.trim() || undefined,
          secondary: secondaryColor.trim() || undefined,
        } : undefined,
        websiteGoals: websiteGoals.trim() || undefined,
        requirements: requirements.trim() || undefined,
        logoStorageId: logoStorageId as Doc<"projects">["logoStorageId"],
      });

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <span className="inline-block mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
          Project Intake
        </span>
        <h2 className="text-2xl font-display font-bold text-white mb-1">
          Tell us about your project
        </h2>
        <p className="text-gray-400 text-sm">
          Fill in as much as you can - everything here is optional except the goals field. You can update this anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Business Info */}
        <div className="glass-elevated rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Business Info</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Business Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Co."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="glass-elevated rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Logo</h3>
          <p className="text-xs text-gray-500 mb-4">PNG, JPG, or SVG. Max 5MB.</p>

          {logoPreview ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
              </div>
              <div>
                <p className="text-sm text-white mb-1">{logoFile?.name}</p>
                <button
                  type="button"
                  onClick={clearLogo}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-white/[0.08] transition-all text-gray-400 hover:text-white"
            >
              <FileImage className="w-5 h-5" />
              <span className="text-sm">Click to upload your logo</span>
              <Upload className="w-4 h-4 ml-auto" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoSelect}
            className="hidden"
          />
        </div>

        {/* Brand Colors */}
        <div className="glass-elevated rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Brand Colors</h3>
          <p className="text-xs text-gray-500 mb-4">Optional. Use hex codes like #FF5733 or color names like &ldquo;navy blue&rdquo;.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor.startsWith("#") ? primaryColor : "#6366f1"}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#6366f1 or indigo"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor.startsWith("#") ? secondaryColor : "#8b5cf6"}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#8b5cf6 or purple"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="glass-elevated rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Website Goals <span className="text-red-400">*</span></h3>
          <p className="text-xs text-gray-500 mb-4">What do you want your website to do for your business?</p>
          <textarea
            required
            value={websiteGoals}
            onChange={(e) => setWebsiteGoals(e.target.value)}
            rows={4}
            placeholder="Example: I want a website that showcases my services, generates leads through a contact form, and builds trust with potential clients..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
          />
        </div>

        {/* Additional Notes */}
        <div className="glass-elevated rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">Additional Notes</h3>
          <p className="text-xs text-gray-500 mb-4">Anything else we should know - inspirations, things you want to avoid, special requirements.</p>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            placeholder="I love the clean look of Apple's website. I don't want anything flashy. We need a photo gallery section..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? "Uploading logo..." : "Submitting..."}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Intake
              </>
            )}
          </button>
          <p className="text-xs text-gray-500">
            You can update this information any time after submitting.
          </p>
        </div>

      </form>
    </motion.div>
  );
}
