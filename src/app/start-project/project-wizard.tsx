"use client";

import { type ReactElement, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Check, PartyPopper } from "lucide-react";

interface WizardData {
  name: string;
  email: string;
  businessName: string;
  vision: string;
  primaryGoal: string;
  features: string[];
  lookAndFeel: string;
  growthStage: string;
  optionalEnhancements: string[];
  projectTypes: string[];
  timeline: string;
  budget: string;
  description: string;
}

const TOTAL_STEPS = 7;

const VISION_OPTIONS = [
  { value: "personal-brand", label: "Personal Brand / Creator" },
  { value: "local-business", label: "Local Business / Service" },
  { value: "online-store", label: "Online Store" },
  { value: "nonprofit", label: "Nonprofit / Ministry" },
  { value: "podcast", label: "Podcast / Media Brand" },
  { value: "startup", label: "Startup / SaaS" },
];

const PRIMARY_GOAL_OPTIONS = [
  {
    value: "online-presence",
    label: "Be a clean online presence",
    description: "Professional website that establishes your credibility and makes you easy to find."
  },
  {
    value: "generate-leads",
    label: "Generate leads automatically",
    description: "Capture visitor information and turn them into potential customers."
  },
  {
    value: "sell-products",
    label: "Sell products or services",
    description: "Accept payments and manage orders directly through your website."
  },
  {
    value: "book-appointments",
    label: "Book appointments",
    description: "Let clients schedule time with you automatically."
  },
  {
    value: "build-community",
    label: "Build community & content",
    description: "Share content, engage your audience, and grow your following."
  },
  {
    value: "multiple-things",
    label: "Do multiple things (recommended)",
    description: "A complete solution that combines several goals to maximize your impact."
  },
];

const FEATURES_OPTIONS = [
  "Contact forms",
  "Email signup",
  "Online booking",
  "Blog / articles",
  "Payments",
  "Member area",
  "Automation & follow-ups",
  "VR / immersive experience",
];

const LOOK_AND_FEEL_OPTIONS = [
  { value: "clean-minimal", label: "Clean & Minimal" },
  { value: "bold-energy", label: "Bold & High-Energy" },
  { value: "warm-welcoming", label: "Warm & Welcoming" },
  { value: "premium-luxury", label: "Premium & Luxury" },
  { value: "futuristic-tech", label: "Futuristic / Tech-Forward" },
  { value: "faith-based", label: "Faith-based / Purpose-driven" },
];

const GROWTH_STAGE_OPTIONS = [
  { value: "just-starting", label: "Just starting out" },
  { value: "established-outdated", label: "Established but outdated" },
  { value: "growing", label: "Growing and need better systems" },
  { value: "scaling", label: "Scaling and need automation" },
  { value: "full-rebuild", label: "Full rebuild from scratch" },
];

const OPTIONAL_ENHANCEMENTS_OPTIONS = [
  "SEO & content strategy",
  "Ongoing updates & support",
  "Social media integration",
  "VR storefront / immersive brand space",
  "AI & automation tools",
  "Not sure yet - guide me",
];

const TIMELINE_OPTIONS = [
  "ASAP (within 1 month)",
  "1-3 months",
  "3-6 months",
  "Just exploring for now",
];

const BUDGET_OPTIONS = [
  "Under $1,000",
  "$1,000-$2,500",
  "$2,500-$5,000",
  "$5,000+",
  "Not sure yet",
];

