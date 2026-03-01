"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Users,
  Globe,
  Settings as SettingsIcon,
  CheckCircle,
  XCircle,
  Send,
  Download,
  Loader2,
  Server,
  Mail,
  RefreshCw,
  Pencil,
  Check,
  X,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Database,
  BarChart3,
  UserCheck,
  Bell,
  Newspaper,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

type TabType = "overview" | "users" | "site" | "integrations" | "system";

const TABS = [
  { id: "overview" as TabType, label: "Overview", icon: BarChart3 },
  { id: "users" as TabType, label: "Users", icon: Users },
  { id: "site" as TabType, label: "Site", icon: Globe },
  { id: "integrations" as TabType, label: "Integrations", icon: Server },
  { id: "system" as TabType, label: "System", icon: SettingsIcon },
];

// ---- Mini bar chart (CSS only, no library needed) ----
function MiniBarChart({ data, color = "bg-brand-light" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            className={`w-full rounded-t-sm ${d.value > 0 ? color : "bg-white/5"} min-h-[2px]`}
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-[9px] text-gray-600 whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Pulsing status dot ----
function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active ? "bg-green-400" : "bg-red-500"}`} />
    </span>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">
          Admin <span className="text-gradient-cyber">Command Center</span>
        </h1>
        <p className="text-gray-400">Business intelligence, settings, and system control.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide border-b border-white/10 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${
              activeTab === tab.id
                ? "bg-brand-light/20 text-brand-light border border-brand-light/40 shadow-lg shadow-brand-light/10"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UserManagementTab />}
          {activeTab === "site" && <SiteSettingsTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "system" && <SystemSettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// OVERVIEW TAB - Business Intelligence
// ============================================================
function OverviewTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const allProjects = useQuery(api.projects.getAllProjects, convexIsAdmin === true ? {} : "skip");
  const allClients = useQuery(api.clients.getAllClients, convexIsAdmin === true ? {} : "skip");
  const allLeads = useQuery(api.leads.getAllLeads, convexIsAdmin === true ? {} : "skip");
  const allSubscriptions = useQuery(api.stripe.getAllSubscriptions, convexIsAdmin === true ? {} : "skip");
  const allOrders = useQuery(api.stripe.getAllOrders, convexIsAdmin === true ? {} : "skip");
  const newsletters = useQuery(api.newsletter.getNewsletterSubscribers, convexIsAdmin === true ? {} : "skip");

  // Revenue calculations
  const invoiceRevenue = useMemo(() =>
    allProjects?.filter((p: { setupInvoicePaid?: boolean; setupFeeAmount?: number }) => p.setupInvoicePaid)
      .reduce((s: number, p: { setupFeeAmount?: number }) => s + (p.setupFeeAmount || 0), 0) ?? 0,
    [allProjects]
  );
  const orderRevenue = useMemo(() =>
    allOrders?.filter((o: { status: string }) => o.status === "paid")
      .reduce((s: number, o: { amount: number }) => s + (o.amount || 0), 0) ?? 0,
    [allOrders]
  );
  const totalRevenue = invoiceRevenue + orderRevenue;
  const mrr = useMemo(() =>
    allSubscriptions?.filter((s: { status: string }) => s.status === "active")
      .reduce((sum: number, s: { planAmount?: number }) => sum + ((s.planAmount || 0) / 100), 0) ?? 0,
    [allSubscriptions]
  );
  const activeSubscriptions = allSubscriptions?.filter((s: { status: string }) => s.status === "active").length ?? 0;
  const arr = mrr * 12;

  // Monthly revenue chart (last 6 months from projects)
  const monthlyRevenue = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", { month: "short" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();
      const value = allProjects
        ?.filter((p: { setupInvoicePaid?: boolean; createdAt?: number }) =>
          p.setupInvoicePaid && p.createdAt && p.createdAt >= monthStart && p.createdAt <= monthEnd
        )
        .reduce((s: number, p: { setupFeeAmount?: number }) => s + (p.setupFeeAmount || 0), 0) ?? 0;
      months.push({ label, value });
    }
    return months;
  }, [allProjects]);

  const statCards = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "MRR", value: `$${mrr.toFixed(0)}/mo`, icon: TrendingUp, color: "text-brand-light", bg: "bg-brand-light/10 border-brand-light/20" },
    { label: "ARR", value: `$${arr.toFixed(0)}`, icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Active Subs", value: activeSubscriptions, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Clients", value: allClients?.length ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Active Leads", value: allLeads?.filter((l: { status: string }) => l.status !== "won" && l.status !== "lost").length ?? 0, icon: UserCheck, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Projects", value: allProjects?.length ?? 0, icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "Subscribers", value: newsletters?.filter((n: { unsubscribed?: boolean }) => !n.unsubscribed).length ?? 0, icon: Newspaper, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`glass-elevated rounded-xl p-4 border ${s.bg}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Chart + Breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 glass-elevated rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Monthly Revenue</h3>
              <p className="text-xs text-gray-500">Setup fees collected - last 6 months</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ${totalRevenue.toLocaleString()} total
            </span>
          </div>
          <MiniBarChart data={monthlyRevenue} color="bg-brand-light" />
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoices</p>
              <p className="text-sm font-bold text-white">{allProjects?.filter((p: { setupInvoicePaid?: boolean }) => p.setupInvoicePaid).length ?? 0} paid</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-sm font-bold text-yellow-400">{allProjects?.filter((p: { setupInvoicePaid?: boolean }) => !p.setupInvoicePaid).length ?? 0} unpaid</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Conversion</p>
              <p className="text-sm font-bold text-brand-light">
                {allLeads?.length ? Math.round((allLeads.filter((l: { status: string }) => l.status === "won").length / allLeads.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* MRR Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-elevated rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-1">Recurring Revenue</h3>
          <p className="text-xs text-gray-500 mb-4">Active subscriptions</p>
          <div className="space-y-3">
            {allSubscriptions?.filter((s: { status: string }) => s.status === "active").map((s: { _id: string; customerEmail: string; planAmount?: number; planName?: string }) => (
              <div key={s._id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/8">
                <div className="min-w-0 mr-2">
                  <p className="text-xs text-white truncate">{s.customerEmail}</p>
                  <p className="text-xs text-gray-500 truncate">{s.planName || "Web Care"}</p>
                </div>
                <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                  ${((s.planAmount || 0) / 100).toFixed(0)}/mo
                </span>
              </div>
            ))}
            {!allSubscriptions?.filter((s: { status: string }) => s.status === "active").length && (
              <p className="text-xs text-gray-500 text-center py-4">No active subscriptions</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total MRR</span>
              <span className="text-sm font-bold text-brand-light">${mrr.toFixed(0)}/mo</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Projected ARR</span>
              <span className="text-sm font-bold text-purple-400">${arr.toFixed(0)}/yr</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Business Health */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-elevated rounded-2xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-light" />
          Business Health Score
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Revenue Health",
              score: Math.min(100, Math.round((totalRevenue / 10000) * 100)),
              color: "bg-emerald-500",
            },
            {
              label: "Client Growth",
              score: Math.min(100, (allClients?.length ?? 0) * 7),
              color: "bg-brand-light",
            },
            {
              label: "Lead Pipeline",
              score: Math.min(100, (allLeads?.filter((l: { status: string }) => l.status !== "lost").length ?? 0) * 10),
              color: "bg-yellow-400",
            },
            {
              label: "Recurring Rev",
              score: Math.min(100, Math.round((mrr / 500) * 100)),
              color: "bg-purple-400",
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" stroke="currentColor" strokeWidth="3" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <motion.path
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ strokeDasharray: `${item.score} 100` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    stroke={item.color.replace("bg-", "").includes("brand-light") ? "#7ee8fa" : undefined}
                    className={item.color.replace("bg-", "stroke-")}
                    strokeWidth="3" fill="none" strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{item.score}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================
// USER MANAGEMENT TAB
// ============================================================
function UserManagementTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const users = useQuery(api.admin.getAllUsers, convexIsAdmin === true ? {} : "skip");
  const userRoles = useQuery(api.admin.getAllUserRoles, convexIsAdmin === true ? {} : "skip");
  const setUserRole = useMutation(api.auth.setUserRole);
  const addUserByEmail = useMutation(api.admin.addUserByEmail);
  const updateUserName = useMutation(api.admin.updateUserName);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [isAdding, setIsAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const getUserRole = (userId: string) => {
    const roleRecord = userRoles?.find((r: { userId: string }) => r.userId === userId);
    return roleRecord?.role || "user";
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    setUpdatingUserId(userId);
    try {
      await setUserRole({ userId, role: newRole });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddMessage(null);
    try {
      const result = await addUserByEmail({ userId: newUserId, role: newUserRole });
      setAddMessage({ type: "success", text: result.message });
      setNewUserId("");
      setNewUserRole("user");
    } catch (error) {
      setAddMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add user" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveName = async (userId: string) => {
    if (!editName.trim()) return;
    setSavingName(true);
    try {
      await updateUserName({ userId, name: editName.trim() });
      setEditingUserId(null);
      setEditName("");
    } catch {
      alert("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  if (!users || !userRoles) return <div className="text-gray-400 p-4">Loading users...</div>;

  const adminCount = users.filter((u: { _id: string }) => getUserRole(u._id) === "admin").length;
  const userCount = users.length - adminCount;

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "text-brand-light", bg: "bg-brand-light/10 border-brand-light/20" },
          { label: "Admins", value: adminCount, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Regular Users", value: userCount, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        ].map((s) => (
          <div key={s.label} className={`glass-elevated rounded-xl p-4 border ${s.bg} text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add User */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-light/10 border border-brand-light/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-brand-light" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Add User to System</h2>
            <p className="text-xs text-gray-500">Have the user sign up at <Link href="/login" className="text-brand-light hover:underline">/login</Link>, then enter their User ID below</p>
          </div>
        </div>
        <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text" required value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="User ID from their settings page"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 font-mono text-sm"
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={isAdding}
            className="px-5 py-2.5 rounded-lg bg-brand-light text-white font-medium hover:bg-brand transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            {isAdding ? "Adding..." : "Add User"}
          </button>
        </form>
        {addMessage && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${addMessage.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
            {addMessage.text}
          </div>
        )}
      </div>

      {/* User Cards */}
      <div className="glass-elevated rounded-2xl overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Team Members</h2>
          <span className="text-xs text-gray-500">{users.length} total</span>
        </div>
        <div className="divide-y divide-white/8">
          {users.map((user: { _id: string; name: string; email: string }) => {
            const currentRole = getUserRole(user._id);
            const isEditing = editingUserId === user._id;
            return (
              <div key={user._id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-full bg-brand-light/20 border border-brand-light/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-light text-sm font-bold">{(user.name || "?")[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-brand-light/50 w-40"
                        autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(user._id); if (e.key === "Escape") { setEditingUserId(null); setEditName(""); } }}
                      />
                      <button onClick={() => handleSaveName(user._id)} disabled={savingName} className="p-1 text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingUserId(null); setEditName(""); }} className="p-1 text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{user.name}</p>
                      <button onClick={() => { setEditingUserId(user._id); setEditName(user.name); }} className="p-0.5 text-gray-600 hover:text-brand-light transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 truncate">{user.email || "No email stored"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${currentRole === "admin" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                    {currentRole}
                  </span>
                  <select value={currentRole} onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "user")}
                    disabled={updatingUserId === user._id}
                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-light/50 disabled:opacity-50 [&>option]:bg-gray-800">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SITE SETTINGS TAB
// ============================================================
function SiteSettingsTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const settings = useQuery(api.settings.getSettings, convexIsAdmin === true ? {} : "skip");
  const updateSettings = useMutation(api.settings.updateSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || "Media4U");
      setContactEmail(settings.contactEmail || "");
      setPhoneNumber(settings.phoneNumber || "");
      setTwitterUrl(settings.twitterUrl || "");
      setLinkedinUrl(settings.linkedinUrl || "");
      setInstagramUrl(settings.instagramUrl || "");
      setFacebookUrl(settings.facebookUrl || "");
      setTiktokUrl(settings.tiktokUrl || "");
      setYoutubeUrl(settings.youtubeUrl || "");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateSettings({ companyName, contactEmail, phoneNumber, twitterUrl, linkedinUrl, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl });
      setSaveMessage("success");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage("error");
    }
    setIsSaving(false);
  };

  const INPUT = "w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 text-sm";
  const LABEL = "block text-xs text-gray-500 mb-1.5 uppercase tracking-wider";

  if (!settings) return <div className="text-gray-400 p-4">Loading settings...</div>;

  const socials = [
    { label: "Twitter / X", value: twitterUrl, set: setTwitterUrl, placeholder: "https://twitter.com/media4u", color: "text-sky-400" },
    { label: "LinkedIn", value: linkedinUrl, set: setLinkedinUrl, placeholder: "https://linkedin.com/company/media4u", color: "text-blue-500" },
    { label: "Instagram", value: instagramUrl, set: setInstagramUrl, placeholder: "https://instagram.com/media4u", color: "text-pink-400" },
    { label: "Facebook", value: facebookUrl, set: setFacebookUrl, placeholder: "https://facebook.com/media4u", color: "text-blue-400" },
    { label: "TikTok", value: tiktokUrl, set: setTiktokUrl, placeholder: "https://tiktok.com/@media4u", color: "text-white" },
    { label: "YouTube", value: youtubeUrl, set: setYoutubeUrl, placeholder: "https://youtube.com/@media4u", color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-brand-light" />
          <h2 className="text-base font-semibold text-white">Company Information</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Contact Email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" className={INPUT} />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-brand-light" />
          <h2 className="text-base font-semibold text-white">Social Media</h2>
          <span className="text-xs text-gray-600 ml-auto">{socials.filter(s => s.value).length}/{socials.length} connected</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {socials.map((s) => (
            <div key={s.label}>
              <label className={LABEL}>
                <span className={s.color}>{s.label}</span>
                {s.value && <span className="ml-2 text-green-400">- connected</span>}
              </label>
              <input type="url" value={s.value} onChange={(e) => s.set(e.target.value)} placeholder={s.placeholder} className={INPUT} />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-brand-light text-white font-medium hover:bg-brand transition-colors disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><CheckCircle className="w-4 h-4" />Save Settings</>}
        </button>
        <AnimatePresence>
          {saveMessage && (
            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className={`text-sm ${saveMessage === "success" ? "text-green-400" : "text-red-400"}`}>
              {saveMessage === "success" ? "Saved successfully!" : "Failed to save"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// INTEGRATIONS TAB
// ============================================================
function IntegrationsTab() {
  const checkIntegrations = useAction(api.settings.checkIntegrations);
  const sendTestEmail = useAction(api.settings.sendTestEmail);
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const googleConnected = useQuery(api.googleCalendar.getConnectionStatus, convexIsAdmin === true ? {} : "skip");
  const disconnectCalendar = useMutation(api.googleCalendar.disconnectCalendar);
  const [disconnecting, setDisconnecting] = useState(false);
  const [integrations, setIntegrations] = useState<{ resend: boolean; stripe: boolean; convex: boolean; googleAnalytics: boolean; fromEmail: string; siteUrl: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCheckIntegrations = async () => {
    setIsChecking(true);
    try {
      const result = await checkIntegrations();
      setIntegrations(result);
    } catch { /* ignore */ }
    setIsChecking(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const result = await sendTestEmail({ toEmail: testEmail });
      setTestResult({ success: result.success, message: result.success ? result.message || "Email sent!" : result.error || "Failed" });
    } catch {
      setTestResult({ success: false, message: "Failed to send test email" });
    }
    setIsSendingTest(false);
  };

  useEffect(() => { handleCheckIntegrations(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const integrationItems = integrations ? [
    { name: "Convex Database", status: integrations.convex, description: "Real-time database & backend", icon: Database, color: "text-brand-light" },
    { name: "Resend Email", status: integrations.resend, description: integrations.fromEmail, icon: Mail, color: "text-orange-400" },
    { name: "Stripe Payments", status: integrations.stripe, description: "Payment processing", icon: DollarSign, color: "text-emerald-400" },
    { name: "Google Analytics", status: integrations.googleAnalytics, description: integrations.siteUrl, icon: BarChart3, color: "text-yellow-400" },
  ] : [];

  const connectedCount = integrationItems.filter(i => i.status).length;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-light" />
            <h2 className="text-base font-semibold text-white">System Integrations</h2>
            {integrations && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 ${connectedCount === integrationItems.length ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                {connectedCount}/{integrationItems.length} online
              </span>
            )}
          </div>
          <button onClick={handleCheckIntegrations} disabled={isChecking}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        {integrations ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {integrationItems.map((item) => (
              <div key={item.name} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${item.status ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.status ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot active={item.status} />
                  <span className={`text-xs font-medium ${item.status ? "text-green-400" : "text-red-400"}`}>
                    {item.status ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 py-4"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Checking integrations...</span></div>
        )}
      </div>

      {/* Test Email */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-orange-400" />
          <h2 className="text-base font-semibold text-white">Send Test Email</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Verify your Resend integration is working correctly.</p>
        <div className="flex gap-3">
          <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 text-sm" />
          <button onClick={handleSendTestEmail} disabled={isSendingTest || !testEmail}
            className="px-5 py-2.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-medium">
            {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSendingTest ? "Sending..." : "Send Test"}
          </button>
        </div>
        <AnimatePresence>
          {testResult && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${testResult.success ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
              {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {testResult.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Google Calendar */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-green-400" />
          <h2 className="text-base font-semibold text-white">Google Calendar</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Connect Google Calendar so events created via Quick Add sync automatically.</p>
        {googleConnected ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3">
              <StatusDot active={true} />
              <div>
                <p className="text-white text-sm font-medium">Connected</p>
                <p className="text-xs text-gray-400">Events sync to your Media4U calendar</p>
              </div>
            </div>
            <button onClick={async () => { setDisconnecting(true); await disconnectCalendar(); setDisconnecting(false); }}
              disabled={disconnecting}
              className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-sm disabled:opacity-50">
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="/api/auth/google" rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition-all text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Calendar
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SYSTEM TAB
// ============================================================
function SystemSettingsTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const settings = useQuery(api.settings.getSettings, convexIsAdmin === true ? {} : "skip");
  const updateSettings = useMutation(api.settings.updateSettings);
  const exportData = useQuery(api.settings.exportData, convexIsAdmin === true ? { dataType: "contacts" } : "skip");
  const [exportType, setExportType] = useState<"contacts" | "newsletter" | "leads" | "projects" | "community">("contacts");
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = async (field: "maintenanceMode" | "emailNotifications", value: boolean) => {
    try { await updateSettings({ [field]: value }); } catch { /* ignore */ }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export?type=${exportType}`);
      if (!response.ok) throw new Error("API failed");
    } catch {
      if (exportData) {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `media4u-${exportType}-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    setIsExporting(false);
  };

  const systemChecks = [
    { label: "Database", status: true, detail: "Convex - auto-backup enabled", icon: Database, color: "text-brand-light" },
    { label: "Maintenance Mode", status: !(settings?.maintenanceMode), detail: settings?.maintenanceMode ? "Site is in maintenance" : "Site is live", icon: Globe, color: "text-green-400" },
    { label: "Email Notifications", status: settings?.emailNotifications !== false, detail: "System alerts active", icon: Bell, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-brand-light" />
          <h2 className="text-base font-semibold text-white">System Status</h2>
        </div>
        <div className="space-y-3">
          {systemChecks.map((item) => (
            <div key={item.label} className={`flex items-center gap-3 p-4 rounded-xl border ${item.status ? "bg-green-500/5 border-green-500/15" : "bg-red-500/5 border-red-500/15"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
              {item.label !== "Database" ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={item.status}
                    onChange={(e) => handleToggle(item.label === "Maintenance Mode" ? "maintenanceMode" : "emailNotifications", item.label === "Maintenance Mode" ? !e.target.checked : e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-light"></div>
                </label>
              ) : (
                <div className="flex items-center gap-1.5">
                  <StatusDot active={true} />
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Data */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Export Data</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Download your data as JSON for backup or migration.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={exportType} onChange={(e) => setExportType(e.target.value as typeof exportType)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 text-sm [&>option]:bg-gray-800">
            <option value="contacts">Contact Submissions</option>
            <option value="newsletter">Newsletter Subscribers</option>
            <option value="leads">Leads</option>
            <option value="projects">Projects</option>
            <option value="community">Community Members</option>
          </select>
          <button onClick={handleExport} disabled={isExporting}
            className="px-5 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50">
            {isExporting ? <><Loader2 className="w-4 h-4 animate-spin" />Exporting...</> : <><Download className="w-4 h-4" />Export JSON</>}
          </button>
        </div>
      </div>

      {/* Cache */}
      <div className="glass-elevated rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Cache & Performance</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Clear browser cache to reload the latest version of the admin panel.</p>
        <button onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all text-sm font-medium flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Clear Cache &amp; Reload
        </button>
      </div>
    </div>
  );
}
