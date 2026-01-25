"use client";

import { type ReactElement, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PACKAGES = [
  {
    name: "Starter",
    badge: "Best for Small Businesses",
    price: "$899",
    description: "3–4 page professional website",
    features: [
      "Mobile-responsive design",
      "SEO-ready structure",
      "Contact form integration",
      "30-day post-launch support",
    ],
    bestFor: "Small businesses, creators, and ministries who need a clean, professional online presence.",
    gradient: "from-purple-500 to-pink-500",
    popular: false,
  },
  {
    name: "Professional",
    badge: "Most Popular",
    price: "$1,399",
    description: "6–8 page website or eCommerce site",
    features: [
      "Custom design & branding consultation",
      "Content & media support",
      "Advanced features (booking, payments, etc.)",
      "60-day post-launch support",
      "Optional VR storefront integration",
    ],
    bestFor: "Growing businesses ready to invest in a strong digital presence—with room to expand into VR.",
    gradient: "from-cyan-500 to-blue-500",
    popular: true,
  },
  {
    name: "Enterprise / Custom",
    badge: "For Bold Brands",
    price: "Custom",
    description: "Large-scale websites or platforms",
    features: [
      "Full branding & visual identity",
      "Advanced functionality & integrations",
      "Immersive VR environments (optional)",
      "Ongoing partnership & support",
    ],
    bestFor: "Established brands and innovators ready to build something exceptional.",
    gradient: "from-orange-500 to-red-500",
    popular: false,
  },
];

const ADD_ONS = [
  {
    title: "Ongoing Web Care",
    description: "Keep your site updated, secure, and performing. Monthly maintenance plans starting at $149/month.",
  },
  {
    title: "SEO & Optimization",
    description: "Improve your search rankings and site speed. One-time optimization or ongoing support available.",
  },
  {
    title: "Content & Video",
    description: "Professional copywriting, photography, video editing, and social media assets.",
  },
  {
    title: "Branding & Visual Identity",
    description: "Logo design, brand guidelines, and marketing materials that keep your message consistent.",
  },
  {
    title: "VR Environments",
    description: "Custom virtual storefronts, showrooms, and immersive experiences. A powerful extension—not required to get started.",
    highlight: true,
  },
];

export function StartProjectContent(): ReactElement {
  const submitProjectRequest = useMutation(api.projectRequests.submitProjectRequest);
  const sendProjectEmail = useAction(api.emails.sendProjectRequestEmail);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    projectTypes: [] as string[],
    description: "",
    timeline: "",
    budget: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(value)
        ? prev.projectTypes.filter((t) => t !== value)
        : [...prev.projectTypes, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.description) {
        setSubmitError("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      if (formData.projectTypes.length === 0) {
        setSubmitError("Please select at least one project type");
        setSubmitting(false);
        return;
      }

      // Submit to database
      await submitProjectRequest({
        name: formData.name,
        email: formData.email,
        businessName: formData.businessName || undefined,
        projectTypes: formData.projectTypes,
        description: formData.description,
        timeline: formData.timeline || "Not specified",
        budget: formData.budget || "Not specified",
      });

      // Send email notifications
      await sendProjectEmail({
        name: formData.name,
        email: formData.email,
        businessName: formData.businessName || undefined,
        projectTypes: formData.projectTypes,
        description: formData.description,
        timeline: formData.timeline || "Not specified",
        budget: formData.budget || "Not specified",
      });

      // Success!
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        businessName: "",
        projectTypes: [],
        description: "",
        timeline: "",
        budget: "",
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Something went wrong. Please try again or email us directly at hello@media4u.fun");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("project-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mesh-bg">
      {/* SECTION 1 — HERO / INTRO */}
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6">
            Let&apos;s Build Your Website—and{" "}
            <span className="text-gradient-cyber">Anything Beyond It</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            We start with professional, conversion-focused websites. When you&apos;re ready to go further, we create immersive VR experiences and visual branding that set you apart.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">
            Whether you&apos;re launching your first business site, redesigning your online presence, or exploring what&apos;s possible with VR—we&apos;re here to help you show up with clarity and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm}>
              Start Your Project
            </Button>
            <Button variant="secondary" size="lg" onClick={scrollToPackages}>
              View Packages Below
            </Button>
          </div>
        </motion.div>
      </Section>

      {/* SECTION 2 — PACKAGES / STARTING POINTS */}
      <Section id="packages">
        <SectionHeader
          tag="Pricing"
          title="Starting "
          highlight="Points"
          description="Every project is different. These packages give you a starting point—final pricing depends on your specific needs, features, and timeline."
        />

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <Card className={`h-full ${pkg.popular ? "border-cyan-500/50 shadow-[0_0_40px_rgba(0,212,255,0.15)]" : ""}`}>
                {/* Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${pkg.gradient} text-white`}>
                    {pkg.badge}
                  </span>
                </div>

                {/* Name & Price */}
                <h3 className="text-2xl font-display font-bold mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Starting at </span>
                  <span className="text-4xl font-display font-bold text-gradient-cyber">{pkg.price}</span>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6">{pkg.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-cyan-400 mt-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Best For */}
                <div className="border-t border-white/10 pt-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2">Best For:</p>
                  <p className="text-sm text-gray-400">{pkg.bestFor}</p>
                </div>

                {/* CTA */}
                <Button
                  variant={pkg.popular ? "primary" : "secondary"}
                  className="w-full"
                  onClick={scrollToForm}
                >
                  {pkg.name === "Enterprise / Custom" ? "Let's Talk" : "Start Your Project"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pricing Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm mt-8 max-w-2xl mx-auto"
        >
          <strong>Final pricing depends on scope, features, and timeline.</strong> We&apos;ll work with you to find a solution that fits your goals and budget.
        </motion.p>
      </Section>

      {/* SECTION 3 — WHAT'S INCLUDED / ADD-ONS */}
      <Section className="border-t border-white/10">
        <SectionHeader
          tag="Extend Your Project"
          title="Add-Ons & Extended "
          highlight="Services"
          description="Need more? We offer flexible add-ons to grow with you."
        />

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {ADD_ONS.map((addon, index) => (
            <motion.div
              key={addon.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={addon.highlight ? "border-purple-500/30" : ""}>
                <h3 className="text-xl font-display font-semibold mb-2">
                  {addon.title}
                  {addon.highlight && (
                    <span className="ml-2 text-xs text-purple-400 font-normal">(Optional, Future-Forward)</span>
                  )}
                </h3>
                <p className="text-gray-400 text-sm">{addon.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 mt-8"
        >
          Not sure what you need? That&apos;s okay. We&apos;ll help you figure it out together.
        </motion.p>
      </Section>

      {/* SECTION 4 — PROJECT INTAKE FORM */}
      <Section id="project-form" className="border-t border-white/10">
        <SectionHeader
          tag="Let's Talk"
          title="Tell Us About Your "
          highlight="Project"
          description="No commitment. Just a conversation. We'll review your request and follow up personally within 1–2 business days."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto mt-12"
        >
          <Card className="p-8">
            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30">
                <h3 className="text-green-400 font-semibold mb-2">Thank You! 🎉</h3>
                <p className="text-gray-300 text-sm">
                  We&apos;ve received your project request and will review it within 24 hours. Check your email for a confirmation message.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-3 text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                >
                  Submit another request →
                </button>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <h3 className="text-red-400 font-semibold mb-2">Oops!</h3>
                <p className="text-gray-300 text-sm">{submitError}</p>
                <button
                  onClick={() => setSubmitError(null)}
                  className="mt-3 text-red-400 text-sm hover:text-red-300 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-2">
                  Business or Project Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Business name (if applicable)"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if this is a personal project</p>
              </div>

              {/* Project Types */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  What Are You Looking to Build? *
                </label>
                <div className="space-y-2">
                  {[
                    "New website",
                    "Website redesign",
                    "eCommerce site",
                    "Branding & visual media",
                    "VR / immersive experience",
                    "Not sure yet—help me figure it out",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.projectTypes.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Tell Us About Your Vision
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project, goals, or any ideas you have so far. Even a rough outline helps."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The more you share, the better we can help—but don&apos;t worry about being perfect.
                </p>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  When Do You Need This? *
                </label>
                <div className="space-y-2">
                  {[
                    "ASAP (within 1 month)",
                    "1–3 months",
                    "3–6 months",
                    "Just exploring for now",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="timeline"
                        required
                        checked={formData.timeline === option}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        value={option}
                        className="w-4 h-4 border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Estimated Budget Range
                </label>
                <div className="space-y-2">
                  {[
                    "Under $1,000",
                    "$1,000–$2,500",
                    "$2,500–$5,000",
                    "$5,000+",
                    "Not sure yet",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="budget"
                        checked={formData.budget === option}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        value={option}
                        className="w-4 h-4 border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This helps us recommend the right package. It&apos;s okay if you&apos;re not sure—we&apos;ll work it out together.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={submitting || submitSuccess}
                >
                  {submitting ? "Sending..." : submitSuccess ? "Request Submitted ✓" : "Start the Conversation"}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  No pressure. We&apos;ll review your request and follow up personally. If we&apos;re not the right fit, we&apos;ll let you know honestly.
                </p>
              </div>
            </form>
          </Card>
        </motion.div>
      </Section>

      {/* SECTION 5 — TRUST & CLOSE */}
      <Section className="border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            We Meet You <span className="text-gradient-cyber">Where You Are</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            Starting a project can feel overwhelming—especially if you&apos;re not sure exactly what you need. That&apos;s where we come in.
          </p>
          <p className="text-gray-400 leading-relaxed mb-8">
            Media4U works collaboratively. We help clarify your ideas, set realistic timelines, and build solutions that actually work for your goals and budget. Whether you&apos;re launching your first website or ready to explore immersive VR, we&apos;re here to guide you through it.
          </p>
          <p className="text-gray-400">
            <strong>Questions first?</strong>{" "}
            <Link href="/contact" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Contact us here
            </Link>
          </p>
        </motion.div>
      </Section>
    </div>
  );
}