export function ProjectWizard(): ReactElement {
  const { user } = useAuth();
  const submitProjectRequest = useMutation(api.projectRequests.submitProjectRequest);
  const sendProjectEmail = useAction(api.emails.sendProjectRequestEmail);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<WizardData>({
    name: user?.name || "",
    email: user?.email || "",
    businessName: "",
    vision: "",
    primaryGoal: "",
    features: [],
    lookAndFeel: "",
    growthStage: "",
    optionalEnhancements: [],
    projectTypes: [],
    timeline: "",
    budget: "",
    description: "",
  });

  const updateField = <K extends keyof WizardData>(field: K, value: WizardData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof WizardData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.email;
      case 2: return formData.vision;
      case 3: return formData.primaryGoal;
      case 4: return formData.features.length > 0;
      case 5: return formData.lookAndFeel && formData.growthStage;
      case 6: return formData.timeline && formData.description;
      default: return true;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Map vision to project types for backward compatibility
      const projectTypes = [formData.vision];

      await submitProjectRequest({
        name: formData.name,
        email: formData.email,
        businessName: formData.businessName || undefined,
        projectTypes,
        description: formData.description,
        timeline: formData.timeline,
        budget: formData.budget || "Not specified",
        vision: formData.vision,
        primaryGoal: formData.primaryGoal,
        features: formData.features,
        lookAndFeel: formData.lookAndFeel,
        growthStage: formData.growthStage,
        optionalEnhancements: formData.optionalEnhancements,
        userId: user?.id,
      });

      await sendProjectEmail({
        name: formData.name,
        email: formData.email,
        businessName: formData.businessName || undefined,
        projectTypes,
        description: formData.description,
        timeline: formData.timeline,
        budget: formData.budget || "Not specified",
      });

      setSubmitSuccess(true);
      setCurrentStep(TOTAL_STEPS);
    } catch (error) {
      console.error("Error submitting:", error);
      setSubmitError("Something went wrong. Please try again or email us at devland0831@gmail.com");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Step {currentStep} of {TOTAL_STEPS}</span>
          <span className="text-sm font-medium text-cyan-400">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 mb-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">Let&apos;s start with the basics</h2>
                  <p className="text-gray-400">We&apos;ll use this to stay in touch about your project.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business or Project Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    placeholder="Leave blank for personal projects"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Vision */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">What best describes what you&apos;re building?</h2>
                  <p className="text-gray-400">This helps us structure your website correctly.</p>
                </div>

                <div className="space-y-3">
                  {VISION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateField("vision", option.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.vision === option.value
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{option.label}</span>
                        {formData.vision === option.value && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Primary Goal */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">What should your website mainly do for you?</h2>
                  <p className="text-gray-400">Choose your primary focus.</p>
                </div>

                <div className="space-y-3">
                  {PRIMARY_GOAL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateField("primaryGoal", option.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.primaryGoal === option.value
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{option.label}</span>
                        {formData.primaryGoal === option.value && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      {formData.primaryGoal === option.value && (
                        <p className="text-sm text-gray-400 mt-2">{option.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Features */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">Which features feel right for your site?</h2>
                  <p className="text-gray-400">Select all that apply - you can always adjust later.</p>
                </div>

                <div className="space-y-3">
                  {FEATURES_OPTIONS.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleArrayItem("features", feature)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.features.includes(feature)
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{feature}</span>
                        {formData.features.includes(feature) && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Style & Growth */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">Tell us about your style and where you are</h2>
                  <p className="text-gray-400">This helps us design the right solution.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">What vibe fits your brand best?</h3>
                  <div className="space-y-3">
                    {LOOK_AND_FEEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateField("lookAndFeel", option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.lookAndFeel === option.value
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{option.label}</span>
                          {formData.lookAndFeel === option.value && (
                            <Check className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Where are you right now?</h3>
                  <div className="space-y-3">
                    {GROWTH_STAGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateField("growthStage", option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.growthStage === option.value
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{option.label}</span>
                          {formData.growthStage === option.value && (
                            <Check className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Details */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">Project timeline and details</h2>
                  <p className="text-gray-400">Help us understand your needs and timeline.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Optional Enhancements</h3>
                  <p className="text-sm text-gray-400 mb-3">Interested in exploring any of these?</p>
                  <div className="space-y-3">
                    {OPTIONAL_ENHANCEMENTS_OPTIONS.map((enhancement) => (
                      <button
                        key={enhancement}
                        onClick={() => toggleArrayItem("optionalEnhancements", enhancement)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.optionalEnhancements.includes(enhancement)
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{enhancement}</span>
                          {formData.optionalEnhancements.includes(enhancement) && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">When do you need this? *</h3>
                  <div className="space-y-3">
                    {TIMELINE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateField("timeline", option)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.timeline === option
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{option}</span>
                          {formData.timeline === option && (
                            <Check className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Estimated Budget Range</h3>
                  <div className="space-y-3">
                    {BUDGET_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateField("budget", option)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.budget === option
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{option}</span>
                          {formData.budget === option && (
                            <Check className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-white mb-3">Tell Us About Your Vision *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Describe your project, goals, or any ideas you have. Even a rough outline helps."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 7: Review & Submit */}
            {currentStep === 7 && !submitSuccess && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">Review Your Project Blueprint</h2>
                  <p className="text-gray-400">Make sure everything looks good before submitting.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Contact</p>
                    <p className="text-white font-medium">{formData.name}</p>
                    <p className="text-gray-400 text-sm">{formData.email}</p>
                    {formData.businessName && (
                      <p className="text-gray-400 text-sm">{formData.businessName}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Vision</p>
                    <p className="text-white">{VISION_OPTIONS.find(o => o.value === formData.vision)?.label}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Primary Goal</p>
                    <p className="text-white">{PRIMARY_GOAL_OPTIONS.find(o => o.value === formData.primaryGoal)?.label}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Features</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.map(feature => (
                        <span key={feature} className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Style & Stage</p>
                    <p className="text-white">{LOOK_AND_FEEL_OPTIONS.find(o => o.value === formData.lookAndFeel)?.label}</p>
                    <p className="text-gray-400 text-sm">{GROWTH_STAGE_OPTIONS.find(o => o.value === formData.growthStage)?.label}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Timeline & Budget</p>
                    <p className="text-white">{formData.timeline}</p>
                    {formData.budget && <p className="text-gray-400 text-sm">{formData.budget}</p>}
                  </div>

                  {formData.optionalEnhancements.length > 0 && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Optional Enhancements</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.optionalEnhancements.map(enhancement => (
                          <span key={enhancement} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                            {enhancement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Project Description</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.description}</p>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Submit My Project Blueprint"}
                </Button>
              </div>
            )}

            {/* Success State */}
            {submitSuccess && currentStep === 7 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Blueprint Complete!</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Thank you for completing your project blueprint. We&apos;ll review it and follow up within 1-2 business days.
                </p>
                <div className="space-y-3">
                  {user && (
                    <Button
                      onClick={() => window.location.href = "/portal"}
                      variant="primary"
                      size="lg"
                    >
                      View in My Portal
                    </Button>
                  )}
                  <Button
                    onClick={() => window.location.href = "/"}
                    variant="secondary"
                    size="lg"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Navigation Buttons */}
          {currentStep < 7 && (
            <div className="flex items-center justify-between">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                variant="primary"
                className="flex items-center gap-2"
              >
                {currentStep === 6 ? "Review" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {currentStep === 7 && !submitSuccess && (
            <Button
              onClick={() => setCurrentStep(1)}
              variant="secondary"
              className="w-full"
            >
              Start Over
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
