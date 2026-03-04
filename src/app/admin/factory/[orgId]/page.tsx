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
} from "lucide-react";

const PLAN_COLORS = {
  starter: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: Zap, label: "Starter - $79/mo" },
  growth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: Rocket, label: "Growth - $149/mo" },
  enterprise: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: Crown, label: "Enterprise - $299/mo" },
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

export default function OrgDetailPage() {
  const params = useParams();
  const orgId = params.orgId as Id<"clientOrgs">;

  const org = useQuery(api.factory.getClientOrg, { orgId });
  const orgFeatures = useQuery(api.factory.getOrgFeaturesQuery, { orgId });
  const registry = useQuery(api.factory.listFeatureRegistry);
  const changePlan = useMutation(api.factory.changeClientPlan);
  const toggleFeature = useMutation(api.factory.toggleOrgFeature);
  const startTrial = useMutation(api.factory.startFeatureTrial);

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

  // Build feature map for quick lookup
  const featureMap = new Map(orgFeatures?.map((f) => [f.featureKey, f]));

  // Group registry by category
  const categories = new Map<string, typeof registry>();
  for (const feat of registry.sort((a, b) => a.sortOrder - b.sortOrder)) {
    const cat = feat.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(feat);
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

  const enabledCount = orgFeatures?.filter((f) => f.enabled).length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/factory"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Client Sites
      </Link>

      {/* Header */}
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
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {org.ownerEmail}
              </span>
              {org.industry && (
                <span className="capitalize">{org.industry}</span>
              )}
              {org.domain && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {org.domain}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${planStyle.bg} ${planStyle.text} border ${planStyle.border}`}>
              <planStyle.icon className="w-4 h-4" />
              {planStyle.label}
            </span>
            <p className="text-xs text-gray-500 mt-2">{enabledCount} features enabled</p>
          </div>
        </div>
      </motion.div>

      {/* Plan Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                <p className="text-xs mt-1 opacity-70">{style.label.split(" - ")[1]}</p>
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

      {/* Feature Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-bold text-white">Feature Controls</h2>

        {Array.from(categories.entries()).map(([category, features]) => (
          <div key={category} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-2">
              {features.map((feat) => {
                const orgFeat = featureMap.get(feat.key);
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
    </div>
  );
}
