/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Search, Plus, X, Upload, Trash2, Image as ImageIcon, Building2, MapPin, Globe, Phone, Mail } from "lucide-react";

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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Id<"_storage">[]>([]);
  const [uploading, setUploading] = useState(false);

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

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();

    await createLead({
      name: formData.name,
      businessName: formData.businessName || formData.name,
      email: formData.email || `lead-${Date.now()}@example.com`, // Auto-generate if missing
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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
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

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-neutral-950">
      {/* Master List */}
      <div className="w-1/3 border-r border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Website Factory Leads</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-brand-dark hover:bg-brand-dark/80 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-dark"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filterStatus === "all"
                  ? "bg-brand-dark text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("new")}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filterStatus === "new"
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilterStatus("building")}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filterStatus === "building"
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Building
            </button>
            <button
              onClick={() => setFilterStatus("won")}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filterStatus === "won"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Won
            </button>
          </div>
        </div>

        {/* Lead List */}
        <div className="flex-1 overflow-y-auto">
          {filtered && filtered.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No leads found. Add your first lead!
            </div>
          )}
          {filtered?.map((lead: any) => (
            <motion.div
              key={lead._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedId(lead._id)}
              className={`p-4 border-b border-neutral-800 cursor-pointer transition-all hover:bg-neutral-900/50 ${
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
                <span className={`px-2 py-1 rounded text-xs border ${statusColors[lead.status as LeadStatus]}`}>
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
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selected.businessName || selected.name}</h2>
                {selected.industry && (
                  <p className="text-neutral-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {selected.industry}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="mb-6">
              <label className="text-sm text-neutral-400 mb-2 block">Status</label>
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(selected._id, e.target.value as LeadStatus)}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-brand-dark"
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

            {/* Contact Info */}
            <div className="bg-neutral-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                {selected.email && (
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <a href={`mailto:${selected.email}`} className="hover:text-brand-light">
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
                {selected.website && (
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Globe className="w-4 h-4 text-neutral-500" />
                    <a href={selected.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-light">
                      {selected.website}
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
              <div className="bg-neutral-900 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selected.photos.map((photoId: Id<"_storage">, index: number) => (
                    <LeadPhoto key={index} storageId={photoId} />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-neutral-900 rounded-lg p-6">
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

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Lead</h2>
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
              {/* Photos Upload */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Photos (truck, storefront, business card)</label>
                <label className="border-2 border-dashed border-neutral-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-dark transition-all">
                  <Upload className="w-8 h-8 text-neutral-500 mb-2" />
                  <span className="text-neutral-400 text-sm">Click to upload photos (up to 5)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading || uploadedPhotos.length >= 5}
                  />
                </label>
                {uploading && <p className="text-sm text-neutral-500 mt-2">Uploading...</p>}
                {uploadedPhotos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photoId, index) => (
                      <div key={index} className="relative group">
                        <LeadPhoto storageId={photoId} />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
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
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
                  required
                />
              </div>

              {/* Industry */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
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
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                  required
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Owner Name (optional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark"
                />
              </div>

              {/* Website */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Current Website (optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-brand-dark"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-brand-dark resize-none"
                  placeholder="Any additional info (where you found them, services offered, etc.)"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setUploadedPhotos([]);
                  }}
                  className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-brand-dark hover:bg-brand-dark/80 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Add Lead"}
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
