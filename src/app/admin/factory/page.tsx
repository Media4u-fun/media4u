"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Factory, Plus, Search, Building2, Globe, ChevronRight,
  Crown, Zap, Rocket, X, Loader2,
} from "lucide-react";

const PLAN_COLORS = {
  starter: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: Zap },
  growth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: Rocket },
  enterprise: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: Crown },
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  trial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function FactoryPage() {
  const orgs = useQuery(api.factory.listClientOrgs);
  const createOrg = useMutation(api.factory.createClientOrg);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState<"starter" | "growth" | "enterprise">("starter");
  const [newIndustry, setNewIndustry] = useState("");

  const filtered = orgs?.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
    (org.industry || "").toLowerCase().includes(search.toLowerCase())
  );

  const planCounts = {
    starter: orgs?.filter((o) => o.plan === "starter").length || 0,
    growth: orgs?.filter((o) => o.plan === "growth").length || 0,
    enterprise: orgs?.filter((o) => o.plan === "enterprise").length || 0,
  };

  async function handleCreate() {
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    try {
      await createOrg({
        name: newName.trim(),
        slug: slugify(newName),
        ownerEmail: newEmail.trim(),
        plan: newPlan,
        industry: newIndustry.trim() || undefined,
      });
      setShowCreate(false);
      setNewName("");
      setNewEmail("");
      setNewPlan("starter");
      setNewIndustry("");
    } catch (e) {
      console.error("Failed to create org:", e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Factory className="w-7 h-7 text-brand-light" />
            Website Factory
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage client sites, plans, and features</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/30 font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Client Site
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-3xl font-bold text-white">{orgs?.length || 0}</p>
          <p className="text-sm text-gray-400">Total Sites</p>
        </div>
        {(["starter", "growth", "enterprise"] as const).map((plan) => {
          const style = PLAN_COLORS[plan];
          const Icon = style.icon;
          return (
            <div key={plan} className={`p-4 rounded-xl ${style.bg} border ${style.border}`}>
              <div className="flex items-center justify-between">
                <p className={`text-3xl font-bold ${style.text}`}>{planCounts[plan]}</p>
                <Icon className={`w-5 h-5 ${style.text}`} />
              </div>
              <p className={`text-sm ${style.text} capitalize`}>{plan}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50"
        />
      </div>

      {/* Client list */}
      <div className="space-y-2">
        {!orgs ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500">Loading client sites...</p>
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {search ? "No clients match your search" : "No client sites yet"}
            </p>
            {!search && (
              <p className="text-gray-500 text-sm mt-1">Click &quot;New Client Site&quot; to add your first one</p>
            )}
          </div>
        ) : (
          filtered?.map((org) => {
            const planStyle = PLAN_COLORS[org.plan];
            const PlanIcon = planStyle.icon;
            return (
              <Link
                key={org._id}
                href={`/admin/factory/${org._id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-white/15 transition-all group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${planStyle.bg} border ${planStyle.border} flex items-center justify-center flex-shrink-0`}>
                  <PlanIcon className={`w-5 h-5 ${planStyle.text}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{org.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${STATUS_COLORS[org.status]}`}>
                      {org.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{org.ownerEmail}</span>
                    {org.industry && (
                      <>
                        <span className="text-gray-700">|</span>
                        <span className="capitalize">{org.industry}</span>
                      </>
                    )}
                    {org.domain && (
                      <>
                        <span className="text-gray-700">|</span>
                        <Globe className="w-3 h-3 inline" />
                        <span>{org.domain}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Plan badge */}
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${planStyle.bg} ${planStyle.text} border ${planStyle.border}`}>
                  {org.plan}
                </span>

                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] mx-auto max-w-md z-50 bg-[#1a1a22] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">New Client Site</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Business Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Just Doors Inc"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-light/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Owner Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="owner@business.com"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-light/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["starter", "growth", "enterprise"] as const).map((plan) => {
                      const style = PLAN_COLORS[plan];
                      const Icon = style.icon;
                      return (
                        <button
                          key={plan}
                          onClick={() => setNewPlan(plan)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            newPlan === plan
                              ? `${style.bg} ${style.border} ${style.text}`
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs font-medium capitalize">{plan}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Industry</label>
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="e.g. pest-control, doors, pools"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-light/50"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim() || !newEmail.trim()}
                  className="w-full py-3 rounded-xl bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/30 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Client Site
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
