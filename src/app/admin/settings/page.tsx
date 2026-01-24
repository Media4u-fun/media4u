"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);

  const [formData, setFormData] = useState({
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    linkedinUrl: "",
    contactEmail: "",
    whatsappNumber: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setFormData({
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        contactEmail: settings.contactEmail || "",
        whatsappNumber: settings.whatsappNumber || "",
      });
    }
  }, [settings]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateSettings(formData);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings. Please try again." });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Site Settings</h1>
        <p className="text-gray-400">Manage social media links and contact information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-elevated rounded-2xl p-8 space-y-8 max-w-3xl"
      >
        {/* Social Media Section */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 pb-4 border-b border-white/10">
            Social Media Links
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="https://www.instagram.com/media4uvr/"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="https://www.facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TikTok URL
              </label>
              <input
                type="url"
                value={formData.tiktokUrl}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="https://www.tiktok.com/@media4uvr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="https://www.linkedin.com/company/..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 pb-4 border-b border-white/10">
            Contact Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="contact@media4u.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                placeholder="15551234567"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter number with country code, no spaces or symbols
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/50 text-red-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
