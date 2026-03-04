"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Factory, Plus, Search, Building2, Globe, ChevronRight,
  Crown, Zap, Rocket, X, Loader2, DollarSign, Users,
  TrendingUp, AlertCircle, Check, Mail, Eye, ExternalLink,
  UserPlus, ArrowRight, Clock, XCircle, Phone,
} from "lucide-react";

const PLAN_COLORS = {
  starter: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: Zap, price: 79 },
  growth: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", icon: Rocket, price: 149 },
  enterprise: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", icon: Crown, price: 299 },
};

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  active: { dot: "bg-green-400", bg: "bg-green-500/10", text: "text-green-400" },
  trial: { dot: "bg-yellow-400", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  suspended: { dot: "bg-red-400", bg: "bg-red-500/10", text: "text-red-400" },
  cancelled: { dot: "bg-gray-400", bg: "bg-gray-500/10", text: "text-gray-500" },
};

type SortKey = "name" | "revenue" | "date";
type FilterPlan = "all" | "starter" | "growth" | "enterprise";
type FilterStatus = "all" | "active" | "trial" | "suspended" | "cancelled";
type ActiveTab = "sites" | "signups";

const LEAD_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  contacted: { bg: "bg-blue-500/10", text: "text-blue-400" },
  researching: { bg: "bg-purple-500/10", text: "text-purple-400" },
  building: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  presented: { bg: "bg-orange-500/10", text: "text-orange-400" },
  won: { bg: "bg-green-500/10", text: "text-green-400" },
  lost: { bg: "bg-red-500/10", text: "text-red-400" },
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function FactoryPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("sites");
  const orgs = useQuery(api.factory.listClientOrgs);
  const stats = useQuery(api.factory.getRevenueStats);
  const signups = useQuery(api.factory.listFactorySignups);
  const createOrg = useMutation(api.factory.createClientOrg);
  const convertSignup = useMutation(api.factory.convertSignupToOrg);
  const updateLeadStatus = useMutation(api.factory.updateLeadStatus);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState<"starter" | "growth" | "enterprise">("starter");
  const [newIndustry, setNewIndustry] = useState("");

  // Filter and sort
  const filtered = orgs
    ?.filter((org) => {
      if (filterPlan !== "all" && org.plan !== filterPlan) return false;
      if (filterStatus !== "all" && org.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return org.name.toLowerCase().includes(q) ||
          org.ownerEmail.toLowerCase().includes(q) ||
          (org.industry || "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "revenue") {
        const aPrice = PLAN_COLORS[a.plan]?.price || 0;
        const bPrice = PLAN_COLORS[b.plan]?.price || 0;
        return bPrice - aPrice;
      }
      return b.createdAt - a.createdAt;
    });

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Factory className="w-7 h-7 text-brand-light" />
            Website Factory
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage client sites, signups, and pipeline</p>
        </div>
        {activeTab === "sites" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/30 font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Client Site
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("sites")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "sites"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Client Sites
          </span>
        </button>
        <button
          onClick={() => setActiveTab("signups")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "signups"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            New Signups
            {signups && signups.filter((s) => s.status === "new").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                {signups.filter((s) => s.status === "new").length}
              </span>
            )}
          </span>
        </button>
      </div>

      {activeTab === "signups" && <SignupsTab signups={signups} convertSignup={convertSignup} updateLeadStatus={updateLeadStatus} convertingId={convertingId} setConvertingId={setConvertingId} />}

      {activeTab === "sites" && <>
      {/* Revenue Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <div className="flex items-center justify-between mb-1">
            <DollarSign className="w-5 h-5 text-green-400" />
            <TrendingUp className="w-4 h-4 text-green-400/60" />
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${stats ? (stats.totalMRR / 100).toLocaleString() : "..."}
          </p>
          <p className="text-xs text-green-400/60">Monthly Revenue</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalClients ?? "..."}</p>
          <p className="text-xs text-gray-500">Total Clients</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeCount ?? "..."}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.suspendedCount ?? "..."}</p>
          <p className="text-xs text-gray-500">Suspended</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${stats ? (stats.setupFeesCollected / 100).toLocaleString() : "..."}
          </p>
          <p className="text-xs text-gray-500">Setup Fees</p>
        </div>
      </div>

      {/* Plan Tier Ribbon */}
      <div className="flex gap-3">
        {(["starter", "growth", "enterprise"] as const).map((plan) => {
          const style = PLAN_COLORS[plan];
          const Icon = style.icon;
          return (
            <button
              key={plan}
              onClick={() => setFilterPlan(filterPlan === plan ? "all" : plan)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm ${
                filterPlan === plan
                  ? `${style.bg} ${style.border} ${style.text}`
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium capitalize">{plan}</span>
              <span className="text-xs opacity-70">({planCounts[plan]})</span>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-brand-light/50 appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-brand-light/50 appearance-none cursor-pointer"
        >
          <option value="date">Newest First</option>
          <option value="name">By Name</option>
          <option value="revenue">By Revenue</option>
        </select>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!orgs ? (
          <div className="col-span-2 text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500">Loading client sites...</p>
          </div>
        ) : filtered?.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {search || filterPlan !== "all" || filterStatus !== "all"
                ? "No clients match your filters"
                : "No client sites yet"}
            </p>
            {!search && filterPlan === "all" && filterStatus === "all" && (
              <p className="text-gray-500 text-sm mt-1">Click &quot;New Client Site&quot; to add your first one</p>
            )}
          </div>
        ) : (
          filtered?.map((org) => {
            const planStyle = PLAN_COLORS[org.plan];
            const PlanIcon = planStyle.icon;
            const statusStyle = STATUS_COLORS[org.status] || STATUS_COLORS.active;

            return (
              <Link
                key={org._id}
                href={`/admin/factory/${org._id}`}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-white/15 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${planStyle.bg} border ${planStyle.border} flex items-center justify-center flex-shrink-0`}>
                      <PlanIcon className={`w-5 h-5 ${planStyle.text}`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{org.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`flex items-center gap-1.5 text-xs ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span className="capitalize">{org.status}</span>
                        </span>
                        {org.industry && (
                          <span className="text-xs text-gray-600 capitalize">{org.industry}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1" />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                    <p className={`text-sm font-bold ${planStyle.text}`}>${planStyle.price}/mo</p>
                    <p className="text-[10px] text-gray-500 uppercase">{org.plan}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                    <p className={`text-sm font-bold ${org.setupFeePaid ? "text-green-400" : "text-yellow-400"}`}>
                      {org.setupFeePaid ? "Paid" : "Pending"}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">Setup Fee</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                    <p className="text-sm font-bold text-gray-300">
                      {new Date(org.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">Added</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {org.ownerEmail}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Published status */}
                    <span className={`flex items-center gap-1 ${
                      org.publishedAt ? "text-green-400" : "text-gray-600"
                    }`}>
                      <Globe className="w-3 h-3" />
                      {org.publishedAt ? "Live" : "Draft"}
                    </span>
                    {/* Live site link */}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/s/${org.slug}`, "_blank");
                      }}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Site
                    </span>
                    {/* Preview */}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/admin/factory/${org._id}/preview`, "_blank");
                      }}
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-300 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      </>}

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

// ========================================
// Signups Pipeline Tab
// ========================================

function SignupsTab({
  signups,
  convertSignup,
  updateLeadStatus,
  convertingId,
  setConvertingId,
}: {
  signups: Array<{
    _id: Id<"leads">;
    name: string;
    email: string;
    businessName?: string;
    industry?: string;
    phone?: string;
    notes: string;
    status: string;
    factoryOrgId?: Id<"clientOrgs">;
    createdAt: number;
  }> | undefined;
  convertSignup: (args: { leadId: Id<"leads"> }) => Promise<Id<"clientOrgs">>;
  updateLeadStatus: (args: { leadId: Id<"leads">; status: "new" | "contacted" | "researching" | "building" | "presented" | "qualified" | "converted" | "won" | "lost" }) => Promise<void>;
  convertingId: string | null;
  setConvertingId: (id: string | null) => void;
}) {
  async function handleConvert(leadId: Id<"leads">) {
    setConvertingId(leadId);
    try {
      await convertSignup({ leadId });
    } catch (err) {
      console.error("Convert failed:", err);
    } finally {
      setConvertingId(null);
    }
  }

  async function handleStatusChange(leadId: Id<"leads">, status: string) {
    try {
      await updateLeadStatus({
        leadId,
        status: status as "new" | "contacted" | "lost",
      });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  }

  if (!signups) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-3" />
        <p className="text-gray-500">Loading signups...</p>
      </div>
    );
  }

  if (signups.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">No signups yet</p>
        <p className="text-gray-500 text-sm mt-1">Signups from /factory/signup will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {signups.map((lead) => {
        const statusStyle = LEAD_STATUS_COLORS[lead.status] || LEAD_STATUS_COLORS.new;
        const isConverted = !!lead.factoryOrgId;
        const isConverting = convertingId === lead._id;

        return (
          <div
            key={lead._id}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/8"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{lead.businessName || lead.name}</p>
                <p className="text-gray-400 text-sm">{lead.name}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                {lead.status}
              </span>
            </div>

            <div className="space-y-1.5 mb-4">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> {lead.email}
              </p>
              {lead.phone && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {lead.phone}
                </p>
              )}
              {lead.industry && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> <span className="capitalize">{lead.industry}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
              {lead.notes && (
                <>
                  <p className="text-xs text-cyan-400 font-medium mt-1">{lead.notes}</p>
                  {lead.notes.includes("(own)") ? (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">Own It</span>
                  ) : lead.notes.includes("(subscribe)") ? (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Subscribe</span>
                  ) : null}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isConverted ? (
                <Link
                  href={`/admin/factory/${lead.factoryOrgId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-all"
                >
                  <Check className="w-3 h-3" />
                  Converted
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ) : lead.status === "lost" ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">
                  <XCircle className="w-3 h-3" />
                  Lost
                </span>
              ) : (
                <>
                  <button
                    onClick={() => handleConvert(lead._id)}
                    disabled={isConverting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light/10 text-brand-light border border-brand-light/20 text-xs font-medium hover:bg-brand-light/20 transition-all disabled:opacity-50"
                  >
                    {isConverting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    Convert to Client
                  </button>

                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="researching">Researching</option>
                    <option value="building">Building</option>
                    <option value="presented">Presented</option>
                    <option value="lost">Mark Lost</option>
                  </select>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
