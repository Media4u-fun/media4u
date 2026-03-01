"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { Search, Plus, Inbox, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { InboxItem, InboxSource, UnifiedStatus, UNIFIED_STATUS_LABELS, SOURCE_LABELS } from "./types";
import { InboxListItem } from "./inbox-list-item";
import { ContactDetail } from "./contact-detail";
import { RequestDetail } from "./request-detail";
import { QuoteDetail } from "./quote-detail";
import { LeadDetail } from "./lead-detail";
import { AddLeadModal } from "./add-lead-modal";

const STATUS_FILTERS: Array<UnifiedStatus | "all"> = ["all", "new", "in_progress", "converted", "closed"];
const SOURCE_FILTERS: Array<InboxSource | "all"> = ["all", "contact", "request", "quote", "lead"];

export default function AdminInboxPage() {
  const inboxItems = useQuery(api.inbox.getInboxItems);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UnifiedStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<InboxSource | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!inboxItems) return undefined;

    let items = inboxItems as InboxItem[];

    if (statusFilter !== "all") {
      items = items.filter((item) => item.unifiedStatus === statusFilter);
    }

    if (sourceFilter !== "all") {
      items = items.filter((item) => item.source === sourceFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query)
      );
    }

    return items;
  }, [inboxItems, statusFilter, sourceFilter, searchQuery]);

  const selected = inboxItems?.find((item: InboxItem) => item.id === selectedId);

  function handleClose() {
    setSelectedId(null);
  }

  function renderDetail() {
    if (!selected) {
      return (
        <div className="glass-elevated rounded-2xl p-12 text-center">
          <p className="text-gray-400">Select an item to view details</p>
        </div>
      );
    }

    switch (selected.source) {
      case "contact":
        return <ContactDetail data={selected.sourceData as Doc<"contactSubmissions">} onClose={handleClose} />;
      case "request":
        return <RequestDetail data={selected.sourceData as Doc<"projectRequests">} onClose={handleClose} />;
      case "quote":
        return <QuoteDetail data={selected.sourceData as Doc<"quoteRequests">} onClose={handleClose} />;
      case "lead":
        return <LeadDetail data={selected.sourceData as Doc<"leads">} onClose={handleClose} />;
    }
  }

  const newCount = inboxItems?.filter((i: InboxItem) => i.unifiedStatus === "new").length ?? 0;
  const inProgressCount = inboxItems?.filter((i: InboxItem) => i.unifiedStatus === "in_progress").length ?? 0;
  const convertedCount = inboxItems?.filter((i: InboxItem) => i.unifiedStatus === "converted").length ?? 0;
  const convRate = inboxItems?.length ? Math.round((convertedCount / inboxItems.length) * 100) : 0;

  const inboxStats = [
    { label: "Total", value: inboxItems?.length ?? 0, icon: Inbox, color: "text-brand-light" },
    { label: "New", value: newCount, icon: TrendingUp, color: "text-blue-400" },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-yellow-400" },
    { label: "Converted", value: `${convRate}%`, icon: CheckCircle, color: "text-emerald-400" },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Inbox</h1>
            <p className="text-gray-400">All contacts, project requests, quotes, and leads in one place</p>
          </div>
          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-light text-white hover:bg-brand transition-all flex items-center gap-2 font-semibold text-sm shadow-lg shadow-brand-light/25 hover:shadow-brand-light/40"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {inboxStats.map((s) => (
          <div key={s.label} className="glass-elevated rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-3 mb-3 overflow-x-auto scrollbar-hide">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === status
                ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : UNIFIED_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Source Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {SOURCE_FILTERS.map((source) => (
          <button
            key={source}
            onClick={() => setSourceFilter(source)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              sourceFilter === source
                ? "bg-white/15 text-white border border-white/30"
                : "bg-white/5 text-gray-500 hover:text-gray-300 border border-white/5"
            }`}
          >
            {source === "all" ? "All Sources" : SOURCE_LABELS[source]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-1 ${selectedId ? "hidden lg:block" : ""}`}
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {filtered?.length ?? 0} Items
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filtered?.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No items found
                </div>
              ) : (
                filtered?.map((item: InboxItem) => (
                  <InboxListItem
                    key={`${item.source}-${item.id}`}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={() => setSelectedId(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-2 ${!selectedId ? "hidden lg:block" : ""}`}
        >
          {renderDetail()}
        </motion.div>
      </div>

      <AddLeadModal isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} />
    </div>
  );
}
