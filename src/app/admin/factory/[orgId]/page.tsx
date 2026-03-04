"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft, Crown, Zap, Rocket, Globe, Mail, Building2,
  ToggleLeft, ToggleRight, Clock, Gift,
  Loader2, Check, Map, FileText, Calendar, Star, DollarSign,
  Bell, BarChart, Users, Lock, Download, Route,
  Layout, Image, Search as SearchIcon, Newspaper,
  CreditCard, ExternalLink, Eye, Palette, PenLine,
} from "lucide-react";
import { ContentEditor } from "./content-editor";
import { SkinPicker } from "./skin-picker";

const PLAN_COLORS = {
  starter: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: Zap, label: "Starter - $79/mo", price: 79 },
  growth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: Rocket, label: "Growth - $149/mo", price: 149 },
  enterprise: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: Crown, label: "Enterprise - $299/mo", price: 299 },
};

const FEATURE_ICONS: Record<string, typeof Map> = {
  core_pages: Layout,
  gallery: Image,
  contact_form: Mail,
  seo: SearchIcon,
  blog: FileText,
  booking: Calendar,
  reviews: Star,
  quote_widget: DollarSign,
  newsletter: Newspaper,
  email_notifications: Bell,
  analytics: BarChart,
  mapping: Map,
  client_portal: Users,
  integration_vault: Lock,
  pdf_export: Download,
  community: Globe,
  advanced_scheduling: Route,
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  plan: { label: "Plan", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  addon: { label: "Add-on", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  trial: { label: "Trial", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  manual: { label: "Manual", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const PROJECT_STATUS_STEPS = [
  { key: "new", label: "New" },
  { key: "planning", label: "Planning" },
  { key: "design", label: "Design" },
  { key: "development", label: "Development" },
  { key: "review", label: "Review" },
  { key: "completed", label: "Completed" },
  { key: "launched", label: "Launched" },
];

export default function OrgDetailPage() {
  const params = useParams() as { orgId: string };
  const orgId = params.orgId as Id<"clientOrgs">;

  const org = useQuery(api.factory.getClientOrg, { orgId });
  const orgFeatures = useQuery(api.factory.getOrgFeaturesQuery, { orgId });
  const registry = useQuery(api.factory.listFeatureRegistry);
  const project = useQuery(api.factory.getLinkedProject, { orgId });
  const changePlan = useMutation(api.factory.changeClientPlan);
  const toggleFeature = useMutation(api.factory.toggleOrgFeature);
  const startTrial = useMutation(api.factory.startFeatureTrial);

  const [activeTab, setActiveTab] = useState<"overview" | "content" | "skin">("overview");
  const [changingPlan, setChangingPlan] = useState(false);
  const [togglingFeature, setTogglingFeature] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState<string | null>(null);

  if (!org || !registry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const planStyle = PLAN_COLORS[org.plan];

  type OrgFeature = NonNullable<typeof orgFeatures>[number];
  type RegistryFeature = typeof registry[number];

  // Build feature map for quick lookup
  const featureMap: Record<string, OrgFeature> = {};
  for (const f of orgFeatures ?? []) {
    featureMap[f.featureKey] = f;
  }

  // Group registry by category
  const categoriesMap: Record<string, RegistryFeature[]> = {};
  for (const feat of [...registry].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const cat = feat.category;
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(feat);
  }

  const categoryLabels: Record<string, string> = {
    core: "Core Features",
    content: "Content & Community",
    operations: "Operations & Tools",
    communication: "Communication",
    analytics: "Analytics & Exports",
  };

  async function handlePlanChange(newPlan: "starter" | "growth" | "enterprise") {
    if (newPlan === org!.plan) return;
    setChangingPlan(true);
    try {
      await changePlan({ orgId, newPlan });
    } catch (e) {
      console.error("Failed to change plan:", e);
    } finally {
      setChangingPlan(false);
    }
  }

  async function handleToggle(featureKey: string, currentlyEnabled: boolean) {
    setTogglingFeature(featureKey);
    try {
      await toggleFeature({
        orgId,
        featureKey,
        enabled: !currentlyEnabled,
        source: "manual",
      });
    } catch (e) {
      console.error("Failed to toggle feature:", e);
    } finally {
      setTogglingFeature(null);
    }
  }

  async function handleStartTrial(featureKey: string) {
    setStartingTrial(featureKey);
    try {
      await startTrial({ orgId, featureKey });
    } catch (e) {
      console.error("Failed to start trial:", e);
    } finally {
      setStartingTrial(null);
    }
  }

  const enabledCount = orgFeatures?.filter((f: OrgFeature) => f.enabled).length || 0;

  // Project build status
  const currentStepIdx = project
    ? PROJECT_STATUS_STEPS.findIndex((s) => s.key === project.status)
    : -1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/factory"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Client Sites
      </Link>

      {/* A. Client Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-gray-400" />
              {org.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {org.ownerEmail}
              </span>
              {org.industry && (
                <span className="capitalize">{org.industry}</span>
              )}
              {org.domain && (
                <a
                  href={`https://${org.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-light hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {org.domain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {project?.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Site
                </a>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${planStyle.bg} ${planStyle.text} border ${planStyle.border}`}>
              <planStyle.icon className="w-4 h-4" />
              {planStyle.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
              org.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
              org.status === "trial" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
              org.status === "suspended" ? "bg-red-500/20 text-red-400 border-red-500/30" :
              "bg-gray-500/20 text-gray-400 border-gray-500/30"
            }`}>
              {org.status}
            </span>
            <p className="text-xs text-gray-500">{enabledCount} features enabled</p>
          </div>
        </div>

        {/* Setup banner - show if not published */}
        {!org.publishedAt && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Site not published yet</span>
            </div>
            <Link
              href={`/admin/factory/${orgId}/setup`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-all"
            >
              Complete Setup
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
          <a
            href={`mailto:${org.ownerEmail}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            Email Client
          </a>
          {org.stripeCustomerId && (
            <a
              href={`https://dashboard.stripe.com/customers/${org.stripeCustomerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Stripe
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project && (
            <Link
              href={`/admin/projects`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              View Project
            </Link>
          )}
          <Link
            href={`/s/${org.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 text-xs transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live Site
          </Link>
          <Link
            href={`/admin/factory/${orgId}/preview`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Site
          </Link>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/10">
        {([
          { key: "overview" as const, label: "Overview & Features", icon: Layout },
          { key: "content" as const, label: "Content Editor", icon: PenLine },
          { key: "skin" as const, label: "Industry Skin", icon: Palette },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? "bg-white/[0.08] text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Editor Tab */}
      {activeTab === "content" && <ContentEditor orgId={orgId} />}

      {/* Skin Picker Tab */}
      {activeTab === "skin" && <SkinPicker orgId={orgId} />}

      {/* Overview Tab */}
      {activeTab === "overview" && <>

      {/* B. Project Build Status */}
      {project && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <h2 className="text-lg font-bold text-white mb-4">Build Status</h2>

          {/* Pipeline */}
          <div className="flex items-center gap-1 mb-4">
            {PROJECT_STATUS_STEPS.map((step, idx) => {
              const isComplete = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-2 rounded-full ${
                    isComplete ? "bg-brand-light" : "bg-white/10"
                  } ${isCurrent ? "ring-2 ring-brand-light/30" : ""}`} />
                  <span className={`text-[10px] mt-1 ${
                    isCurrent ? "text-brand-light font-bold" : isComplete ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Project Type</p>
              <p className="text-white">{project.projectType}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Company</p>
              <p className="text-white">{project.company || "-"}</p>
            </div>
            {project.brandColors?.primary && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Brand Colors</p>
                <div className="flex gap-1">
                  {[project.brandColors.primary, project.brandColors.secondary, project.brandColors.accent].filter(Boolean).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border border-white/20"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {project.liveUrl && (
              <div>
                <p className="text-gray-500 text-xs">Live URL</p>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline flex items-center gap-1">
                  {project.liveUrl.replace(/^https?:\/\//, "")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {project.notes && (
            <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-xs text-gray-500 mb-1">Project Notes</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* C. Billing & Payments Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-400" />
          Billing & Payments
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Setup Fee */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-xs text-gray-500 uppercase mb-2">Setup Fee</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white">
                  {org.setupFeeAmount ? `$${(org.setupFeeAmount / 100).toLocaleString()}` : "N/A"}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                org.setupFeePaid
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {org.setupFeePaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>

          {/* Monthly Subscription */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-xs text-gray-500 uppercase mb-2">Monthly</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-white">${planStyle.price}/mo</p>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                org.status === "active"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {org.status === "active" ? "Active" : org.status}
              </span>
            </div>
          </div>

          {/* Stripe Link */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-xs text-gray-500 uppercase mb-2">Stripe</p>
            {org.stripeCustomerId ? (
              <div className="space-y-2">
                <a
                  href={`https://dashboard.stripe.com/customers/${org.stripeCustomerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand-light hover:underline"
                >
                  Customer Portal
                  <ExternalLink className="w-3 h-3" />
                </a>
                {org.stripeSubscriptionId && (
                  <a
                    href={`https://dashboard.stripe.com/subscriptions/${org.stripeSubscriptionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
                  >
                    Subscription
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not linked yet</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* D. Plan Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
      >
        <h2 className="text-lg font-bold text-white mb-4">Change Plan</h2>
        <div className="grid grid-cols-3 gap-3">
          {(["starter", "growth", "enterprise"] as const).map((plan) => {
            const style = PLAN_COLORS[plan];
            const Icon = style.icon;
            const isActive = org.plan === plan;
            return (
              <button
                key={plan}
                onClick={() => handlePlanChange(plan)}
                disabled={changingPlan}
                className={`p-4 rounded-xl border text-center transition-all ${
                  isActive
                    ? `${style.bg} ${style.border} ${style.text} ring-2 ring-offset-2 ring-offset-[#141419] ring-${plan === "starter" ? "blue" : plan === "growth" ? "purple" : "amber"}-500/50`
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? style.text : ""}`} />
                <p className="text-sm font-semibold capitalize">{plan}</p>
                <p className="text-xs mt-1 opacity-70">${style.price}/mo</p>
                {isActive && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Check className="w-3 h-3" />
                    <span className="text-[10px] font-medium">Current</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {changingPlan && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating plan and features...
          </div>
        )}
      </motion.div>

      {/* E. Feature Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-bold text-white">Feature Controls</h2>

        {Object.entries(categoriesMap).map(([category, features]) => (
          <div key={category} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-2">
              {features.map((feat) => {
                const orgFeat = featureMap[feat.key];
                const isEnabled = orgFeat?.enabled ?? false;
                const isToggling = togglingFeature === feat.key;
                const isTrialing = startingTrial === feat.key;
                const Icon = FEATURE_ICONS[feat.key] || Globe;
                const source = orgFeat?.source;
                const sourceStyle = source ? SOURCE_LABELS[source] : null;

                // Check if trial is active and show remaining time
                const trialRemaining = orgFeat?.source === "trial" && orgFeat.trialEndsAt
                  ? Math.max(0, Math.ceil((orgFeat.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null;

                return (
                  <div
                    key={feat.key}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isEnabled ? "bg-white/[0.04]" : "bg-white/[0.01] opacity-60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isEnabled ? "text-brand-light" : "text-gray-600"}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isEnabled ? "text-white" : "text-gray-500"}`}>
                          {feat.name}
                        </span>
                        {sourceStyle && isEnabled && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${sourceStyle.color}`}>
                            {sourceStyle.label}
                          </span>
                        )}
                        {trialRemaining !== null && trialRemaining > 0 && (
                          <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {trialRemaining}d left
                          </span>
                        )}
                        {feat.isAddon && feat.addonPriceCents && (
                          <span className="text-[10px] text-gray-600">
                            ${(feat.addonPriceCents / 100).toFixed(0)}/mo add-on
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{feat.description}</p>
                    </div>

                    {/* Trial button - only show for non-enabled features */}
                    {!isEnabled && feat.key !== "core_pages" && (
                      <button
                        onClick={() => handleStartTrial(feat.key)}
                        disabled={isTrialing}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {isTrialing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
                        7-day trial
                      </button>
                    )}

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(feat.key, isEnabled)}
                      disabled={isToggling}
                      className="flex-shrink-0"
                    >
                      {isToggling ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                      ) : isEnabled ? (
                        <ToggleRight className="w-8 h-8 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-600 hover:text-gray-400 transition-colors" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Org Notes */}
      {org.notes && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <h2 className="text-lg font-bold text-white mb-2">Notes</h2>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">{org.notes}</p>
        </motion.div>
      )}

      </>}
    </div>
  );
}
