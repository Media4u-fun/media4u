"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import {
  Zap, Rocket, Crown, Check, Lock, Gift, Loader2,
  Map, FileText, Calendar, Star, DollarSign, Bell,
  BarChart, Users, Download, Globe, Route,
  Layout, Image, Search, Mail, Newspaper,
} from "lucide-react";

const PLAN_STYLES = {
  starter: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: Zap, label: "Starter", price: "$79/mo" },
  growth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: Rocket, label: "Growth", price: "$149/mo" },
  enterprise: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: Crown, label: "Enterprise", price: "$299/mo" },
};

const FEATURE_ICONS: Record<string, typeof Map> = {
  core_pages: Layout, gallery: Image, contact_form: Mail, seo: Search,
  blog: FileText, booking: Calendar, reviews: Star, quote_widget: DollarSign,
  newsletter: Newspaper, email_notifications: Bell, analytics: BarChart,
  mapping: Map, client_portal: Users, integration_vault: Lock,
  pdf_export: Download, community: Globe, advanced_scheduling: Route,
};

const PLAN_ORDER = ["starter", "growth", "enterprise"] as const;

export default function PlanPage() {
  const myOrg = useQuery(api.factory.getMyOrg);
  const enabledFeatures = useQuery(
    api.factory.getEnabledFeatureKeys,
    myOrg?._id ? { orgId: myOrg._id } : "skip"
  );
  const registry = useQuery(api.factory.getPublicFeatureRegistry);
  const [upgrading, setUpgrading] = useState(false);

  if (myOrg === undefined || registry === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // No org linked to this user yet
  if (!myOrg) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">No Plan Found</h1>
        <p className="text-gray-400">
          Your account is not linked to a website plan yet. Contact your admin to get set up.
        </p>
      </div>
    );
  }

  const currentPlan = myOrg.plan;
  const planStyle = PLAN_STYLES[currentPlan];
  const PlanIcon = planStyle.icon;
  const enabledSet = new Set(enabledFeatures ?? []);

  // Group features by plan tier for the comparison
  const starterFeatures = registry?.filter((f) => f.includedInPlan === "starter") ?? [];
  const growthFeatures = registry?.filter((f) => f.includedInPlan === "growth") ?? [];
  const enterpriseFeatures = registry?.filter((f) => f.includedInPlan === "enterprise") ?? [];

  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);

  async function handleUpgrade(plan: "starter" | "growth" | "enterprise") {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/create-factory-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          customerEmail: myOrg!.ownerEmail,
          orgSlug: myOrg!.slug,
          successUrl: `${window.location.origin}/portal/plan?upgraded=true`,
          cancelUrl: `${window.location.origin}/portal/plan`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Upgrade error:", e);
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Current Plan Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl ${planStyle.bg} border ${planStyle.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${planStyle.bg} border ${planStyle.border} flex items-center justify-center`}>
              <PlanIcon className={`w-7 h-7 ${planStyle.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Your current plan</p>
              <h1 className={`text-2xl font-bold ${planStyle.text}`}>
                {planStyle.label} - {planStyle.price}
              </h1>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${planStyle.text}`}>
              {enabledFeatures?.length || 0}
            </p>
            <p className="text-sm text-gray-400">features active</p>
          </div>
        </div>
      </motion.div>

      {/* Feature List - What You Have */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
      >
        <h2 className="text-lg font-bold text-white mb-4">Your Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {registry?.map((feat) => {
            const isEnabled = enabledSet.has(feat.key);
            const Icon = FEATURE_ICONS[feat.key] || Globe;
            return (
              <div
                key={feat.key}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  isEnabled ? "bg-white/[0.04]" : "bg-white/[0.01] opacity-40"
                }`}
              >
                {isEnabled ? (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${isEnabled ? "text-white" : "text-gray-600"}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${isEnabled ? "text-white" : "text-gray-500"}`}>
                    {feat.name}
                  </span>
                </div>
                {!isEnabled && feat.isAddon && feat.addonPriceCents && (
                  <span className="text-[10px] text-gray-500">
                    +${(feat.addonPriceCents / 100).toFixed(0)}/mo
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upgrade Options */}
      {currentPlanIndex < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-white">Upgrade Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAN_ORDER.filter((_, i) => i > currentPlanIndex).map((plan) => {
              const style = PLAN_STYLES[plan];
              const UpgradeIcon = style.icon;
              return (
                <div
                  key={plan}
                  className={`p-6 rounded-2xl ${style.bg} border ${style.border}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <UpgradeIcon className={`w-6 h-6 ${style.text}`} />
                    <div>
                      <h3 className={`text-lg font-bold ${style.text}`}>{style.label}</h3>
                      <p className={`text-sm ${style.text} opacity-70`}>{style.price}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">
                    Everything in your current plan plus:
                  </p>

                  <ul className="space-y-2 mb-6">
                    {(plan === "growth" ? growthFeatures : enterpriseFeatures).map((feat) => {
                      const Icon = FEATURE_ICONS[feat.key] || Globe;
                      return (
                        <li key={feat.key} className="flex items-center gap-2 text-sm text-gray-300">
                          <Icon className={`w-3.5 h-3.5 ${style.text}`} />
                          {feat.name}
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={upgrading}
                    className={`w-full py-3 rounded-xl ${style.bg} ${style.text} border ${style.border} font-medium text-sm hover:brightness-125 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {upgrading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                    Upgrade to {style.label}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Enterprise - Already on top */}
      {currentPlanIndex === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center"
        >
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">You have the top plan</h2>
          <p className="text-sm text-gray-400">All features are included in your Enterprise plan.</p>
        </motion.div>
      )}
    </div>
  );
}
