"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Users, Globe, Package, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

type TabType = "users" | "site" | "orders" | "system";

const TABS = [
  { id: "users" as TabType, label: "User Management", icon: Users },
  { id: "site" as TabType, label: "Site Settings", icon: Globe },
  { id: "orders" as TabType, label: "Order Settings", icon: Package },
  { id: "system" as TabType, label: "System", icon: SettingsIcon },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">
          Admin <span className="text-gradient-cyber">Settings</span>
        </h1>
        <p className="text-gray-400">
          Manage users, site configuration, and system preferences.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "users" && <UserManagementTab />}
        {activeTab === "site" && <SiteSettingsTab />}
        {activeTab === "orders" && <OrderSettingsTab />}
        {activeTab === "system" && <SystemSettingsTab />}
      </motion.div>
    </div>
  );
}

function UserManagementTab() {
  const users = useQuery(api.admin.getAllUsers);
  const userRoles = useQuery(api.admin.getAllUserRoles);
  const setUserRole = useMutation(api.auth.setUserRole);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const getUserRole = (userId: string) => {
    const roleRecord = userRoles?.find((r: { userId: string }) => r.userId === userId);
    return roleRecord?.role || "user";
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "user" | "client") => {
    setUpdatingUserId(userId);
    try {
      await setUserRole({ userId, role: newRole });
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!users || !userRoles) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="glass-elevated rounded-2xl p-4 bg-cyan-500/10 border border-cyan-500/30">
        <p className="text-sm text-cyan-400">
          <strong>How to add users:</strong> Have new users sign up at <Link href="/login" className="underline">/login</Link>, then you can assign their role using the dropdown below.
        </p>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">All Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: { _id: string; name: string; email: string; role?: string }) => {
              const currentRole = user.role || getUserRole(user._id);
              return (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{user.name}</td>
                  <td className="py-3 px-4 text-gray-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        currentRole === "admin"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : currentRole === "client"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {currentRole}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={currentRole}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "user" | "client")}
                      disabled={updatingUserId === user._id}
                      className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="user">User</option>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        <p className="text-xs text-gray-500 mt-4">
          Total Users: {users.length}
        </p>
      </div>
    </div>
  );
}

function SiteSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Company Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Company Name</label>
            <input
              type="text"
              defaultValue="Media4U"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
            <input
              type="email"
              defaultValue="support@media4u.fun"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Social Media Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Twitter / X</label>
            <input
              type="url"
              placeholder="https://twitter.com/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">LinkedIn</label>
            <input
              type="url"
              placeholder="https://linkedin.com/company/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Instagram</label>
            <input
              type="url"
              placeholder="https://instagram.com/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <button
        disabled
        className="px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Site Settings (Coming Soon)
      </button>
    </div>
  );
}

function OrderSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Order Status Configuration</h2>
        <div className="space-y-3">
          {["pending", "paid", "processing", "completed", "failed", "refunded"].map((status) => (
            <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white capitalize">{status}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input type="checkbox" defaultChecked={status === "paid" || status === "completed"} className="rounded" />
                  Send Email
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Refund Policy</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Refund Window (days)</label>
            <input
              type="number"
              defaultValue="7"
              min="0"
              max="30"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Allow partial refunds</span>
            </label>
          </div>
        </div>
      </div>

      <button
        disabled
        className="px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Order Settings (Coming Soon)
      </button>
    </div>
  );
}

function SystemSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-white font-medium">Maintenance Mode</p>
              <p className="text-xs text-gray-400">Temporarily disable public access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-xs text-gray-400">Send system notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Database</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <p className="text-sm text-cyan-400 mb-2">Database Status: <span className="font-semibold">Connected</span></p>
            <p className="text-xs text-gray-400">Last backup: Never (automatic backups handled by Convex)</p>
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Cache</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          Clear Browser Cache
        </button>
      </div>

      <button
        disabled
        className="px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save System Settings (Coming Soon)
      </button>
    </div>
  );
}
