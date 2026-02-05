"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { MessageCircle, X, Send, CheckCircle } from "lucide-react";

const PEST_TYPES = [
  "Ants",
  "Roaches",
  "Rodents (Mice/Rats)",
  "Termites",
  "Bed Bugs",
  "Spiders",
  "Wasps/Bees",
  "Mosquitoes",
  "Fleas/Ticks",
  "Other",
];

const PROPERTY_TYPES = [
  "Single Family Home",
  "Apartment/Condo",
  "Townhouse",
  "Business/Commercial",
  "Rental Property",
];

export function QuickQuoteWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createQuoteRequest = useMutation(api.quoteRequests.createQuoteRequest);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    issueType: "",
    propertyType: "",
    zipCode: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.issueType || !formData.propertyType || !formData.zipCode) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createQuoteRequest({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        serviceType: "pest-control",
        issueType: formData.issueType,
        propertyType: formData.propertyType,
        zipCode: formData.zipCode,
        description: formData.description || undefined,
      });

      setIsSubmitted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          issueType: "",
          propertyType: "",
          zipCode: "",
          description: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>

      {/* Floating Label */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 right-24 z-50 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium hidden md:block"
      >
        Get a Free Quote!
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-white" />
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Get a Free Quote</h3>
                  <p className="text-white/80 text-sm">We respond within 30 minutes!</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Thank You!</h4>
                    <p className="text-gray-400">
                      We&apos;ll call you within 30 minutes to discuss your quote.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                        placeholder="john@email.com"
                      />
                    </div>

                    {/* Pest Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        What pest issue? <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.issueType}
                        onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
                        required
                      >
                        <option value="">Select pest type...</option>
                        {PEST_TYPES.map((pest) => (
                          <option key={pest} value={pest}>
                            {pest}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Property Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
                        required
                      >
                        <option value="">Select property type...</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Zip Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                        placeholder="12345"
                        maxLength={10}
                        required
                      />
                    </div>

                    {/* Description (optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Describe the issue <span className="text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 resize-none"
                        rows={2}
                        placeholder="Where are you seeing pests? How long has this been happening?"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Get My Free Quote
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                      No spam, ever. We respect your privacy.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
