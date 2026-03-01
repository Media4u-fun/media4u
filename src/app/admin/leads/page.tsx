/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Search, Plus, X, Upload, Trash2, Image as ImageIcon, Building2, MapPin, Globe, Phone, Mail, Camera, Download, Send, ExternalLink, Copy, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAction } from "convex/react";

type LeadStatus = "new" | "researching" | "building" | "presented" | "contacted" | "qualified" | "converted" | "won" | "lost";

const statusColors: Record<LeadStatus, string> = {
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

const INDUSTRIES = [
  "Door Company",
  "Pool Service",
  "Barbershop",
  "Pest Control",
  "HVAC",
  "Plumbing",
  "Roofing",
  "Auto Glass",
  "Landscaping",
  "Cleaning Service",
  "Law Firm",
  "Dental Practice",
  "Other",
];

export default function LeadsAdminPage() {
  const leads = useQuery(api.leads.getAllLeads);
  const createLead = useMutation(api.leads.createLead);
  const updateLead = useMutation(api.leads.updateLead);
  const deleteLead = useMutation(api.leads.deleteLead);
  const generateUploadUrl = useMutation(api.leads.generateUploadUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Id<"_storage">[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [proposalData, setProposalData] = useState({
    email: "",
    specSiteUrl: "",
    proposalPrice: 1500,
  });

  const sendProposal = useAction(api.websiteFactoryProposals.sendProposalEmail);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;
  const [isImporting, setIsImporting] = useState(false);
  const csvImportRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    industry: "",
    website: "",
    source: "spotted",
    notes: "",
  });

  // Filter and search
  let filtered = leads;
  if (filterStatus !== "all") {
    filtered = filtered?.filter((l: any) => l.status === filterStatus);
  }
  if (searchQuery.trim() && filtered) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((l: any) =>
      l.name?.toLowerCase().includes(query) ||
      l.businessName?.toLowerCase().includes(query) ||
      l.email?.toLowerCase().includes(query) ||
      l.location?.toLowerCase().includes(query) ||
      l.industry?.toLowerCase().includes(query)
    );
  }

  // Reset to page 1 when filter/search changes (done via useMemo side-effect pattern)
  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selected = leads?.find((l: any) => l._id === selectedId);

  async function handleStatusChange(id: Id<"leads">, newStatus: LeadStatus) {
    await updateLead({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"leads">) {
    if (confirm("Delete this lead? This cannot be undone.")) {
      await deleteLead({ id });
      setSelectedId(null);
    }
  }

  async function handleSendProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    // Validate email
    if (proposalData.email.includes('@example.com')) {
      alert("Please update the email address - it looks like a placeholder.");
      return;
    }

    try {
      setSendingProposal(true);

      // Update lead email if it changed
      if (proposalData.email !== selected.email) {
        await updateLead({
          id: selected._id,
          email: proposalData.email,
        });
      }

      const result = await sendProposal({
        leadId: selected._id,
        specSiteUrl: proposalData.specSiteUrl,
        proposalPrice: proposalData.proposalPrice,
      });

      alert(`Proposal sent to ${proposalData.email}!\n\nSignup link: ${result.signupLink}`);
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

    // Reset form
    setFormData({
      name: "",
      businessName: "",
      email: "",
      phone: "",
      location: "",
      industry: "",
      website: "",
      source: "spotted",
      notes: "",
    });
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
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
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
    if (!leads || leads.length === 0) {
      return null;
    }

    // CSV headers
    const headers = [
      "Business Name",
      "Industry",
      "Location",
      "Owner Name",
      "Phone",
      "Email",
      "Website",
      "Status",
      "Photos Count",
      "Source",
      "Notes",
      "Created Date",
    ];

    // Convert leads to CSV rows
    const rows = leads.map((lead: any) => [
      lead.businessName || lead.name || "",
      lead.industry || "",
      lead.location || "",
      lead.name || "",
      lead.phone || "",
      lead.email || "",
      lead.website || "",
      lead.status || "",
      lead.photos?.length || 0,
      lead.source || "",
      (lead.notes || "").replace(/\n/g, " ").replace(/"/g, '""'), // Escape quotes and newlines
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    // Build CSV content
    return [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");
  }

  function copyToClipboard() {
    const csvContent = buildCSVContent();
    if (!csvContent) {
      alert("No leads to copy!");
      return;
    }

    navigator.clipboard.writeText(csvContent)
      .then(() => {
        alert("✅ Leads copied to clipboard! You can now paste them anywhere.");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy. Please try again.");
      });
  }

  function exportToCSV() {
    const csvContent = buildCSVContent();
    if (!csvContent) {
      alert("No leads to export!");
      return;
    }

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { alert("CSV must have a header row and at least one data row."); return; }

      // Parse header to find column indices (case-insensitive)
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
      const col = (name: string) => headers.indexOf(name);

      let created = 0;
      let skipped = 0;

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

        await createLead({
          name: name || businessName,
          businessName: businessName || undefined,
          email: email || "",
          phone: phone || undefined,
          location: location || undefined,
          industry: industry || undefined,
          source: "csv_import",
          notes: "",
        });
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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-neutral-950">
      {/* Master List */}
      <div className={`w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl lg:text-2xl font-bold">Leads</h1>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 lg:px-4 lg:py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm lg:text-base"
                title="Copy all leads to clipboard"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy All</span>
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 py-2 lg:px-4 lg:py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm lg:text-base"
                title="Download leads as CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => csvImportRef.current?.click()}
                disabled={isImporting}
                className="px-3 py-2 lg:px-4 lg:py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm lg:text-base disabled:opacity-50"
                title="Import leads from CSV"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">Import</span>
              </button>
              <input ref={csvImportRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-2 lg:px-4 lg:py-2 bg-brand-dark hover:bg-brand-dark/80 text-white rounded-lg flex items-center gap-2 transition-all text-sm lg:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Lead</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 lg:py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-dark"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "all"
                  ? "bg-brand-dark text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("new")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "new"
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilterStatus("researching")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "researching"
                  ? "bg-purple-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Researching
            </button>
            <button
              onClick={() => setFilterStatus("building")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "building"
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Building
            </button>
            <button
              onClick={() => setFilterStatus("presented")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "presented"
                  ? "bg-yellow-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Presented
            </button>
            <button
              onClick={() => setFilterStatus("contacted")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "contacted"
                  ? "bg-cyan-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => setFilterStatus("qualified")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "qualified"
                  ? "bg-indigo-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Qualified
            </button>
            <button
              onClick={() => setFilterStatus("converted")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "converted"
                  ? "bg-green-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Converted
            </button>
            <button
              onClick={() => setFilterStatus("won")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "won"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Won
            </button>
            <button
              onClick={() => setFilterStatus("lost")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filterStatus === "lost"
                  ? "bg-red-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Lost
            </button>
          </div>
        </div>

        {/* Lead List */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {leads === undefined && (
            <div className="flex items-center justify-center gap-3 p-8 text-neutral-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading leads...</span>
            </div>
          )}
          {/* Error state */}
          {leads === null && (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <p className="text-sm font-medium">Failed to load leads</p>
              <p className="text-xs text-neutral-500">Check your connection and refresh</p>
            </div>
          )}
          {/* Empty state */}
          {leads !== undefined && leads !== null && filtered && filtered.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No leads found. Add your first lead!
            </div>
          )}
          {paginated?.map((lead: any) => (
            <motion.div
              key={lead._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedId(lead._id)}
              className={`p-4 border-b border-neutral-800 cursor-pointer transition-all hover:bg-neutral-900/50 active:bg-neutral-900 ${
                selectedId === lead._id ? "bg-neutral-900 border-l-4 border-l-brand-dark" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{lead.businessName || lead.name}</h3>
                  {lead.industry && (
                    <p className="text-sm text-neutral-400 mt-1">{lead.industry}</p>
                  )}
                  {lead.location && (
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lead.location}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs border whitespace-nowrap ${statusColors[lead.status as LeadStatus]}`}>
                  {lead.status}
                </span>
              </div>
              {lead.photos && lead.photos.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-2">
                  <ImageIcon className="w-3 h-3" />
                  {lead.photos.length} photo{lead.photos.length > 1 ? "s" : ""}
                </div>
              )}
            </motion.div>
          ))}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800 bg-neutral-950">
              <span className="text-xs text-neutral-500">
                {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered?.length ?? 0)} of {filtered?.length ?? 0}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-neutral-400 px-2">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className={`flex-1 overflow-y-auto p-4 lg:p-6 ${selectedId ? 'block' : 'hidden lg:block'}`}>
        {selected ? (
          <div>
            {/* Mobile Back Button */}
            <button
              onClick={() => setSelectedId(null)}
              className="lg:hidden mb-4 px-4 py-2 bg-neutral-800 text-white rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Back to List
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{selected.businessName || selected.name}</h2>
                {selected.industry && (
                  <p className="text-neutral-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {selected.industry}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Pre-fill edit form with current data
                    setFormData({
                      name: selected.name || "",
                      businessName: selected.businessName || "",
                      email: selected.email || "",
                      phone: selected.phone || "",
                      location: selected.location || "",
                      industry: selected.industry || "",
                      website: selected.website || "",
                      source: selected.source || "spotted",
                      notes: selected.notes || "",
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="px-3 py-2 lg:px-4 lg:py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden lg:inline">Edit</span>
                </button>
                <button
                  onClick={() => {
                    const leadData = `Business Name,Industry,Location,Owner Name,Phone,Email,Website,Status,Photos Count,Source,Notes,Created Date
"${selected.businessName || selected.name || ""}","${selected.industry || ""}","${selected.location || ""}","${selected.name || ""}","${selected.phone || ""}","${selected.email || ""}","${selected.website || ""}","${selected.status || ""}","${selected.photos?.length || 0}","${selected.source || ""}","${(selected.notes || "").replace(/\n/g, " ").replace(/"/g, '""')}","${new Date(selected.createdAt).toLocaleDateString()}"`;

                    navigator.clipboard.writeText(leadData)
                      .then(() => {
                        alert(`✅ ${selected.businessName || selected.name} copied to clipboard!`);
                      })
                      .catch((err) => {
                        console.error("Failed to copy:", err);
                        alert("Failed to copy. Please try again.");
                      });
                  }}
                  className="px-3 py-2 lg:px-4 lg:py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all flex items-center gap-2"
                  title="Copy this lead"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden lg:inline">Copy</span>
                </button>
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="px-3 py-2 lg:px-4 lg:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="mb-6">
              <label className="text-sm text-neutral-400 mb-2 block">Status</label>
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(selected._id, e.target.value as LeadStatus)}
                className="w-full px-4 py-3 lg:py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-brand-dark"
              >
                <option value="new">New</option>
                <option value="researching">Researching</option>
                <option value="building">Building Site</option>
                <option value="presented">Presented</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won 🎉</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Send Proposal Button - for leads in "building" or later status */}
            {(selected.status === "building" || selected.status === "presented") && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    // Pre-fill email when opening modal
                    const detectedEmail = selected.emails?.find((e: any) => e.isPrimary)?.address
                      || selected.emails?.[0]?.address
                      || selected.email;
                    setProposalData(prev => ({ ...prev, email: detectedEmail || "" }));
                    setIsProposalModalOpen(true);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-5 h-5" />
                  {selected.proposalSentAt ? "Resend Proposal" : "Send Proposal Email"}
                </button>
                {selected.proposalSentAt && (
                  <p className="text-xs text-neutral-500 mt-2 text-center">
                    Last sent: {new Date(selected.proposalSentAt).toLocaleDateString()}
                  </p>
                )}
                {selected.specSiteUrl && (
                  <a
                    href={selected.specSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-purple-400 hover:text-purple-300 mt-2 flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Spec Site
                  </a>
                )}
              </div>
            )}

            {/* Website Box - Special highlight for built website */}
            {selected.website && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-cyan-500/10 to-orange-500/10 border-2 border-cyan-500/30 rounded-xl p-5 lg:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">Live Website</h3>
                      <p className="text-sm text-neutral-400 mb-3">Their built website is live and ready</p>
                      <a
                        href={selected.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Website
                      </a>
                      <p className="text-xs text-neutral-500 mt-3 break-all">{selected.website}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-neutral-900 rounded-lg p-4 lg:p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                {selected.email && (
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <a href={`mailto:${selected.email}`} className="hover:text-brand-light break-all">
                      {selected.email}
                    </a>
                  </div>
                )}
                {selected.phone && (
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <a href={`tel:${selected.phone}`} className="hover:text-brand-light">
                      {selected.phone}
                    </a>
                  </div>
                )}
                {selected.location && (
                  <div className="flex items-center gap-3 text-neutral-300">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    {selected.location}
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {selected.photos && selected.photos.length > 0 && (
              <div className="bg-neutral-900 rounded-lg p-4 lg:p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selected.photos.map((photoId: Id<"_storage">, index: number) => (
                    <LeadPhoto key={index} storageId={photoId} />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-neutral-900 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <p className="text-neutral-300 whitespace-pre-wrap">{selected.notes || "No notes added."}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a lead to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button (Mobile) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-dark hover:bg-brand-dark/80 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start lg:items-center justify-center z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 rounded-t-2xl lg:rounded-xl border-t lg:border border-neutral-800 p-4 lg:p-6 w-full lg:max-w-2xl mt-auto lg:mt-0 max-h-[95vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white">Add New Lead</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setUploadedPhotos([]);
                }}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              {/* Photo Upload Buttons */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Photos</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Button (Mobile) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 rounded-lg p-4 flex flex-col items-center justify-center hover:border-brand-dark transition-all bg-neutral-800/50"
                  >
                    <Camera className="w-6 h-6 text-neutral-500 mb-2" />
                    <span className="text-neutral-400 text-sm text-center">Take Photo</span>
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading || uploadedPhotos.length >= 5}
                  />

                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 rounded-lg p-4 flex flex-col items-center justify-center hover:border-brand-dark transition-all bg-neutral-800/50"
                  >
                    <Upload className="w-6 h-6 text-neutral-500 mb-2" />
                    <span className="text-neutral-400 text-sm text-center">Choose File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading || uploadedPhotos.length >= 5}
                  />
                </div>

                {uploading && <p className="text-sm text-neutral-500 mt-2">Uploading...</p>}
                {uploadedPhotos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photoId, index) => (
                      <div key={index} className="relative group">
                        <LeadPhoto storageId={photoId} />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-1.5 shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base focus:outline-none focus:border-brand-dark"
                  required
                  autoComplete="organization"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base focus:outline-none focus:border-brand-dark"
                  required
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Location (City, State) *</label>
                <input
                  type="text"
                  placeholder="Phoenix, AZ"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  required
                  autoComplete="address-level2"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Owner Name (optional)</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Email (optional)</label>
                <input
                  type="email"
                  placeholder="info@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  autoComplete="email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  autoComplete="tel"
                />
              </div>

              {/* Website */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Website (optional)</label>
                <input
                  type="url"
                  placeholder="https://business.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  autoComplete="url"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Quick Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base focus:outline-none focus:border-brand-dark resize-none"
                  placeholder="Where you found them, services seen on truck, etc."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-neutral-900 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setUploadedPhotos([]);
                  }}
                  className="flex-1 px-4 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-4 bg-brand-dark hover:bg-brand-dark/80 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                >
                  {uploading ? "Uploading..." : "Add Lead"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Send Proposal Modal */}
      {isProposalModalOpen && selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Send Proposal</h2>
              <button
                onClick={() => setIsProposalModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-4">
              {/* Business Info */}
              <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-neutral-400 mb-1">Sending to:</p>
                <p className="text-white font-semibold">{selected.businessName || selected.name}</p>
              </div>

              {/* Email Address (Editable) */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Email Address *</label>
                <input
                  type="email"
                  required
                  value={proposalData.email}
                  onChange={(e) => setProposalData({ ...proposalData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
                  placeholder="info@justdoorsinc.com"
                />
                {proposalData.email.includes('@example.com') && (
                  <p className="text-xs text-red-400 mt-1">⚠️ This looks like a placeholder email - please update it</p>
                )}
              </div>

              {/* Spec Site URL */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Spec Site URL *</label>
                <input
                  type="url"
                  required
                  value={proposalData.specSiteUrl}
                  onChange={(e) => setProposalData({ ...proposalData, specSiteUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
                  placeholder="https://just-doors-inc.vercel.app"
                />
                <p className="text-xs text-neutral-500 mt-1">The live preview URL they&apos;ll see</p>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Proposal Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={proposalData.proposalPrice}
                    onChange={(e) => setProposalData({ ...proposalData, proposalPrice: parseInt(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">One-time payment amount</p>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-2">Email will include:</p>
                <ul className="text-sm text-neutral-300 space-y-1">
                  <li>✨ Live preview button</li>
                  <li>💰 Pricing card (${proposalData.proposalPrice?.toLocaleString()})</li>
                  <li>🔗 Signup link to claim site</li>
                  <li>📧 Professional Media4U branding</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingProposal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {sendingProposal ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Proposal
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {isEditModalOpen && selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start lg:items-center justify-center z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 rounded-t-2xl lg:rounded-xl border-t lg:border border-neutral-800 p-4 lg:p-6 w-full lg:max-w-2xl mt-auto lg:mt-0 max-h-[95vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white">Edit Lead</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditLead} className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base focus:outline-none focus:border-brand-dark"
                  required
                />
              </div>

              {/* Industry */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base focus:outline-none focus:border-brand-dark"
                  required
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Location (City, State) *</label>
                <input
                  type="text"
                  placeholder="Phoenix, AZ"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  required
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Owner Name</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="info@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                />
                {formData.email.includes('@example.com') && (
                  <p className="text-xs text-red-400 mt-1">⚠️ This looks like a placeholder email</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Phone</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                />
              </div>

              {/* Website */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Website URL</label>
                <input
                  type="url"
                  placeholder="https://business.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                />
                <p className="text-xs text-neutral-500 mt-1">Paste the Vercel deployment URL here after building the site</p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-base focus:outline-none focus:border-brand-dark resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-neutral-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-base font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Component to display lead photos
function LeadPhoto({ storageId }: { storageId: Id<"_storage"> }) {
  const photoUrl = useQuery(api.leads.getPhotoUrl, { storageId });

  if (!photoUrl) {
    return (
      <div className="w-full aspect-square bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-neutral-600" />
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt="Lead photo"
      className="w-full aspect-square object-cover rounded-lg border border-neutral-800"
    />
  );
}
