/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Search, Mail, Plus, X, Briefcase } from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

export default function LeadsAdminPage() {
  const leads = useQuery(api.leads.getAllLeads);
  const createLead = useMutation(api.leads.createLead);
  const updateLead = useMutation(api.leads.updateLead);
  const deleteLead = useMutation(api.leads.deleteLead);
  const updateLastContacted = useMutation(api.leads.updateLastContacted);
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);
  const createProjectFromLead = useMutation(api.projects.createProjectFromLead);
  const subscribeToNewsletter = useMutation(api.newsletter.subscribeToNewsletter);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Add Lead Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    source: "",
    notes: "",
  });

  // Convert to Project Form State
  const [convertData, setConvertData] = useState({
    projectType: "",
    description: "",
    requirements: "",
    budget: "",
    timeline: "",
  });

  // Filter by status first, then search
  let filtered = leads;

  if (filterStatus !== "all" && filtered) {
    filtered = filtered.filter((l: any) => l.status === filterStatus);
  }

  if (searchQuery.trim() && filtered) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((l: any) =>
      l.name.toLowerCase().includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.company?.toLowerCase().includes(query)
    );
  }

  const selected = leads?.find((l: any) => l._id === selectedId);

  async function handleStatusChange(id: Id<"leads">, newStatus: LeadStatus) {
    await updateLead({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"leads">) {
    if (confirm("Delete this lead?")) {
      await deleteLead({ id });
      setSelectedId(null);
    }
  }

  async function handleSendReply(message: string) {
    if (!selected) return;

    await sendEmailReply({
      to: selected.email,
      subject: "Following up - Media4U",
      message,
      recipientName: selected.name,
    });

    // Mark as contacted and update timestamp
    await updateLastContacted({ id: selected._id });
  }

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.source) {
      alert("Please fill in Name, Email, and Source");
      return;
    }

    await createLead({
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      phone: formData.phone || undefined,
      source: formData.source,
      notes: formData.notes,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      source: "",
      notes: "",
    });
    setIsAddModalOpen(false);
  }

  async function handleAddToNewsletter() {
    if (!selected) return;
    setSubscribing(true);
    try {
      const result = await subscribeToNewsletter({ email: selected.email });
      if (result.success) {
        if (result.newSubscription) {
          alert("Email added to newsletter subscribers!");
        } else {
          alert("Email was already subscribed to newsletter.");
        }
      } else {
        alert(result.error || "Failed to subscribe email");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to add email to newsletter");
    } finally {
      setSubscribing(false);
    }
  }

  async function handleConvertToProject(e: React.FormEvent) {
    e.preventDefault();

    if (!selected || !convertData.projectType || !convertData.description) {
      alert("Please fill in Project Type and Description");
      return;
    }

    await createProjectFromLead({
      leadId: selected._id,
      projectType: convertData.projectType,
      description: convertData.description,
      requirements: convertData.requirements || undefined,
      budget: convertData.budget || undefined,
      timeline: convertData.timeline || undefined,
    });

    // Reset form and close modal
    setConvertData({
      projectType: "",
      description: "",
      requirements: "",
      budget: "",
      timeline: "",
    });
    setIsConvertModalOpen(false);
    alert("Lead converted to project successfully!");
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Lead Management</h1>
        <p className="text-gray-400 mb-6">Track and manage potential customers</p>

        {/* Big centered Add Lead button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all flex items-center gap-3 font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
          >
            <Plus className="w-7 h-7" />
            Add Lead
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {(["all", "new", "contacted", "qualified", "converted", "lost"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filterStatus === status
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : statusLabels[status]}
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
                {filtered?.length || 0} Leads
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
              {filtered?.map((lead: any) => (
                <motion.button
                  key={lead._id}
                  onClick={() => setSelectedId(lead._id)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === lead._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">{lead.name}</p>
                  <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                  {lead.company && (
                    <p className="text-xs text-gray-500 truncate mt-1">{lead.company}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[lead.status as LeadStatus]}`}
                    >
                      {statusLabels[lead.status as LeadStatus]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
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
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                <p className="text-xl font-semibold text-white">{selected.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <a href={`mailto:${selected.email}`} className="text-cyan-400 hover:text-cyan-300">
                    {selected.email}
                  </a>
                  <button
                    onClick={() => setIsReplyModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors border border-cyan-500/50 text-xs font-medium flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </button>
                  <button
                    onClick={handleAddToNewsletter}
                    disabled={subscribing}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors border border-purple-500/50 text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-3 h-3" />
                    {subscribing ? "Adding..." : "Add to Newsletter"}
                  </button>
                  {selected.status !== "converted" && (
                    <button
                      onClick={() => setIsConvertModalOpen(true)}
                      className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/50 text-xs font-medium flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3" />
                      Convert to Project
                    </button>
                  )}
                  {selected.status === "converted" && (
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 text-xs font-medium">
                      ✓ Converted
                    </span>
                  )}
                </div>
              </div>

              {selected.company && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Company</p>
                  <p className="text-white">{selected.company}</p>
                </div>
              )}

              {selected.phone && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                  <a href={`tel:${selected.phone}`} className="text-cyan-400 hover:text-cyan-300">
                    {selected.phone}
                  </a>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Source</p>
                <p className="text-white">{selected.source}</p>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Added</p>
                  <p className="text-sm text-gray-300">
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selected.lastContactedAt && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Last Contacted</p>
                    <p className="text-sm text-gray-300">
                      {new Date(selected.lastContactedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "contacted", "qualified", "converted", "lost"] as const).map((status) => (
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
                Delete Lead
              </button>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select a lead to view details</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Email Reply Modal */}
      {selected && (
        <EmailReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          recipientEmail={selected.email}
          recipientName={selected.name}
          subject="Following up - Media4U"
          onSend={handleSendReply}
        />
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Lead</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
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
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
                  required
                >
                  <option value="">Select source...</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Any additional details about this lead..."
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
                  className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-all font-medium"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Convert to Project Modal */}
      {isConvertModalOpen && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Convert Lead to Project</h2>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Converting lead:</p>
              <p className="text-white font-semibold">{selected.name}</p>
              <p className="text-gray-400 text-sm">{selected.email}</p>
            </div>

            <form onSubmit={handleConvertToProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={convertData.projectType}
                  onChange={(e) => setConvertData({ ...convertData, projectType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
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
                  value={convertData.description}
                  onChange={(e) => setConvertData({ ...convertData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Brief description of the project..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <textarea
                  value={convertData.requirements}
                  onChange={(e) => setConvertData({ ...convertData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Specific features, pages, functionality needed..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    value={convertData.budget}
                    onChange={(e) => setConvertData({ ...convertData, budget: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    value={convertData.timeline}
                    onChange={(e) => setConvertData({ ...convertData, timeline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all font-medium"
                >
                  Convert to Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
