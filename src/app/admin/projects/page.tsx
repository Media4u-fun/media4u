/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Search, Plus, X, ExternalLink, FileDown, MessageSquarePlus, Trash2, Palette, Share2, Lock, Copy, Check, Upload, Image as ImageIcon, File, Mail, Receipt, ToggleLeft, ToggleRight, CheckCircle, Clock, CreditCard, AlertCircle, RotateCcw, Monitor } from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

type ProjectStatus = "new" | "planning" | "design" | "development" | "review" | "completed" | "launched";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  planning: "bg-brand-dark/20 text-brand-light border-brand-dark/30",
  design: "bg-brand-dark/20 text-pink-400 border-pink-500/30",
  development: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  launched: "bg-brand-light/20 text-brand-light border-brand-light/30",
};

const statusLabels: Record<ProjectStatus, string> = {
  new: "New",
  planning: "Planning",
  design: "Design",
  development: "Development",
  review: "Review",
  completed: "Completed",
  launched: "Launched",
};

export default function ProjectsAdminPage() {
  const projects = useQuery(api.projects.getAllProjects);
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const addProjectNote = useMutation(api.projects.addProjectNote);
  const deleteProjectNote = useMutation(api.projects.deleteProjectNote);
  const setCustomDeal = useMutation(api.projects.setCustomDeal);
  const confirmSetupInvoicePaid = useMutation(api.projects.confirmSetupInvoicePaid);
  const updateCustomDealAmounts = useMutation(api.projects.updateCustomDealAmounts);

  // Project Files
  const generateUploadUrl = useMutation(api.projectFiles.generateUploadUrl);
  const saveFileMetadata = useMutation(api.projectFiles.saveFileMetadata);
  const deleteFile = useMutation(api.projectFiles.deleteFile);

  // Email Client
  const sendClientEmail = useAction(api.projectClientEmails.sendProjectClientEmail);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all" | "active">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [exportedVault, setExportedVault] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"details" | "client-view">("details");
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  // Add Project Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    description: "",
    requirements: "",
    budget: "",
    timeline: "",
    notes: "",
  });

  // Filter by status first, then search
  let filtered = projects;

  if (filterStatus === "active") {
    filtered = filtered?.filter((p: any) => p.status !== "completed" && p.status !== "launched");
  } else if (filterStatus !== "all") {
    filtered = filtered?.filter((p: any) => p.status === filterStatus);
  }

  if (searchQuery.trim() && filtered) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((p: any) =>
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query) ||
      p.projectType.toLowerCase().includes(query)
    );
  }

  const selected = projects?.find((p: any) => p._id === selectedId);
  const projectNotes = useQuery(
    api.projects.getProjectNotes,
    selectedId ? { projectId: selectedId as Id<"projects"> } : "skip"
  );
  const projectFiles = useQuery(
    api.projectFiles.getProjectFiles,
    selectedId ? { projectId: selectedId as Id<"projects"> } : "skip"
  );

  async function handleStatusChange(id: Id<"projects">, newStatus: ProjectStatus) {
    await updateProject({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"projects">) {
    if (confirm("Delete this project? This cannot be undone.")) {
      await deleteProject({ id });
      setSelectedId(null);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.projectType || !formData.description) {
      alert("Please fill in Name, Email, Project Type, and Description");
      return;
    }

    await createProject({
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      phone: formData.phone || undefined,
      projectType: formData.projectType,
      description: formData.description,
      requirements: formData.requirements || undefined,
      budget: formData.budget || undefined,
      timeline: formData.timeline || undefined,
      notes: formData.notes || undefined,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      projectType: "",
      description: "",
      requirements: "",
      budget: "",
      timeline: "",
      notes: "",
    });
    setIsAddModalOpen(false);
  }

  async function handleUpdateField(field: string, value: string | string[]) {
    if (!selected) return;
    await updateProject({
      id: selected._id,
      [field]: value,
    });
  }

  async function handleUpdateBrandColor(colorType: "primary" | "secondary" | "accent", value: string) {
    if (!selected) return;
    await updateProject({
      id: selected._id,
      brandColors: {
        primary: selected.brandColors?.primary,
        secondary: selected.brandColors?.secondary,
        accent: selected.brandColors?.accent,
        [colorType]: value,
      },
    });
  }

  async function handleUpdateSocialLink(platform: string, value: string) {
    if (!selected) return;
    await updateProject({
      id: selected._id,
      socialLinks: {
        website: selected.socialLinks?.website,
        instagram: selected.socialLinks?.instagram,
        facebook: selected.socialLinks?.facebook,
        twitter: selected.socialLinks?.twitter,
        linkedin: selected.socialLinks?.linkedin,
        youtube: selected.socialLinks?.youtube,
        tiktok: selected.socialLinks?.tiktok,
        [platform]: value,
      },
    });
  }

  async function handleAddNote() {
    if (!selected || !newNote.trim()) return;
    await addProjectNote({
      projectId: selected._id,
      note: newNote.trim(),
      createdBy: "Admin", // You can replace with actual admin name if needed
    });
    setNewNote("");
  }

  async function handleDeleteNote(noteId: Id<"projectNotes">) {
    if (confirm("Delete this note?")) {
      await deleteProjectNote({ id: noteId });
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Save file metadata
      await saveFileMetadata({
        projectId: selectedId as Id<"projects">,
        storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Reset input
      e.target.value = "";
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteFile(fileId: Id<"projectFiles">) {
    if (confirm("Delete this file? This cannot be undone.")) {
      await deleteFile({ id: fileId });
    }
  }

  async function handleSendEmail(message: string, attachments?: Array<{ filename: string; content: string }>) {
    if (!selected) return;

    await sendClientEmail({
      to: selected.email,
      toName: selected.name,
      projectName: `${selected.projectType} - ${selected.name}`,
      subject: `Update on Your ${selected.projectType} Project`,
      message,
      attachments,
    });
  }

  async function handleExportForClaude() {
    if (!selected) return;

    const lines: string[] = [];
    const sep = "=".repeat(60);

    lines.push("PROJECT BRIEFING FOR CLAUDE");
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push(sep);

    // Client info
    lines.push("CLIENT");
    lines.push(`Name: ${selected.name}`);
    lines.push(`Email: ${selected.email}`);
    if (selected.company) lines.push(`Company: ${selected.company}`);
    if (selected.phone) lines.push(`Phone: ${selected.phone}`);
    lines.push("");

    // Project info
    lines.push("PROJECT");
    lines.push(`Type: ${selected.projectType}`);
    lines.push(`Status: ${selected.status}`);
    if (selected.description) lines.push(`Description: ${selected.description}`);
    if (selected.requirements) lines.push(`Requirements: ${selected.requirements}`);
    if (selected.budget) lines.push(`Budget: ${selected.budget}`);
    if (selected.timeline) lines.push(`Timeline: ${selected.timeline}`);
    if (selected.liveUrl) lines.push(`Live URL: ${selected.liveUrl}`);
    lines.push("");

    // Custom deal
    if (selected.isCustomDeal) {
      lines.push("CUSTOM DEAL");
      lines.push(`Setup Fee: $${selected.setupFeeAmount ?? 500}`);
      lines.push(`Monthly: $${selected.monthlyAmount ?? 149}/month`);
      lines.push(`Invoice Status: ${selected.setupInvoiceStatus ?? "pending"}`);
      if (selected.setupInvoiceUrl) lines.push(`Invoice URL: ${selected.setupInvoiceUrl}`);
      if (selected.intakeSubmittedAt) lines.push(`Intake Submitted: ${new Date(selected.intakeSubmittedAt).toLocaleDateString()}`);
      else lines.push("Intake: Not submitted yet");
      lines.push("");
    }

    // Website goals from intake
    if (selected.websiteGoals) {
      lines.push("WEBSITE GOALS (from client intake)");
      lines.push(selected.websiteGoals);
      lines.push("");
    }

    // Brand colors
    if (selected.brandColors && (selected.brandColors.primary || selected.brandColors.secondary)) {
      lines.push("BRAND COLORS");
      if (selected.brandColors.primary) lines.push(`Primary: ${selected.brandColors.primary}`);
      if (selected.brandColors.secondary) lines.push(`Secondary: ${selected.brandColors.secondary}`);
      if (selected.brandColors.accent) lines.push(`Accent: ${selected.brandColors.accent}`);
      lines.push("");
    }

    // Social links
    if (selected.socialLinks) {
      const socials = Object.entries(selected.socialLinks).filter(([, v]) => v);
      if (socials.length > 0) {
        lines.push("SOCIAL / WEB LINKS");
        socials.forEach(([k, v]) => lines.push(`${k}: ${v}`));
        lines.push("");
      }
    }

    // Technical features
    if (selected.technicalFeatures && selected.technicalFeatures.length > 0) {
      lines.push(`TECHNICAL FEATURES: ${selected.technicalFeatures.join(", ")}`);
      lines.push("");
    }

    // Recent notes
    if (projectNotes && projectNotes.length > 0) {
      lines.push("PROJECT NOTES");
      projectNotes.slice(0, 5).forEach((note: any) => {
        const date = new Date(note.createdAt).toLocaleDateString();
        lines.push(`[${date}] ${note.note}`);
      });
      lines.push("");
    }

    lines.push(sep);
    lines.push("Use this briefing to understand the full context of this client project.");

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 3000);
  }

  function exportNotes() {
    if (!selected || !projectNotes || projectNotes.length === 0) {
      alert("No notes to export");
      return;
    }

    // Create export text
    let exportText = `Project Notes - ${selected.name}\n`;
    exportText += `Client: ${selected.name} (${selected.email})\n`;
    exportText += `Project Type: ${selected.projectType}\n`;
    exportText += `Exported: ${new Date().toLocaleString()}\n`;
    exportText += `\n${"=".repeat(60)}\n\n`;

    projectNotes.forEach((note: any) => {
      const date = new Date(note.createdAt).toLocaleString();
      exportText += `[${date}]`;
      if (note.createdBy) exportText += ` - ${note.createdBy}`;
      exportText += `\n${note.note}\n\n`;
    });

    // Create downloadable file
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.name.replace(/[^a-z0-9]/gi, "_")}_notes_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportVaultForClaude() {
    if (!selected) {
      alert("No project selected");
      return;
    }

    const vault = selected.integrationVault;
    if (!vault) {
      alert("No integration vault data available for this project");
      return;
    }

    // Create formatted export text
    let exportText = `=== PROJECT SETUP: ${selected.name} - ${selected.projectType} ===\n\n`;
    exportText += `Client: ${selected.name}\n`;
    exportText += `Email: ${selected.email}\n`;
    if (selected.company) exportText += `Company: ${selected.company}\n`;
    exportText += `\nExported: ${new Date().toLocaleString()}\n`;
    exportText += `\n${"=".repeat(70)}\n\n`;

    // Email Provider Section
    if (vault.emailProvider || vault.emailApiKey || vault.emailFromAddress) {
      exportText += `📧 EMAIL PROVIDER\n`;
      if (vault.emailProvider) exportText += `Provider: ${vault.emailProvider}\n`;
      if (vault.emailApiKey) exportText += `API Key: ${vault.emailApiKey}\n`;
      if (vault.emailFromAddress) exportText += `From Address: ${vault.emailFromAddress}\n`;
      exportText += `\n`;
    }

    // Analytics Section
    if (vault.googleAnalyticsId || vault.googleTagManagerId || vault.facebookPixelId) {
      exportText += `📊 ANALYTICS\n`;
      if (vault.googleAnalyticsId) exportText += `Google Analytics ID: ${vault.googleAnalyticsId}\n`;
      if (vault.googleTagManagerId) exportText += `Google Tag Manager ID: ${vault.googleTagManagerId}\n`;
      if (vault.facebookPixelId) exportText += `Facebook Pixel ID: ${vault.facebookPixelId}\n`;
      exportText += `\n`;
    }

    // Webhooks Section
    if (vault.webhookUrl || vault.webhookSecret) {
      exportText += `🔗 WEBHOOKS\n`;
      if (vault.webhookUrl) exportText += `Webhook URL: ${vault.webhookUrl}\n`;
      if (vault.webhookSecret) exportText += `Webhook Secret: ${vault.webhookSecret}\n`;
      exportText += `\n`;
    }

    // Stripe Section
    if (vault.stripePublishableKey || vault.stripeSecretKey) {
      exportText += `💳 STRIPE\n`;
      if (vault.stripePublishableKey) exportText += `Publishable Key: ${vault.stripePublishableKey}\n`;
      if (vault.stripeSecretKey) exportText += `Secret Key: ${vault.stripeSecretKey}\n`;
      exportText += `\n`;
    }

    // Custom API Keys Section
    if (vault.customApiKey1Label || vault.customApiKey2Label || vault.customApiKey3Label) {
      exportText += `🔑 CUSTOM API KEYS\n`;
      if (vault.customApiKey1Label) {
        exportText += `${vault.customApiKey1Label}: ${vault.customApiKey1Value || "[Not provided]"}\n`;
      }
      if (vault.customApiKey2Label) {
        exportText += `${vault.customApiKey2Label}: ${vault.customApiKey2Value || "[Not provided]"}\n`;
      }
      if (vault.customApiKey3Label) {
        exportText += `${vault.customApiKey3Label}: ${vault.customApiKey3Value || "[Not provided]"}\n`;
      }
      exportText += `\n`;
    }

    // Additional Notes
    if (vault.notes) {
      exportText += `📝 ADDITIONAL NOTES\n`;
      exportText += `${vault.notes}\n\n`;
    }

    // Project Details
    exportText += `${"=".repeat(70)}\n\n`;
    exportText += `PROJECT DETAILS\n\n`;
    exportText += `Description: ${selected.description}\n`;
    if (selected.requirements) exportText += `Requirements: ${selected.requirements}\n`;
    if (selected.budget) exportText += `Budget: ${selected.budget}\n`;
    if (selected.timeline) exportText += `Timeline: ${selected.timeline}\n`;
    if (selected.liveUrl) exportText += `Live URL: ${selected.liveUrl}\n`;

    // Technical Requirements
    if (selected.backendComplexity || selected.technicalFeatures) {
      exportText += `\nTECHNICAL REQUIREMENTS\n`;
      if (selected.backendComplexity) exportText += `Backend: ${selected.backendComplexity}\n`;
      if (selected.technicalFeatures && selected.technicalFeatures.length > 0) {
        exportText += `Features: ${selected.technicalFeatures.join(", ")}\n`;
      }
    }

    // Brand Colors
    if (selected.brandColors) {
      exportText += `\nBRAND COLORS\n`;
      if (selected.brandColors.primary) exportText += `Primary: ${selected.brandColors.primary}\n`;
      if (selected.brandColors.secondary) exportText += `Secondary: ${selected.brandColors.secondary}\n`;
      if (selected.brandColors.accent) exportText += `Accent: ${selected.brandColors.accent}\n`;
    }

    // Social Links
    if (selected.socialLinks) {
      const hasLinks = Object.values(selected.socialLinks).some(link => link);
      if (hasLinks) {
        exportText += `\nSOCIAL MEDIA LINKS\n`;
        if (selected.socialLinks.website) exportText += `Website: ${selected.socialLinks.website}\n`;
        if (selected.socialLinks.instagram) exportText += `Instagram: ${selected.socialLinks.instagram}\n`;
        if (selected.socialLinks.facebook) exportText += `Facebook: ${selected.socialLinks.facebook}\n`;
        if (selected.socialLinks.twitter) exportText += `Twitter: ${selected.socialLinks.twitter}\n`;
        if (selected.socialLinks.linkedin) exportText += `LinkedIn: ${selected.socialLinks.linkedin}\n`;
        if (selected.socialLinks.youtube) exportText += `YouTube: ${selected.socialLinks.youtube}\n`;
        if (selected.socialLinks.tiktok) exportText += `TikTok: ${selected.socialLinks.tiktok}\n`;
      }
    }

    exportText += `\n${"=".repeat(70)}\n`;
    exportText += `\nThis export contains all setup information needed to build ${selected.name}'s project.\n`;
    exportText += `Copy and paste this entire message to Claude to provide full project context.\n`;

    setExportedVault(exportText);
  }

  async function copyExportToClipboard() {
    if (!exportedVault) return;
    await navigator.clipboard.writeText(exportedVault);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Client Projects</h1>
          <p className="text-gray-400">Manage your website and VR projects</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-brand-light text-white hover:bg-brand transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, company, or project type..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {(["active", "all", "new", "planning", "design", "development", "review", "completed", "launched"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filterStatus === status
                ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "active" ? "Active" : status === "all" ? "All" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {filtered?.length || 0} Projects
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filtered?.map((project: any) => (
                <motion.button
                  key={project._id}
                  onClick={() => setSelectedId(project._id)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === project._id
                      ? "border-brand-light bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">{project.name}</p>
                  <p className="text-xs text-gray-400 truncate">{project.projectType}</p>
                  {project.company && (
                    <p className="text-xs text-gray-500 truncate mt-1">{project.company}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[project.status as ProjectStatus]}`}
                    >
                      {statusLabels[project.status as ProjectStatus]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Client Name</p>
                  <p className="text-xl font-semibold text-white">{selected.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportForClaude}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                      copiedBriefing
                        ? "bg-green-500/20 border-green-500/40 text-green-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {copiedBriefing ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedBriefing ? "Copied!" : "Export for Claude"}
                  </button>
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-light to-brand-dark text-white hover:opacity-90 transition-opacity flex items-center gap-2 font-medium text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email Client
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
                {(["details", "client-view"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      detailTab === tab
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "details" ? "Admin Details" : "Client View"}
                  </button>
                ))}
              </div>

              {detailTab === "details" && (<div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-brand-light hover:text-brand-light">
                    {selected.email}
                  </a>
                </div>

                {selected.phone && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${selected.phone}`} className="text-brand-light hover:text-brand-light">
                      {selected.phone}
                    </a>
                  </div>
                )}
              </div>

              {selected.company && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Company</p>
                  <p className="text-white">{selected.company}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Project Type</p>
                <p className="text-white">{selected.projectType}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
                <p className="text-gray-300 whitespace-pre-wrap">{selected.description}</p>
              </div>

              {selected.requirements && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Requirements</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.requirements}</p>
                </div>
              )}

              {/* Wizard data - only shown if present */}
              {selected.primaryGoal && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Primary Goal</p>
                  <p className="text-gray-300">{selected.primaryGoal}</p>
                </div>
              )}
              {selected.lookAndFeel && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Look & Feel</p>
                  <p className="text-gray-300">{selected.lookAndFeel}</p>
                </div>
              )}
              {selected.growthStage && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Growth Stage</p>
                  <p className="text-gray-300">{selected.growthStage}</p>
                </div>
              )}
              {selected.websiteGoals && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Website Goals</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.websiteGoals}</p>
                </div>
              )}

              {/* Link to original request if not yet linked */}
              {!selected.sourceRequestId && (
                <LinkRequestSection projectId={selected._id} />
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {selected.budget && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Budget</p>
                    <p className="text-white">{selected.budget}</p>
                  </div>
                )}

                {selected.timeline && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Timeline</p>
                    <p className="text-white">{selected.timeline}</p>
                  </div>
                )}
              </div>

              {/* Technical Requirements */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-white mb-4">Technical Requirements</p>

                <div className="space-y-4">
                  {/* Backend Complexity */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Backend Complexity</p>
                    <select
                      value={selected.backendComplexity || "none"}
                      onChange={(e) => handleUpdateField("backendComplexity", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="none">None - Static/Frontend Only</option>
                      <option value="simple">Simple - Forms & Email Only</option>
                      <option value="standard">Standard - Database + Auth</option>
                      <option value="fullstack">Full Stack - Complex Backend + APIs</option>
                    </select>
                  </div>

                  {/* Technical Features */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Additional Features</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["User Authentication", "Admin Dashboard", "Database", "Payment Processing", "E-commerce", "API Integrations", "VR/3D Content", "Real-time Features"].map((feature) => (
                        <label key={feature} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selected.technicalFeatures?.includes(feature) || false}
                            onChange={(e) => {
                              const current = selected.technicalFeatures || [];
                              const updated = e.target.checked
                                ? [...current, feature]
                                : current.filter((f: string) => f !== feature);
                              handleUpdateField("technicalFeatures", updated);
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-light focus:ring-brand-light/50"
                          />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live URL (editable) */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Live Site URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={selected.liveUrl || ""}
                    onChange={(e) => handleUpdateField("liveUrl", e.target.value)}
                    placeholder="https://client-site.com"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  />
                  {selected.liveUrl && (
                    <a
                      href={selected.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </a>
                  )}
                </div>
              </div>

              {/* Custom Deal Section */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm font-semibold text-white">Custom Deal</p>
                </div>

                <div className="glass rounded-xl p-4 space-y-4">
                  {/* Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Enable Custom Deal Flow</p>
                      <p className="text-xs text-gray-500 mt-0.5">Shows intake form + invoice + subscription in client portal</p>
                    </div>
                    <button
                      onClick={async () => {
                        await setCustomDeal({ projectId: selected._id, isCustomDeal: !selected.isCustomDeal });
                      }}
                      className="flex items-center gap-1 text-sm"
                    >
                      {selected.isCustomDeal ? (
                        <ToggleRight className="w-8 h-8 text-brand-light" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Custom amount fields + invoice - only show when enabled */}
                  {selected.isCustomDeal && (
                    <div className="pt-3 border-t border-white/10 space-y-4">

                      {/* Amount fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">Setup Fee ($)</label>
                          <input
                            type="number"
                            defaultValue={selected.setupFeeAmount ?? 500}
                            onBlur={async (e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                await updateCustomDealAmounts({ projectId: selected._id, setupFeeAmount: val });
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">Monthly ($)</label>
                          <input
                            type="number"
                            defaultValue={selected.monthlyAmount ?? 149}
                            onBlur={async (e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                await updateCustomDealAmounts({ projectId: selected._id, monthlyAmount: val });
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
                          />
                        </div>
                      </div>

                      {/* Setup Invoice status + send button */}
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Setup Invoice</p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {selected.setupInvoiceStatus === "paid" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Paid</span>
                            )}
                            {selected.setupInvoiceStatus === "sent" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Invoice Sent</span>
                            )}
                            {selected.setupInvoiceStatus === "needs_verification" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Client says paid</span>
                            )}
                            {(!selected.setupInvoiceStatus || selected.setupInvoiceStatus === "pending") && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Not sent</span>
                            )}
                            {selected.setupInvoiceUrl && (
                              <a href={selected.setupInvoiceUrl} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-brand-light hover:text-brand-light underline">
                                View invoice
                              </a>
                            )}
                          </div>

                          {/* Send invoice button - show if not yet paid */}
                          {selected.setupInvoiceStatus !== "paid" && (
                            <button
                              onClick={async () => {
                                const amount = selected.setupFeeAmount ?? 500;
                                if (!confirm(`Send a $${amount} Stripe invoice to ${selected.email}?`)) return;
                                try {
                                  const res = await fetch("/api/stripe/create-invoice", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      projectId: selected._id,
                                      customerEmail: selected.email,
                                      customerName: selected.name,
                                      amountDollars: amount,
                                      description: `Website Setup Fee - ${selected.projectType}`,
                                      monthlyAmount: selected.monthlyAmount ?? 149,
                                    }),
                                  });
                                  const data = await res.json() as { success?: boolean; error?: string };
                                  if (!res.ok) throw new Error(data.error ?? "Failed");
                                  alert("Invoice sent via Stripe! Client will receive an email.");
                                } catch (err) {
                                  alert(`Error: ${err instanceof Error ? err.message : "Failed to send invoice"}`);
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 text-xs font-medium transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              {selected.setupInvoiceStatus === "sent" ? "Resend Invoice" : "Send Stripe Invoice"}
                            </button>
                          )}

                          {/* Manual confirm button (fallback) */}
                          {selected.setupInvoiceStatus === "needs_verification" && !selected.setupInvoicePaid && (
                            <button
                              onClick={async () => { await confirmSetupInvoicePaid({ projectId: selected._id }); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 text-xs font-medium transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Confirm Paid
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Intake status */}
                      <div>
                        <p className="text-xs text-gray-400">Intake Form</p>
                        <p className="text-sm text-white mt-0.5">
                          {selected.intakeSubmittedAt
                            ? `Submitted ${new Date(selected.intakeSubmittedAt).toLocaleDateString()}`
                            : "Not submitted yet"}
                        </p>
                        {selected.websiteGoals && (
                          <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">&ldquo;{selected.websiteGoals}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Info & Branding */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-brand-light" />
                  <p className="text-sm font-semibold text-white">Client Branding</p>
                </div>

                {/* Brand Colors */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Brand Colors</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Primary</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selected.brandColors?.primary || "#00A5E0"}
                          onChange={(e) => handleUpdateBrandColor("primary", e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer border border-white/10"
                        />
                        <input
                          type="text"
                          value={selected.brandColors?.primary || ""}
                          onChange={(e) => handleUpdateBrandColor("primary", e.target.value)}
                          placeholder="#00A5E0"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Secondary</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selected.brandColors?.secondary || "#0077B6"}
                          onChange={(e) => handleUpdateBrandColor("secondary", e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer border border-white/10"
                        />
                        <input
                          type="text"
                          value={selected.brandColors?.secondary || ""}
                          onChange={(e) => handleUpdateBrandColor("secondary", e.target.value)}
                          placeholder="#0077B6"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Accent</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selected.brandColors?.accent || "#005A8C"}
                          onChange={(e) => handleUpdateBrandColor("accent", e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer border border-white/10"
                        />
                        <input
                          type="text"
                          value={selected.brandColors?.accent || ""}
                          onChange={(e) => handleUpdateBrandColor("accent", e.target.value)}
                          placeholder="#005A8C"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="w-4 h-4 text-brand-light" />
                    <p className="text-xs uppercase tracking-wider text-gray-500">Social Media</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Website</label>
                      <input
                        type="url"
                        value={selected.socialLinks?.website || ""}
                        onChange={(e) => handleUpdateSocialLink("website", e.target.value)}
                        placeholder="https://client-website.com"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Instagram</label>
                      <input
                        type="text"
                        value={selected.socialLinks?.instagram || ""}
                        onChange={(e) => handleUpdateSocialLink("instagram", e.target.value)}
                        placeholder="@username"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Facebook</label>
                      <input
                        type="text"
                        value={selected.socialLinks?.facebook || ""}
                        onChange={(e) => handleUpdateSocialLink("facebook", e.target.value)}
                        placeholder="facebook.com/page"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Twitter/X</label>
                      <input
                        type="text"
                        value={selected.socialLinks?.twitter || ""}
                        onChange={(e) => handleUpdateSocialLink("twitter", e.target.value)}
                        placeholder="@username"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">LinkedIn</label>
                      <input
                        type="text"
                        value={selected.socialLinks?.linkedin || ""}
                        onChange={(e) => handleUpdateSocialLink("linkedin", e.target.value)}
                        placeholder="linkedin.com/company/name"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">YouTube</label>
                      <input
                        type="text"
                        value={selected.socialLinks?.youtube || ""}
                        onChange={(e) => handleUpdateSocialLink("youtube", e.target.value)}
                        placeholder="@channel"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">TikTok</label>
                      <input
                        type="text"
                        value={selected.socialLinks?.tiktok || ""}
                        onChange={(e) => handleUpdateSocialLink("tiktok", e.target.value)}
                        placeholder="@username"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Vault */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-light" />
                    <p className="text-sm font-semibold text-white">Integration Vault</p>
                  </div>
                  <button
                    onClick={exportVaultForClaude}
                    disabled={!selected.integrationVault}
                    className="px-3 py-1.5 rounded-lg bg-brand-dark/20 text-brand-light hover:bg-brand-dark/30 border border-brand-dark/50 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FileDown className="w-4 h-4" />
                    Export for Claude
                  </button>
                </div>

                {selected.integrationVault ? (
                  <div className="space-y-4">
                    {/* Email Provider */}
                    {(selected.integrationVault.emailProvider || selected.integrationVault.emailApiKey || selected.integrationVault.emailFromAddress) && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                          📧 Email Provider
                        </p>
                        <div className="grid gap-2 text-sm">
                          {selected.integrationVault.emailProvider && (
                            <div>
                              <span className="text-gray-500">Provider:</span>{" "}
                              <span className="text-white">{selected.integrationVault.emailProvider}</span>
                            </div>
                          )}
                          {selected.integrationVault.emailApiKey && (
                            <div>
                              <span className="text-gray-500">API Key:</span>{" "}
                              <span className="text-white font-mono">••••••••••••</span>
                            </div>
                          )}
                          {selected.integrationVault.emailFromAddress && (
                            <div>
                              <span className="text-gray-500">From Address:</span>{" "}
                              <span className="text-brand-light">{selected.integrationVault.emailFromAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Analytics */}
                    {(selected.integrationVault.googleAnalyticsId || selected.integrationVault.googleTagManagerId || selected.integrationVault.facebookPixelId) && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                          📊 Analytics
                        </p>
                        <div className="grid gap-2 text-sm">
                          {selected.integrationVault.googleAnalyticsId && (
                            <div>
                              <span className="text-gray-500">Google Analytics:</span>{" "}
                              <span className="text-white font-mono">{selected.integrationVault.googleAnalyticsId}</span>
                            </div>
                          )}
                          {selected.integrationVault.googleTagManagerId && (
                            <div>
                              <span className="text-gray-500">Tag Manager:</span>{" "}
                              <span className="text-white font-mono">{selected.integrationVault.googleTagManagerId}</span>
                            </div>
                          )}
                          {selected.integrationVault.facebookPixelId && (
                            <div>
                              <span className="text-gray-500">Facebook Pixel:</span>{" "}
                              <span className="text-white font-mono">{selected.integrationVault.facebookPixelId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Webhooks */}
                    {(selected.integrationVault.webhookUrl || selected.integrationVault.webhookSecret) && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                          🔗 Webhooks
                        </p>
                        <div className="grid gap-2 text-sm">
                          {selected.integrationVault.webhookUrl && (
                            <div>
                              <span className="text-gray-500">URL:</span>{" "}
                              <span className="text-brand-light break-all">{selected.integrationVault.webhookUrl}</span>
                            </div>
                          )}
                          {selected.integrationVault.webhookSecret && (
                            <div>
                              <span className="text-gray-500">Secret:</span>{" "}
                              <span className="text-white font-mono">••••••••••••</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stripe */}
                    {(selected.integrationVault.stripePublishableKey || selected.integrationVault.stripeSecretKey) && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                          💳 Stripe
                        </p>
                        <div className="grid gap-2 text-sm">
                          {selected.integrationVault.stripePublishableKey && (
                            <div>
                              <span className="text-gray-500">Publishable Key:</span>{" "}
                              <span className="text-white font-mono">pk_••••••••••••</span>
                            </div>
                          )}
                          {selected.integrationVault.stripeSecretKey && (
                            <div>
                              <span className="text-gray-500">Secret Key:</span>{" "}
                              <span className="text-white font-mono">sk_••••••••••••</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Custom API Keys */}
                    {(selected.integrationVault.customApiKey1Label || selected.integrationVault.customApiKey2Label || selected.integrationVault.customApiKey3Label) && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                          🔑 Custom API Keys
                        </p>
                        <div className="grid gap-2 text-sm">
                          {selected.integrationVault.customApiKey1Label && (
                            <div>
                              <span className="text-gray-500">{selected.integrationVault.customApiKey1Label}:</span>{" "}
                              <span className="text-white font-mono">••••••••••••</span>
                            </div>
                          )}
                          {selected.integrationVault.customApiKey2Label && (
                            <div>
                              <span className="text-gray-500">{selected.integrationVault.customApiKey2Label}:</span>{" "}
                              <span className="text-white font-mono">••••••••••••</span>
                            </div>
                          )}
                          {selected.integrationVault.customApiKey3Label && (
                            <div>
                              <span className="text-gray-500">{selected.integrationVault.customApiKey3Label}:</span>{" "}
                              <span className="text-white font-mono">••••••••••••</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selected.integrationVault.notes && (
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                          📝 Integration Notes
                        </p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.integrationVault.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm bg-white/5 rounded-lg border border-white/10">
                    <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p>No integration credentials stored yet.</p>
                    <p className="text-xs mt-1">Client can add credentials in their User Portal.</p>
                  </div>
                )}
              </div>

              {/* Project Files */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-brand-light" />
                    <p className="text-sm font-semibold text-white">Project Files</p>
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50 text-sm font-medium flex items-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {projectFiles && projectFiles.length > 0 ? (
                    projectFiles.map((file: any) => {
                      const isImage = file.fileType.startsWith("image/");
                      const fileSize = (file.fileSize / 1024).toFixed(1); // KB

                      return (
                        <div key={file._id} className="group relative p-3 rounded-lg bg-white/5 border border-white/10 hover:border-brand-light/50 transition-all">
                          {/* Preview */}
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 mb-2">
                            {isImage ? (
                              <img
                                src={file.url}
                                alt={file.fileName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <File className="w-12 h-12 text-gray-500" />
                              </div>
                            )}

                            {/* Delete button overlay */}
                            <button
                              onClick={() => handleDeleteFile(file._id)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* File info */}
                          <div className="space-y-1">
                            <p className="text-xs text-white truncate font-medium" title={file.fileName}>
                              {file.fileName}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{fileSize} KB</span>
                              <a
                                href={file.url}
                                download={file.fileName}
                                className="text-brand-light hover:text-brand-light flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileDown className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-xs text-gray-600">
                              {file.uploadedByName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full p-8 text-center text-gray-500 text-sm border border-dashed border-white/10 rounded-lg">
                      No files yet. Upload images, documents, or assets for this project.
                    </div>
                  )}
                </div>
              </div>

              {/* Project Notes Timeline */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-white">Project Notes</p>
                  <button
                    onClick={exportNotes}
                    disabled={!projectNotes || projectNotes.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FileDown className="w-4 h-4" />
                    Export Notes
                  </button>
                </div>

                {/* Add Note Form */}
                <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none mb-3"
                    placeholder="Type a new note..."
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 rounded-lg bg-brand-light text-white hover:bg-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    Add Note
                  </button>
                </div>

                {/* Notes Timeline */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {projectNotes && projectNotes.length > 0 ? (
                    projectNotes.map((note: any) => (
                      <div key={note._id} className="p-4 rounded-lg bg-white/5 border border-white/10 group">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{new Date(note.createdAt).toLocaleString()}</span>
                              {note.createdBy && (
                                <>
                                  <span className="text-gray-600">•</span>
                                  <span>{note.createdBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap text-sm">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      No notes yet. Add your first note above.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Created</p>
                  <p className="text-sm text-gray-300">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm text-gray-300">
                    {new Date(selected.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Project Status</p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "planning", "design", "development", "review", "completed", "launched"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusChange(selected._id, status)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selected.status === status
                          ? statusColors[status] + " border"
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDelete(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium"
              >
                Delete Project
              </button>
              </div>)}

              {detailTab === "client-view" && (
                <ClientPortalPreview project={selected} />
              )}
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select a project to view details</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Project</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
                  required
                >
                  <option value="">Select project type...</option>
                  <option value="VR Website">VR Website</option>
                  <option value="Standard Website">Standard Website</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Web App">Web App</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 resize-none"
                  placeholder="Brief description of the project..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 resize-none"
                  placeholder="Specific features, pages, functionality needed..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Initial Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-brand-light text-white hover:bg-brand transition-all font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Export Vault Modal */}
      {exportedVault && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-dark/20 border border-brand-dark/50">
                  <Lock className="w-6 h-6 text-brand-light" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Export for Claude</h2>
                  <p className="text-sm text-gray-400">Copy and paste this into your chat with Claude</p>
                </div>
              </div>
              <button
                onClick={() => setExportedVault(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Export Text */}
            <div className="mb-6 p-4 rounded-lg bg-black/50 border border-white/10 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {exportedVault}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={copyExportToClipboard}
                className="flex-1 px-4 py-3 rounded-lg bg-brand text-white hover:bg-brand-dark transition-all font-medium flex items-center justify-center gap-2"
              >
                {copiedExport ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={() => setExportedVault(null)}
                className="px-6 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10 font-medium"
              >
                Close
              </button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-brand-light/10 border border-brand-light/30 text-sm text-brand-light">
              <p className="font-medium mb-1">💡 Pro Tip</p>
              <p className="text-brand-light/80">
                Paste this entire export into Claude to give full project context including all API keys and credentials. Claude will use this to build integrations correctly.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Client Modal */}
      {selected && (
        <EmailReplyModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          recipientEmail={selected.email}
          recipientName={selected.name}
          subject={`Update on Your ${selected.projectType} Project`}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}

// --- Link Request Section - lets admin connect a project to its original wizard submission ---
function LinkRequestSection({ projectId }: { projectId: any }) {
  const requests = useQuery(api.projectRequests.getProjectRequests, {});
  const linkRequest = useMutation(api.projects.linkRequestToProject);
  const [selectedReqId, setSelectedReqId] = useState("");
  const [linking, setLinking] = useState(false);
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="text-xs text-gray-500 hover:text-cyan-400 transition-colors underline"
      >
        Link original project request
      </button>
    );
  }

  const unlinkedRequests = requests?.filter((r: any) => r.status !== "accepted") ?? [];

  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
      <p className="text-xs text-gray-400 font-medium">Link to original project request</p>
      <div className="flex gap-2">
        <select
          value={selectedReqId}
          onChange={(e) => setSelectedReqId(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">Select a request...</option>
          {unlinkedRequests.map((r: any) => (
            <option key={r._id} value={r._id}>
              {r.name} - {r.email} ({new Date(r.createdAt).toLocaleDateString()})
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            if (!selectedReqId) return;
            setLinking(true);
            try {
              await linkRequest({ projectId, requestId: selectedReqId as any });
            } finally {
              setLinking(false);
              setShow(false);
            }
          }}
          disabled={!selectedReqId || linking}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs disabled:opacity-50"
        >
          {linking ? "Linking..." : "Link"}
        </button>
        <button onClick={() => setShow(false)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs">
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- Client Portal Preview (read-only view of what the client sees) ---
function ClientPortalPreview({ project }: { project: any }) {
  const invoiceStatus = project.setupInvoiceStatus ?? "pending";
  const monthlyAmount = project.monthlyAmount ?? 149;
  const setupFee = project.setupFeeAmount ?? 500;

  if (!project.isCustomDeal) {
    return (
      <div className="py-8 text-center text-gray-400 space-y-2">
        <Monitor className="w-8 h-8 mx-auto opacity-30" />
        <p className="text-sm">This project does not have Custom Deal enabled.</p>
        <p className="text-xs text-gray-500">Enable Custom Deal Flow to see the client portal preview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-light/10 border border-brand-light/30 text-xs text-brand-light mb-2">
        <Monitor className="w-4 h-4 flex-shrink-0" />
        <span>This is what <strong>{project.name}</strong> sees when they log into their portal.</span>
      </div>

      {/* Intake Status */}
      {!project.intakeSubmittedAt ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white mb-1">Project Intake Form</p>
          <p className="text-xs text-gray-400 mb-3">Client fills in logo, brand colors, and website goals.</p>
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <Clock className="w-4 h-4" />
            Not submitted yet - client sees the intake form
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
          <div className="flex items-center gap-2 text-sm text-green-400 font-semibold mb-1">
            <CheckCircle className="w-4 h-4" />
            Intake Submitted
          </div>
          <p className="text-xs text-gray-400">
            Submitted {new Date(project.intakeSubmittedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Setup Fee Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <Receipt className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-sm font-semibold text-white">Setup Fee - ${setupFee}</p>
            <p className="text-xs text-gray-400">One-time fee paid via Stripe invoice</p>
          </div>
        </div>
        {invoiceStatus === "pending" && (
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <Clock className="w-4 h-4" />
            Client sees: &ldquo;Invoice coming soon - you will receive an email from Stripe&rdquo;
          </div>
        )}
        {invoiceStatus === "sent" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Receipt className="w-4 h-4" />
              Client sees: &ldquo;Invoice sent - check your email to pay&rdquo;
            </div>
            {project.setupInvoiceUrl && (
              <a href={project.setupInvoiceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-yellow-400 underline">
                <ExternalLink className="w-3 h-3" /> View Invoice
              </a>
            )}
            <div className="text-xs text-gray-500 italic">Client also has a &ldquo;Paid another way?&rdquo; button</div>
          </div>
        )}
        {invoiceStatus === "needs_verification" && (
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <RotateCcw className="w-4 h-4" />
            Client sees: &ldquo;Payment submitted - verifying&rdquo;
          </div>
        )}
        {invoiceStatus === "paid" && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="w-4 h-4" />
            Client sees: &ldquo;Setup fee confirmed - paid&rdquo;
          </div>
        )}
      </div>

      {/* Subscription Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <CreditCard className="w-5 h-5 text-brand-light" />
          <div>
            <p className="text-sm font-semibold text-white">Monthly Plan - ${monthlyAmount}/month</p>
            <p className="text-xs text-gray-400">3-month plan, starts 1st of next month</p>
          </div>
        </div>
        {project.subscriptionStatus === "active" ? (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="w-4 h-4" />
            Client sees: Plan active with billing dates + &ldquo;Manage Billing&rdquo; button
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <AlertCircle className="w-4 h-4" />
            Client sees: How-it-works breakdown + &ldquo;Start Plan&rdquo; button
          </div>
        )}
      </div>
    </div>
  );
}
