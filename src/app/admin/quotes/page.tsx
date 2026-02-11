/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Phone, Mail, DollarSign, Briefcase, Building2, Trash2, FolderPlus } from "lucide-react";

type QuoteStatus = "new" | "contacted" | "quoted" | "closed";

const statusColors: Record<QuoteStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusLabels: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  closed: "Closed",
};

export default function QuotesAdminPage() {
  const quotes = useQuery(api.quoteRequests.getAllQuoteRequests, {});
  const updateStatus = useMutation(api.quoteRequests.updateQuoteRequestStatus);
  const deleteQuote = useMutation(api.quoteRequests.deleteQuoteRequest);
  const convertToProject = useMutation(api.quoteRequests.createProjectFromQuoteRequest);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | "all" | "active">("active");

  const filtered =
    quotes
      ? filterStatus === "active"
        ? quotes.filter((q: any) => q.status !== "closed")
        : filterStatus === "all"
          ? quotes
          : quotes.filter((q: any) => q.status === filterStatus)
      : quotes;

  const selected = quotes?.find((q: any) => q._id === selectedId);

  async function handleStatusChange(id: Id<"quoteRequests">, newStatus: QuoteStatus) {
    await updateStatus({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"quoteRequests">) {
    if (confirm("Delete this quote request?")) {
      await deleteQuote({ id });
      setSelectedId(null);
    }
  }

  async function handleConvertToProject(id: Id<"quoteRequests">) {
    if (confirm("Convert this quote request to a project?")) {
      await convertToProject({ quoteId: id });
      setSelectedId(null);
      alert("Project created successfully!");
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Quote Requests</h1>
        <p className="text-gray-400">Manage incoming quote requests from the widget</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(["active", "all", "new", "contacted", "quoted", "closed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
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
                {filtered?.length || 0} Quotes
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filtered?.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No quote requests yet
                </div>
              ) : (
                filtered?.map((quote: any) => (
                  <motion.button
                    key={quote._id}
                    onClick={() => setSelectedId(quote._id)}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    className={`w-full p-4 text-left transition-all border-l-4 ${
                      selectedId === quote._id
                        ? "border-cyan-500 bg-white/10"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white text-sm truncate">{quote.name}</p>
                    <p className="text-xs text-gray-400 truncate">{quote.phone}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {quote.issueType} - {quote.propertyType}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[quote.status as QuoteStatus]}`}
                      >
                        {statusLabels[quote.status as QuoteStatus]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.button>
                ))
              )}
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                  <a
                    href={`tel:${selected.phone}`}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {selected.phone}
                  </a>
                </div>

                {selected.email && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {selected.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Service Needed</p>
                  <p className="text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    {selected.issueType}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Business Type</p>
                  <p className="text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    {selected.propertyType}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Budget</p>
                  <p className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    {selected.zipCode}
                  </p>
                </div>
              </div>

              {selected.description && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Submitted</p>
                <p className="text-white">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {(["new", "contacted", "quoted", "closed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selected._id, status)}
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
                onClick={() => handleConvertToProject(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all border border-cyan-500/30 font-medium flex items-center justify-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Convert to Project
              </button>

              <button
                onClick={() => handleDelete(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Quote Request
              </button>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select a quote request to view details</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
