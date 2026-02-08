"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";
import Link from "next/link";

type TabType = "users" | "site" | "integrations" | "system";

const TABS = [
  { id: "users" as TabType, label: "User Management", icon: Users },
  { id: "site" as TabType, label: "Site Settings", icon: Globe },
  { id: "integrations" as TabType, label: "Integrations", icon: Server },
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
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "system" && <SystemSettingsTab />}
      </motion.div>
    </div>
  );
}

function UserManagementTab() {
  const users = useQuery(api.admin.getAllUsers);
  const userRoles = useQuery(api.admin.getAllUserRoles);
  const setUserRole = useMutation(api.auth.setUserRole);
  const addUserByEmail = useMutation(api.admin.addUserByEmail);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user" | "client">("user");
  const [isAdding, setIsAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      setAddMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add user"
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (!users || !userRoles) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add User Form */}
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Add User to System</h2>
        <p className="text-sm text-gray-400 mb-4">
          Have the user sign up at <Link href="/login" className="underline text-cyan-400">/login</Link>, then get their User ID from their account settings page and enter it below
        </p>

        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">User ID</label>
              <input
                type="text"
                required
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="User ID from their settings page"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as "admin" | "user" | "client")}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="user">User</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {addMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              addMessage.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {addMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isAdding}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Users with Roles</h2>
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
                        className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-gray-800 [&>option]:text-white"
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
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Initialize form with settings
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
      await updateSettings({
        companyName,
        contactEmail,
        phoneNumber,
        twitterUrl,
        linkedinUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        youtubeUrl,
      });
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage("Failed to save settings");
    }
    setIsSaving(false);
  };

  if (!settings) {
    return <div className="text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Company Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Social Media Links</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Twitter / X</label>
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">LinkedIn</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Instagram</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Facebook</label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">TikTok</label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://tiktok.com/@media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">YouTube</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/@media4u"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          saveMessage.includes("success")
            ? "bg-green-500/10 border border-green-500/30 text-green-400"
            : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          {saveMessage}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Save Site Settings
          </>
        )}
      </button>
    </div>
  );
}

function IntegrationsTab() {
  const checkIntegrations = useAction(api.settings.checkIntegrations);
  const sendTestEmail = useAction(api.settings.sendTestEmail);
  const [integrations, setIntegrations] = useState<{
    resend: boolean;
    stripe: boolean;
    convex: boolean;
    googleAnalytics: boolean;
    fromEmail: string;
    siteUrl: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCheckIntegrations = async () => {
    setIsChecking(true);
    try {
      const result = await checkIntegrations();
      setIntegrations(result);
    } catch (error) {
      console.error("Failed to check integrations:", error);
    }
    setIsChecking(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert("Please enter an email address");
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const result = await sendTestEmail({ toEmail: testEmail });
      setTestResult({
        success: result.success,
        message: result.success ? result.message || "Email sent!" : result.error || "Failed",
      });
    } catch (error) {
      setTestResult({ success: false, message: "Failed to send test email" });
    }
    setIsSendingTest(false);
  };

  useEffect(() => {
    handleCheckIntegrations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <div className="glass-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Integration Status</h2>
          <button
            onClick={handleCheckIntegrations}
            disabled={isChecking}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {integrations ? (
          <div className="space-y-3">
            <IntegrationItem
              name="Convex Database"
              status={integrations.convex}
              description="Real-time database"
            />
            <IntegrationItem
              name="Resend Email"
              status={integrations.resend}
              description="Email delivery service"
            />
            <IntegrationItem
              name="Stripe Payments"
              status={integrations.stripe}
              description="Payment processing"
            />
            <IntegrationItem
              name="Google Analytics"
              status={integrations.googleAnalytics}
              description="Website analytics"
            />
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                <span className="text-gray-500">From Email:</span>{" "}
                <span className="text-white font-mono">{integrations.fromEmail}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <span className="text-gray-500">Site URL:</span>{" "}
                <span className="text-white font-mono">{integrations.siteUrl}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Loading integration status...</p>
        )}
      </div>

      {/* Test Email */}
      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          Test Email
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Send a test email to verify your Resend integration is working.
        </p>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={handleSendTestEmail}
            disabled={isSendingTest || !testEmail}
            className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSendingTest ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Test
              </>
            )}
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            testResult.success
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationItem({ name, status, description }: { name: string; status: boolean; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <div>
        <p className="text-white font-medium">{name}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
        status
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      }`}>
        {status ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Connected
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            Not Configured
          </>
        )}
      </div>
    </div>
  );
}

function SystemSettingsTab() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const exportData = useQuery(api.settings.exportData, { dataType: "contacts" });
  const [exportType, setExportType] = useState<"contacts" | "newsletter" | "leads" | "projects" | "community">("contacts");
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = async (field: "maintenanceMode" | "emailNotifications", value: boolean) => {
    try {
      await updateSettings({ [field]: value });
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Re-fetch with the selected type
      const response = await fetch(`/api/export?type=${exportType}`);
      if (!response.ok) {
        // Fallback: use the query data if API fails
        const data = exportData;
        if (data) {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `media4u-${exportType}-${new Date().toISOString().split("T")[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      // Fallback export using current data
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
              <input
                type="checkbox"
                checked={settings?.maintenanceMode || false}
                onChange={(e) => handleToggle("maintenanceMode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-xs text-gray-400">Send system notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.emailNotifications !== false}
                onChange={(e) => handleToggle("emailNotifications", e.target.checked)}
                className="sr-only peer"
              />
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
            <p className="text-xs text-gray-400">Automatic backups handled by Convex</p>
          </div>
        </div>
      </div>

      <div className="glass-elevated rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Export Data</h2>
        <p className="text-sm text-gray-400 mb-4">
          Download your data as JSON for backup purposes.
        </p>
        <div className="flex gap-3">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as typeof exportType)}
            className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="contacts">Contact Submissions</option>
            <option value="newsletter">Newsletter Subscribers</option>
            <option value="leads">Leads</option>
            <option value="projects">Projects</option>
            <option value="community">Community Members</option>
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export JSON
              </>
            )}
          </button>
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
    </div>
  );
}
