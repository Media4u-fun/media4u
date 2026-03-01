/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "@convex/_generated/dataModel";
import {
  Search, Plus, X, Upload, Trash2, Image as ImageIcon, Building2, MapPin, Globe,
  Phone, Mail, Camera, Download, Send, ExternalLink, Copy, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight, Target, TrendingUp, CheckCircle, XCircle, ArrowLeft,
} from "lucide-react";

type LeadStatus = "new" | "researching" | "building" | "presented" | "contacted" | "qualified" | "converted" | "won" | "lost";

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  researching: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  building: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  presented: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  contacted: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  qualified: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  won: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New", researching: "Researching", building: "Building",
  presented: "Presented", contacted: "Contacted", qualified: "Qualified",
  converted: "Converted", won: "Won", lost: "Lost",
};

const INDUSTRIES = [
  "Door Company", "Pool Service", "Barbershop", "Pest Control", "HVAC",
  "Plumbing", "Roofing", "Auto Glass", "Landscaping", "Cleaning Service",
  "Law Firm", "Dental Practice", "Other",
];

const INPUT_CLASS = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm";
const LABEL_CLASS = "text-xs uppercase tracking-wider text-gray-500 mb-1 block font-semibold";

export default function LeadsAdminPage() {
  const leads = useQuery(api.leads.getAllLeads);
  const createLead = useMutation(api.leads.createLead);
  const updateLead = useMutation(api.leads.updateLead);
  const deleteLead = useMutation(api.leads.deleteLead);
  const generateUploadUrl = useMutation(api.leads.generateUploadUrl);
  const sendProposal = useAction(api.websiteFactoryProposals.sendProposalEmail);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const csvImportRef = useRef<HTMLInputElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Id<"_storage">[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  const [proposalData, setProposalData] = useState({ email: "", specSiteUrl: "", proposalPrice: 1500 });
  const [formData, setFormData] = useState({
    name: "", businessName: "", email: "", phone: "",
    location: "", industry: "", website: "", source: "spotted", notes: "",
  });

  // Filter + search
  let filtered = leads;
  if (filterStatus !== "all") filtered = filtered?.filter((l: any) => l.status === filterStatus);
  if (searchQuery.trim() && filtered) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((l: any) =>
      l.name?.toLowerCase().includes(q) ||
      l.businessName?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.industry?.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = leads?.find((l: any) => l._id === selectedId);

  // Stats
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = leads?.filter((l: any) => l.createdAt > weekAgo).length ?? 0;
  const wonCount = leads?.filter((l: any) => l.status === "won").length ?? 0;
  const lostCount = leads?.filter((l: any) => l.status === "lost").length ?? 0;
  const conversionRate = leads?.length ? Math.round((wonCount / leads.length) * 100) : 0;

  async function handleStatusChange(id: Id<"leads">, newStatus: LeadStatus) {
    await updateLead({ id, status: newStatus });
  }

  async function handleDelete() {
    if (!selected) return;
    await deleteLead({ id: selected._id });
    setSelectedId(null);
    setIsDeleteConfirm(false);
  }

  async function handleSendProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (proposalData.email.includes("@example.com")) {
      alert("Please update the email address - it looks like a placeholder.");
      return;
    }
    try {
      setSendingProposal(true);
      if (proposalData.email !== selected.email) {
        await updateLead({ id: selected._id, email: proposalData.email });
      }
      const result = await sendProposal({
        leadId: selected._id,
        specSiteUrl: proposalData.specSiteUrl,
        proposalPrice: proposalData.proposalPrice,
      });
      alert(`Proposal sent!\n\nSignup link: ${result.signupLink}`);
      setIsProposalModalOpen(false);
      setProposalData({ email: "", specSiteUrl: "", proposalPrice: 1500 });
    } catch (error) {
      console.error("Failed to send proposal:", error);
      alert("Failed to send proposal. Check console for details.");
    } finally {
      setSendingProposal(false);
    }
  }

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    await createLead({
      name: formData.name,
      businessName: formData.businessName || formData.name,
      email: formData.email || `lead-${Date.now()}@example.com`,
      phone: formData.phone,
      location: formData.location,
      industry: formData.industry,
      website: formData.website,
      source: formData.source,
      notes: formData.notes,
      photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
    });
    setFormData({ name: "", businessName: "", email: "", phone: "", location: "", industry: "", website: "", source: "spotted", notes: "" });
    setUploadedPhotos([]);
    setIsAddModalOpen(false);
  }

  async function handleEditLead(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    await updateLead({
      id: selected._id,
      name: formData.name,
      businessName: formData.businessName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      industry: formData.industry,
      website: formData.website,
      source: formData.source,
      notes: formData.notes,
    });
    setIsEditModalOpen(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
        const { storageId } = await result.json();
        setUploadedPhotos((prev) => [...prev, storageId as Id<"_storage">]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function buildCSVContent() {
    if (!leads || leads.length === 0) return null;
    const headers = ["Business Name", "Industry", "Location", "Owner Name", "Phone", "Email", "Website", "Status", "Source", "Notes", "Created Date"];
    const rows = leads.map((lead: any) => [
      lead.businessName || lead.name || "",
      lead.industry || "", lead.location || "", lead.name || "",
      lead.phone || "", lead.email || "", lead.website || "",
      lead.status || "", lead.source || "",
      (lead.notes || "").replace(/\n/g, " ").replace(/"/g, '""'),
      new Date(lead.createdAt).toLocaleDateString(),
    ]);
    return [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
  }

  function exportToCSV() {
    const csv = buildCSVContent();
    if (!csv) { alert("No leads to export!"); return; }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  function copyToClipboard() {
    const csv = buildCSVContent();
    if (!csv) { alert("No leads to copy!"); return; }
    navigator.clipboard.writeText(csv).then(() => alert("Leads copied to clipboard!"));
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { alert("CSV must have a header row and at least one data row."); return; }
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
      const col = (name: string) => headers.indexOf(name);
      let created = 0, skipped = 0;
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? [];
        const get = (idx: number) => (cells[idx] ?? "").replace(/^"|"$/g, "").trim();
        const name = get(col("name")) || get(col("contact")) || get(col("owner"));
        const businessName = get(col("business")) || get(col("businessname")) || get(col("business name")) || get(col("company"));
        const email = get(col("email"));
        const phone = get(col("phone"));
        const location = get(col("location")) || get(col("city")) || get(col("address"));
        const industry = get(col("industry")) || get(col("type"));
        if (!name && !businessName) { skipped++; continue; }
        await createLead({ name: name || businessName, businessName: businessName || undefined, email: email || "", phone: phone || undefined, location: location || undefined, industry: industry || undefined, source: "csv_import", notes: "" });
        created++;
      }
      alert(`Import complete: ${created} leads added, ${skipped} rows skipped.`);
    } catch (err) {
      console.error(err);
      alert("Import failed. Make sure your CSV is properly formatted.");
    } finally {
      setIsImporting(false);
      if (csvImportRef.current) csvImportRef.current.value = "";
    }
  }

  const statCards = [
    { label: "Total Leads", value: leads?.length ?? 0, icon: Target, color: "text-brand-light" },
    { label: "New This Week", value: newThisWeek, icon: TrendingUp, color: "text-blue-400" },
    { label: "Won", value: wonCount, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Conversion", value: `${conversionRate}%`, icon: XCircle, color: "text-purple-400" },
  ];

  return (
    <div>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Leads</h1>
        <p className="text-gray-400">Track and manage your prospecting pipeline</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="glass-elevated rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* List Panel */}
        <div className={`w-full lg:w-[380px] lg:flex-shrink-0 ${selectedId ? "hidden lg:block" : "block"}`}>
          <div className="glass-elevated rounded-2xl overflow-hidden flex flex-col">
            {/* List Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-300">
                  {filtered?.length ?? 0} {filterStatus === "all" ? "Total" : STATUS_LABELS[filterStatus]} Leads
                </p>
                <div className="flex gap-1.5">
                  <button onClick={copyToClipboard} title="Copy all" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={exportToCSV} title="Export CSV" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => csvImportRef.current?.click()} disabled={isImporting} title="Import CSV" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 disabled:opacity-50">
                    {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </button>
                  <input ref={csvImportRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                  <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/30 text-xs font-medium transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>

              {/* Status filters */}
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => { setFilterStatus("all"); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === "all" ? "bg-brand-light/20 text-brand-light border border-brand-light/40" : "bg-white/5 text-gray-400 hover:text-white border border-white/10"}`}>
                  All
                </button>
                {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                  <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? STATUS_COLORS[s] + " border" : "bg-white/5 text-gray-400 hover:text-white border border-white/10"}`}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead List */}
            <div className="overflow-y-auto max-h-[calc(100vh-420px)] min-h-[300px]">
              {leads === undefined && (
                <div className="flex items-center justify-center gap-2 p-8 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading...</span>
                </div>
              )}
              {leads === null && (
                <div className="flex flex-col items-center gap-2 p-8 text-center text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="text-sm font-medium">Failed to load leads</p>
                </div>
              )}
              {filtered?.length === 0 && leads !== undefined && (
                <div className="p-8 text-center text-gray-500 text-sm">No leads found.</div>
              )}
              {paginated?.map((lead: any) => (
                <motion.button
                  key={lead._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedId(lead._id)}
                  className={`w-full p-4 text-left border-b border-white/5 transition-all hover:bg-white/5 border-l-4 ${selectedId === lead._id ? "border-l-brand-light bg-white/10" : "border-l-transparent"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-white text-sm truncate">{lead.businessName || lead.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[lead.status as LeadStatus]}`}>
                      {STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                    </span>
                  </div>
                  {lead.industry && <p className="text-xs text-gray-400">{lead.industry}</p>}
                  {lead.location && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{lead.location}
                    </p>
                  )}
                  {lead.photos && lead.photos.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />{lead.photos.length} photo{lead.photos.length > 1 ? "s" : ""}
                    </p>
                  )}
                </motion.button>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
                  <span className="text-xs text-gray-500">
                    {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered?.length ?? 0)} of {filtered?.length ?? 0}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-400 px-2">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className={`flex-1 min-w-0 ${selectedId ? "block" : "hidden lg:block"}`}>
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              {/* Mobile Back */}
              <button onClick={() => setSelectedId(null)} className="lg:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />Back to list
              </button>

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selected.businessName || selected.name}</h2>
                  {selected.industry && (
                    <p className="text-gray-400 flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4" />{selected.industry}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setFormData({ name: selected.name || "", businessName: selected.businessName || "", email: selected.email || "", phone: selected.phone || "", location: selected.location || "", industry: selected.industry || "", website: selected.website || "", source: selected.source || "spotted", notes: selected.notes || "" });
                      setIsEditModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-sm transition-all"
                  >
                    Edit
                  </button>
                  <button onClick={() => setIsDeleteConfirm(true)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={LABEL_CLASS}>Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusChange(selected._id, e.target.value as LeadStatus)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-light/50 text-sm"
                >
                  {(Object.entries(STATUS_LABELS) as [LeadStatus, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Send Proposal Button */}
              {(selected.status === "building" || selected.status === "presented") && (
                <div>
                  <button
                    onClick={() => {
                      const email = selected.emails?.find((e: any) => e.isPrimary)?.address || selected.emails?.[0]?.address || selected.email;
                      setProposalData((prev) => ({ ...prev, email: email || "" }));
                      setIsProposalModalOpen(true);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {selected.proposalSentAt ? "Resend Proposal" : "Send Proposal Email"}
                  </button>
                  {selected.proposalSentAt && (
                    <p className="text-xs text-gray-500 mt-2 text-center">Last sent: {new Date(selected.proposalSentAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {/* Website */}
              {selected.website && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-orange-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Live Website</p>
                      <p className="text-xs text-gray-500 break-all mt-0.5">{selected.website.replace(/^https?:\/\//, "")}</p>
                    </div>
                    <a href={selected.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-orange-500 text-white rounded-lg text-xs font-semibold flex-shrink-0">
                      <ExternalLink className="w-3 h-3" />View
                    </a>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                {selected.email && !selected.email.includes("@example.com") && (
                  <div>
                    <p className={LABEL_CLASS}>Email</p>
                    <a href={`mailto:${selected.email}`} className="text-brand-light hover:underline text-sm break-all">
                      {selected.email}
                    </a>
                  </div>
                )}
                {selected.phone && (
                  <div>
                    <p className={LABEL_CLASS}>Phone</p>
                    <a href={`tel:${selected.phone}`} className="text-white hover:text-brand-light text-sm flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />{selected.phone}
                    </a>
                  </div>
                )}
                {selected.location && (
                  <div>
                    <p className={LABEL_CLASS}>Location</p>
                    <p className="text-white text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />{selected.location}
                    </p>
                  </div>
                )}
                {selected.source && (
                  <div>
                    <p className={LABEL_CLASS}>Source</p>
                    <p className="text-white text-sm capitalize">{selected.source.replace(/_/g, " ")}</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {selected.email && !selected.email.includes("@example.com") && (
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-all">
                    <Mail className="w-3.5 h-3.5" />Email
                  </a>
                )}
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-all">
                    <Phone className="w-3.5 h-3.5" />Call
                  </a>
                )}
                <button
                  onClick={() => {
                    const row = `"${selected.businessName || selected.name}","${selected.industry || ""}","${selected.location || ""}","${selected.email || ""}","${selected.phone || ""}","${selected.status}"`;
                    navigator.clipboard.writeText(row).then(() => alert("Lead copied!"));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />Copy Lead
                </button>
              </div>

              {/* Photos */}
              {selected.photos && selected.photos.length > 0 && (
                <div>
                  <p className={LABEL_CLASS}>Photos</p>
                  <div className="grid grid-cols-3 gap-3">
                    {selected.photos.map((photoId: Id<"_storage">, index: number) => (
                      <LeadPhoto key={index} storageId={photoId} />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p className={LABEL_CLASS}>Notes</p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap break-words bg-white/5 rounded-lg p-3 border border-white/10">{selected.notes}</p>
                </div>
              )}

              {/* Dates */}
              <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-gray-600">
                <span>Added {new Date(selected.createdAt).toLocaleDateString()}</span>
                {selected.proposalSentAt && <span>Proposal sent {new Date(selected.proposalSentAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center h-full flex items-center justify-center">
              <div>
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-700 opacity-50" />
                <p className="text-gray-400">Select a lead to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {isDeleteConfirm && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-elevated rounded-2xl p-6 w-full max-w-sm mx-4 border border-red-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Lead?</h3>
              <p className="text-sm text-gray-400 mb-4">{selected.businessName || selected.name} will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteConfirm(false)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 text-sm flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-2xl border border-white/10 p-6 w-full max-w-lg my-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Lead</h2>
                <button onClick={() => { setIsAddModalOpen(false); setUploadedPhotos([]); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddLead} className="space-y-4">
                {/* Photos */}
                <div>
                  <label className={LABEL_CLASS}>Photos (optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center hover:border-brand-light/50 transition-all bg-white/5">
                      <Camera className="w-5 h-5 text-gray-500 mb-1" /><span className="text-gray-400 text-xs">Take Photo</span>
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center hover:border-brand-light/50 transition-all bg-white/5">
                      <Upload className="w-5 h-5 text-gray-500 mb-1" /><span className="text-gray-400 text-xs">Choose File</span>
                    </button>
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" disabled={uploading || uploadedPhotos.length >= 5} />
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploading || uploadedPhotos.length >= 5} />
                  </div>
                  {uploading && <p className="text-xs text-gray-500 mt-2">Uploading...</p>}
                  {uploadedPhotos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {uploadedPhotos.map((photoId, index) => (
                        <div key={index} className="relative">
                          <LeadPhoto storageId={photoId} />
                          <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-500 rounded-full p-1">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div><label className={LABEL_CLASS}>Business Name *</label>
                  <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className={INPUT_CLASS} required /></div>
                <div><label className={LABEL_CLASS}>Industry *</label>
                  <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className={INPUT_CLASS} required>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select></div>
                <div><label className={LABEL_CLASS}>Location (City, State) *</label>
                  <input type="text" placeholder="Phoenix, AZ" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={INPUT_CLASS} required /></div>
                <div><label className={LABEL_CLASS}>Owner Name</label>
                  <input type="text" placeholder="John Smith" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Email</label>
                  <input type="email" placeholder="info@business.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Phone</label>
                  <input type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className={INPUT_CLASS} placeholder="Where you found them, etc." /></div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setIsAddModalOpen(false); setUploadedPhotos([]); }} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 text-sm transition-all">Cancel</button>
                  <button type="submit" disabled={uploading} className="flex-1 px-4 py-2.5 bg-brand-light/20 hover:bg-brand-light/30 text-brand-light rounded-lg border border-brand-light/30 text-sm font-medium disabled:opacity-50 transition-all">
                    {uploading ? "Uploading..." : "Add Lead"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Lead Modal */}
      <AnimatePresence>
        {isEditModalOpen && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-2xl border border-white/10 p-6 w-full max-w-lg my-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Lead</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditLead} className="space-y-4">
                <div><label className={LABEL_CLASS}>Business Name *</label>
                  <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className={INPUT_CLASS} required /></div>
                <div><label className={LABEL_CLASS}>Industry *</label>
                  <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className={INPUT_CLASS} required>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select></div>
                <div><label className={LABEL_CLASS}>Location (City, State) *</label>
                  <input type="text" placeholder="Phoenix, AZ" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={INPUT_CLASS} required /></div>
                <div><label className={LABEL_CLASS}>Owner Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={INPUT_CLASS} />
                  {formData.email.includes("@example.com") && <p className="text-xs text-red-400 mt-1">Placeholder email - please update</p>}</div>
                <div><label className={LABEL_CLASS}>Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Website URL</label>
                  <input type="url" placeholder="https://business.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className={INPUT_CLASS} />
                  <p className="text-xs text-gray-600 mt-1">Paste Vercel URL here after building the spec site</p></div>
                <div><label className={LABEL_CLASS}>Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className={INPUT_CLASS} /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 text-sm transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-brand-light/20 hover:bg-brand-light/30 text-brand-light rounded-lg border border-brand-light/30 text-sm font-medium transition-all">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Proposal Modal */}
      <AnimatePresence>
        {isProposalModalOpen && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-2xl border border-white/10 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Send Proposal</h2>
                <button onClick={() => setIsProposalModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSendProposal} className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Sending to:</p>
                  <p className="text-white font-semibold text-sm">{selected.businessName || selected.name}</p>
                </div>
                <div><label className={LABEL_CLASS}>Email Address *</label>
                  <input type="email" required value={proposalData.email} onChange={(e) => setProposalData({ ...proposalData, email: e.target.value })} className={INPUT_CLASS} placeholder="info@business.com" />
                  {proposalData.email.includes("@example.com") && <p className="text-xs text-red-400 mt-1">Placeholder email - please update</p>}</div>
                <div><label className={LABEL_CLASS}>Spec Site URL *</label>
                  <input type="url" required value={proposalData.specSiteUrl} onChange={(e) => setProposalData({ ...proposalData, specSiteUrl: e.target.value })} className={INPUT_CLASS} placeholder="https://their-site.vercel.app" />
                  <p className="text-xs text-gray-600 mt-1">The live preview URL they will see</p></div>
                <div><label className={LABEL_CLASS}>Proposal Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" required min="0" step="100" value={proposalData.proposalPrice} onChange={(e) => setProposalData({ ...proposalData, proposalPrice: parseInt(e.target.value) })} className={INPUT_CLASS + " pl-7"} />
                  </div></div>
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Email includes:</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>Live preview button - Pricing ${proposalData.proposalPrice?.toLocaleString()} - Signup link - Professional branding</li>
                  </ul>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsProposalModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 text-sm transition-all">Cancel</button>
                  <button type="submit" disabled={sendingProposal} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {sendingProposal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sendingProposal ? "Sending..." : "Send Proposal"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadPhoto({ storageId }: { storageId: Id<"_storage"> }) {
  const photoUrl = useQuery(api.leads.getPhotoUrl, { storageId });
  if (!photoUrl) {
    return (
      <div className="w-full aspect-square bg-white/5 rounded-lg animate-pulse flex items-center justify-center border border-white/10">
        <ImageIcon className="w-6 h-6 text-gray-600" />
      </div>
    );
  }
  return <img src={photoUrl} alt="Lead photo" className="w-full aspect-square object-cover rounded-lg border border-white/10" />;
}
