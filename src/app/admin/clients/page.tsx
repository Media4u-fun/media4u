"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Users, Mail, Phone, Building2, Calendar, Globe,
  Briefcase, MessageSquare, FileText, TrendingUp, Edit,
  MapPin, Tag, Clock, Star, CheckCircle, DollarSign,
  ClipboardList, Bell, Activity, ChevronRight, ExternalLink,
  RefreshCw, Send, Plus, X, Hash, Newspaper, AlertCircle,
  CircleCheck, CircleDot, Circle, Flame, ArrowUp, ArrowRight, ArrowDown,
  Loader2, ChevronLeft,
} from "lucide-react";
import EditClientModal from "@/components/admin/EditClientModal";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDate(str: string) {
  return new Date(str + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProjectInvoiceRow({ project }: { project: Record<string, unknown> }) {
  const confirmPaid = useMutation(api.projects.confirmSetupInvoicePaid);
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);

  const isPaid = project.setupInvoiceStatus === "paid" || done;

  async function handleMarkPaid() {
    setMarking(true);
    try {
      await confirmPaid({ projectId: project._id as Id<"projects"> });
      setDone(true);
    } catch {
      // silent - user can retry
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-white">{project.projectType as string}</p>
        {!isPaid && (
          <button
            onClick={handleMarkPaid}
            disabled={marking}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 text-xs font-medium transition-all disabled:opacity-50 flex-shrink-0"
          >
            {marking ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            {marking ? "Saving..." : "Mark Paid"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {project.setupInvoiceStripeId ? (
          <span className={`px-2 py-0.5 rounded-full border ${isPaid ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
            Setup: {isPaid ? "paid" : (project.setupInvoiceStatus ? String(project.setupInvoiceStatus) : "pending")}
          </span>
        ) : null}
        {project.setupFeeAmount ? (
          <span className="px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-gray-400">
            ${project.setupFeeAmount as number}
          </span>
        ) : null}
        {project.setupInvoiceUrl && !isPaid ? (
          <a
            href={project.setupInvoiceUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded-full border bg-brand-light/10 text-brand-light border-brand-light/20 hover:bg-brand-light/20 transition-all"
          >
            View Invoice
          </a>
        ) : null}
      </div>
    </div>
  );
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: LucideIcon }> = {
  urgent: { label: "Urgent", color: "text-red-400",    bg: "bg-red-500/20",    border: "border-red-500/30",    Icon: Flame },
  high:   { label: "High",   color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", Icon: ArrowUp },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", Icon: ArrowRight },
  low:    { label: "Low",    color: "text-blue-400",   bg: "bg-blue-500/20",   border: "border-blue-500/30",   Icon: ArrowDown },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  todo:        { label: "To Do",       color: "text-gray-400",    Icon: Circle },
  in_progress: { label: "In Progress", color: "text-cyan-400",    Icon: CircleDot },
  done:        { label: "Done",        color: "text-emerald-400", Icon: CircleCheck },
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paused:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ---------------------------------------------------------------------------
// Tab types
// ---------------------------------------------------------------------------

type Tab = "overview" | "projects" | "billing" | "communications" | "tasks" | "activity";

const TABS: { key: Tab; label: string; Icon: LucideIcon }[] = [
  { key: "overview",        label: "Overview",       Icon: Star },
  { key: "projects",        label: "Projects",       Icon: Briefcase },
  { key: "billing",         label: "Billing",        Icon: DollarSign },
  { key: "communications",  label: "Comms",          Icon: MessageSquare },
  { key: "tasks",           label: "Tasks",          Icon: ClipboardList },
  { key: "activity",        label: "Activity",       Icon: Activity },
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ClientsPage() {
  const clients = useQuery(api.clients.getAllClients);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedClientDetails = useQuery(
    api.clients.getClientDetails,
    selectedEmail ? { email: selectedEmail } : "skip"
  );

  const selectedClient = clients?.find((c) => c.primaryEmail === selectedEmail);

  const [clientPage, setClientPage] = useState(1);
  const CLIENT_PAGE_SIZE = 25;

  const filteredClients = useMemo(() => clients?.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [clients, searchQuery]);

  const clientTotalPages = Math.max(1, Math.ceil((filteredClients?.length ?? 0) / CLIENT_PAGE_SIZE));
  const paginatedClients = filteredClients?.slice((clientPage - 1) * CLIENT_PAGE_SIZE, clientPage * CLIENT_PAGE_SIZE);

  function selectClient(email: string) {
    setSelectedEmail(email);
    setActiveTab("overview");
  }

  const d = selectedClientDetails;
  const s = d?.summary;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-7 h-7 text-brand-light" />
            <h1 className="text-3xl font-bold text-white">Clients</h1>
          </div>
          <p className="text-gray-500 text-sm">Full client command center</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Clients",    value: clients?.length ?? 0,                                                   color: "text-white" },
            { label: "With Projects",    value: clients?.filter((c) => c.projectIds.length > 0).length ?? 0,            color: "text-brand-light" },
            { label: "Active Leads",     value: clients?.filter((c) => c.leadIds.length > 0).length ?? 0,               color: "text-yellow-400" },
            { label: "Total Interactions", value: clients?.reduce((s, c) => s + c.totalInteractions, 0) ?? 0,           color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-elevated rounded-xl p-4 border border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Master / Detail */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Client List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50"
              />
            </div>

            <div className="space-y-1.5 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {/* Loading */}
              {clients === undefined && (
                <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading clients...</span>
                </div>
              )}
              {/* Error */}
              {clients === null && (
                <div className="flex flex-col items-center gap-1 py-10 text-red-400 text-center">
                  <AlertCircle className="w-6 h-6" />
                  <p className="text-sm font-medium">Failed to load clients</p>
                  <p className="text-xs text-gray-600">Refresh to try again</p>
                </div>
              )}
              {paginatedClients?.map((client) => (
                <motion.div
                  key={client.primaryEmail}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => selectClient(client.primaryEmail)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    selectedEmail === client.primaryEmail
                      ? "bg-brand-light/15 border-brand-light/40"
                      : "bg-white/[0.03] border-white/8 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{client.name}</p>
                      <p className="text-xs text-gray-400 truncate">{client.primaryEmail}</p>
                      {client.company && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{client.company}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      {client.projectIds.length > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                          {client.projectIds.length}P
                        </span>
                      )}
                      {client.leadIds.length > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {client.leadIds.length}L
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />{client.totalInteractions}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{fmt(client.lastActivity)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {filteredClients?.length === 0 && clients !== undefined && (
                <div className="text-center py-12 text-gray-600">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No clients found</p>
                </div>
              )}
              {/* Pagination */}
              {clientTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-white/8 mt-2">
                  <span className="text-xs text-gray-600">
                    {(clientPage - 1) * CLIENT_PAGE_SIZE + 1}-{Math.min(clientPage * CLIENT_PAGE_SIZE, filteredClients?.length ?? 0)} of {filteredClients?.length ?? 0}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                      disabled={clientPage === 1}
                      className="p-1 rounded-lg hover:bg-white/5 text-gray-500 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-gray-500">{clientPage}/{clientTotalPages}</span>
                    <button
                      onClick={() => setClientPage((p) => Math.min(clientTotalPages, p + 1))}
                      disabled={clientPage === clientTotalPages}
                      className="p-1 rounded-lg hover:bg-white/5 text-gray-500 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedClient ? (
                <motion.div
                  key={selectedEmail}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-elevated rounded-2xl overflow-hidden"
                >
                  {/* Client Header */}
                  <div className="p-5 border-b border-white/8">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedClient.name}</h2>
                        {selectedClient.company && (
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" /> {selectedClient.company}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light/10 hover:bg-brand-light/20 text-brand-light border border-brand-light/20 text-xs font-medium transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>

                    {/* Quick contact row */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {selectedClient.emails.slice(0, 2).map((e, i) => (
                        <a key={i} href={`mailto:${e.address}`} className="flex items-center gap-1 text-brand-light hover:underline">
                          <Mail className="w-3 h-3" />{e.address}
                        </a>
                      ))}
                      {(selectedClient.phones ?? []).slice(0, 1).map((p, i) => (
                        <a key={i} href={`tel:${p.number}`} className="flex items-center gap-1 text-gray-300 hover:text-white">
                          <Phone className="w-3 h-3" />{p.number}
                        </a>
                      ))}
                      {selectedClient.phone && !(selectedClient.phones?.length) && (
                        <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-1 text-gray-300 hover:text-white">
                          <Phone className="w-3 h-3" />{selectedClient.phone}
                        </a>
                      )}
                      {selectedClient.website && (
                        <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-400 hover:text-white">
                          <Globe className="w-3 h-3" />{selectedClient.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      {selectedClient.timezone && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />{selectedClient.timezone}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {selectedClient.tags && selectedClient.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {selectedClient.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Summary stat pills */}
                    {d && s && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                          <DollarSign className="w-3 h-3" />${s.totalRevenue.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-brand-light/10 border border-brand-light/20 text-brand-light">
                          <Briefcase className="w-3 h-3" />{d.projects.length} project{d.projects.length !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          <Calendar className="w-3 h-3" />{s.upcomingAppointments} upcoming
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                          <ClipboardList className="w-3 h-3" />{s.openTasksCount} open tasks
                        </span>
                        {d.newsletterSubscribed && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <Newspaper className="w-3 h-3" />Subscribed
                          </span>
                        )}
                        {selectedClient.preferredContact && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400">
                            <Star className="w-3 h-3" />Prefers {selectedClient.preferredContact}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-white/8 overflow-x-auto">
                    {TABS.map((tab) => {
                      const Icon = tab.Icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                            activeTab === tab.key
                              ? "border-brand-light text-brand-light"
                              : "border-transparent text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />{tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="p-5 max-h-[500px] overflow-y-auto">
                    {!d ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    ) : (
                      <>
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                          <div className="space-y-5">
                            {/* Contact details */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-gray-600 mb-3 font-semibold">Contact Info</p>
                              <div className="grid grid-cols-2 gap-3">
                                {selectedClient.address && (
                                  <div className="col-span-2 flex items-start gap-2 text-sm text-gray-300">
                                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                    <span>
                                      {[selectedClient.address.street, selectedClient.address.city, selectedClient.address.state, selectedClient.address.zip].filter(Boolean).join(", ")}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">First Seen</p>
                                  <p className="text-sm text-white">{fmt(selectedClient.firstSeen)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Last Activity</p>
                                  <p className="text-sm text-white">{fmt(selectedClient.lastActivity)}</p>
                                </div>
                                {selectedClient.referralSource && (
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-600 mb-1">Referral Source</p>
                                    <p className="text-sm text-white">{selectedClient.referralSource}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Notes */}
                            {selectedClient.notes && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Notes</p>
                                <p className="text-sm text-gray-300 leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/8 break-words overflow-wrap-anywhere">{selectedClient.notes}</p>
                              </div>
                            )}

                            {/* Admin notes */}
                            {d.adminNotes.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">Internal Notes ({d.adminNotes.length})</p>
                                <div className="space-y-2">
                                  {d.adminNotes.slice(0, 3).map((note: Record<string, unknown>, i: number) => (
                                    <div key={i} className="text-sm text-gray-300 bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/10">
                                      <p className="leading-relaxed break-words">{note.content as string}</p>
                                      <p className="text-xs text-gray-600 mt-1">{fmt(note.createdAt as number)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick stats */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-gray-600 mb-3 font-semibold">Quick Stats</p>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: "Projects",      value: d.projects.length,           color: "text-brand-light" },
                                  { label: "Messages",      value: d.messages.length,            color: "text-cyan-400" },
                                  { label: "Appointments",  value: d.appointments.length,        color: "text-purple-400" },
                                  { label: "Tasks",         value: d.tasks.length,               color: "text-orange-400" },
                                  { label: "Orders",        value: d.orders.length,              color: "text-green-400" },
                                  { label: "Interactions",  value: selectedClient.totalInteractions, color: "text-yellow-400" },
                                ].map((stat) => (
                                  <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/8 text-center">
                                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PROJECTS TAB */}
                        {activeTab === "projects" && (
                          <div className="space-y-3">
                            {/* Leads */}
                            {d.leads.length > 0 && (
                              <Section title="Leads" count={d.leads.length} color="text-yellow-400" Icon={TrendingUp}>
                                {d.leads.map((lead: Record<string, unknown>, i: number) => (
                                  <RecordRow key={i}
                                    title={lead.businessName as string || lead.source as string}
                                    subtitle={lead.notes as string}
                                    date={lead.createdAt as number}
                                    badge={lead.status as string}
                                    badgeColor="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  />
                                ))}
                              </Section>
                            )}
                            {/* Active Projects */}
                            {d.projects.length > 0 && (
                              <Section title="Projects" count={d.projects.length} color="text-brand-light" Icon={Briefcase}>
                                {d.projects.map((p: Record<string, unknown>, i: number) => (
                                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/8 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-white">{p.projectType as string}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PROJECT_STATUS_COLORS[p.status as string] ?? "bg-white/10 text-gray-400 border-white/10"}`}>
                                        {p.status as string}
                                      </span>
                                    </div>
                                    {p.description ? <p className="text-xs text-gray-500 line-clamp-2">{String(p.description)}</p> : null}
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      {(p.totalCost as number) > 0 && <span className="text-green-400">${(p.totalCost as number).toLocaleString()}</span>}
                                      <span>{fmt(p.createdAt as number)}</span>
                                    </div>
                                  </div>
                                ))}
                              </Section>
                            )}
                            {/* Requests */}
                            {d.requests.length > 0 && (
                              <Section title="Project Requests" count={d.requests.length} color="text-purple-400" Icon={FileText}>
                                {d.requests.map((r: Record<string, unknown>, i: number) => (
                                  <RecordRow key={i}
                                    title={(r.projectTypes as string[])?.join(", ") || "Request"}
                                    subtitle={r.description as string}
                                    date={r.createdAt as number}
                                    badge={r.status as string}
                                    badgeColor="bg-purple-500/20 text-purple-400 border-purple-500/30"
                                  />
                                ))}
                              </Section>
                            )}
                            {/* Quote Requests */}
                            {d.quoteRequests.length > 0 && (
                              <Section title="Quote Requests" count={d.quoteRequests.length} color="text-orange-400" Icon={Hash}>
                                {d.quoteRequests.map((q: Record<string, unknown>, i: number) => (
                                  <RecordRow key={i}
                                    title={q.service as string || "Quote"}
                                    subtitle={q.message as string}
                                    date={q.createdAt as number}
                                    badge={q.status as string}
                                    badgeColor="bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  />
                                ))}
                              </Section>
                            )}
                            {d.projects.length === 0 && d.leads.length === 0 && d.requests.length === 0 && (
                              <EmptyState icon={Briefcase} label="No projects yet" />
                            )}
                          </div>
                        )}

                        {/* BILLING TAB */}
                        {activeTab === "billing" && (
                          <div className="space-y-4">
                            {/* Revenue summary */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-green-400">${s!.totalRevenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Total Revenue</p>
                              </div>
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-blue-400">{s!.paidOrdersCount}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Paid Orders</p>
                              </div>
                              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-purple-400">{s!.activeSubscriptionsCount}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Subscriptions</p>
                              </div>
                            </div>
                            {/* Orders */}
                            {d.orders.length > 0 && (
                              <Section title="Orders" count={d.orders.length} color="text-green-400" Icon={DollarSign}>
                                {d.orders.map((o: Record<string, unknown>, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/8">
                                    <div>
                                      <p className="text-sm font-medium text-white">{o.packageName as string || "Order"}</p>
                                      <p className="text-xs text-gray-500">{fmt(o.createdAt as number)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-green-400">${((o.amount as number || 0) / 100).toLocaleString()}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full border ${o.status === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                                        {o.status as string}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </Section>
                            )}
                            {/* Subscriptions */}
                            {d.subscriptions.length > 0 && (
                              <Section title="Subscriptions" count={d.subscriptions.length} color="text-purple-400" Icon={RefreshCw}>
                                {d.subscriptions.map((sub: Record<string, unknown>, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/8">
                                    <div>
                                      <p className="text-sm font-medium text-white">{sub.planName as string || "Subscription"}</p>
                                      <p className="text-xs text-gray-500">{fmt(sub.createdAt as number)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {sub.planAmount && (
                                        <span className="text-sm font-bold text-green-400">${(Number(sub.planAmount) / 100).toFixed(0)}/mo</span>
                                      )}
                                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sub.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                                        {sub.status as string}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </Section>
                            )}
                            {/* Project invoices */}
                            {d.projects.filter((p: Record<string, unknown>) => p.setupInvoiceStripeId || p.paymentInvoiceStripeId).length > 0 && (
                              <Section title="Project Invoices" count={d.projects.filter((p: Record<string, unknown>) => p.setupInvoiceStripeId || p.paymentInvoiceStripeId).length} color="text-cyan-400" Icon={FileText}>
                                {d.projects.filter((p: Record<string, unknown>) => p.setupInvoiceStripeId || p.paymentInvoiceStripeId).map((p: Record<string, unknown>, i: number) => (
                                  <ProjectInvoiceRow key={i} project={p} />
                                ))}
                              </Section>
                            )}
                            {d.orders.length === 0 && d.subscriptions.length === 0 && (
                              <EmptyState icon={DollarSign} label="No billing records yet" />
                            )}
                          </div>
                        )}

                        {/* COMMUNICATIONS TAB */}
                        {activeTab === "communications" && (
                          <div className="space-y-4">
                            {/* Appointments */}
                            {d.appointments.length > 0 && (
                              <Section title="Appointments" count={d.appointments.length} color="text-cyan-400" Icon={Calendar}>
                                {d.appointments.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.date as string) > (a.date as string) ? 1 : -1).map((apt: Record<string, unknown>, i: number) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/8">
                                    <div>
                                      <p className="text-sm font-medium text-white">{apt.title as string}</p>
                                      <p className="text-xs text-gray-500">{fmtDate(apt.date as string)} {apt.time as string && `at ${apt.time as string}`}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                      apt.status === "confirmed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                      apt.status === "cancelled" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    }`}>{apt.status as string}</span>
                                  </div>
                                ))}
                              </Section>
                            )}
                            {/* Messages */}
                            {d.messages.length > 0 && (
                              <Section title="Messages" count={d.messages.length} color="text-brand-light" Icon={MessageSquare}>
                                {d.messages.slice(0, 5).map((msg: Record<string, unknown>, i: number) => (
                                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/8">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${msg.sender === "admin" ? "bg-brand-light/20 text-brand-light" : "bg-white/10 text-gray-400"}`}>
                                        {msg.sender as string}
                                      </span>
                                      <span className="text-xs text-gray-600">{fmt(msg.createdAt as number)}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2">{msg.content as string}</p>
                                  </div>
                                ))}
                              </Section>
                            )}
                            {/* Contact Forms */}
                            {d.contacts.length > 0 && (
                              <Section title="Contact Forms" count={d.contacts.length} color="text-green-400" Icon={Send}>
                                {d.contacts.map((c: Record<string, unknown>, i: number) => (
                                  <RecordRow key={i}
                                    title={c.service as string || "Contact"}
                                    subtitle={c.message as string}
                                    date={c.createdAt as number}
                                    badge={c.status as string}
                                    badgeColor="bg-green-500/20 text-green-400 border-green-500/30"
                                  />
                                ))}
                              </Section>
                            )}
                            {d.appointments.length === 0 && d.messages.length === 0 && d.contacts.length === 0 && (
                              <EmptyState icon={MessageSquare} label="No communications yet" />
                            )}
                          </div>
                        )}

                        {/* TASKS TAB */}
                        {activeTab === "tasks" && (
                          <div className="space-y-3">
                            {d.tasks.length === 0 ? (
                              <EmptyState icon={ClipboardList} label="No tasks linked to this client" />
                            ) : (
                              <>
                                {(["todo", "in_progress", "done"] as const).map((status) => {
                                  const statusTasks = d.tasks.filter((t: Record<string, unknown>) => t.status === status);
                                  if (statusTasks.length === 0) return null;
                                  const sc = STATUS_CONFIG[status];
                                  const StatusIcon = sc.Icon;
                                  return (
                                    <div key={status}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <StatusIcon className={`w-3.5 h-3.5 ${sc.color}`} />
                                        <p className={`text-xs font-semibold uppercase tracking-wider ${sc.color}`}>{sc.label} ({statusTasks.length})</p>
                                      </div>
                                      <div className="space-y-1.5">
                                        {statusTasks.map((task: Record<string, unknown>, i: number) => {
                                          const p = PRIORITY_CONFIG[task.priority as string] ?? PRIORITY_CONFIG.medium;
                                          const PIcon = p.Icon;
                                          return (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/8">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${p.bg} ${p.color} border ${p.border} shrink-0`}>
                                                  <PIcon className="w-2.5 h-2.5" />
                                                </span>
                                                <p className={`text-sm text-white truncate ${task.status === "done" ? "line-through text-gray-500" : ""}`}>{task.title as string}</p>
                                              </div>
                                              {task.dueDate ? (
                                                <span className="text-xs text-gray-600 shrink-0 ml-2">{String(task.dueDate)}</span>
                                              ) : null}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}
                          </div>
                        )}

                        {/* ACTIVITY TAB */}
                        {activeTab === "activity" && (
                          <div className="space-y-2">
                            {d.activity.length === 0 ? (
                              <EmptyState icon={Activity} label="No activity logged yet" />
                            ) : (
                              d.activity.map((a: Record<string, unknown>, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/8">
                                  <div className="w-6 h-6 rounded-full bg-brand-light/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Activity className="w-3 h-3 text-brand-light" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300 leading-snug">{a.description as string}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{fmt(a.createdAt as number)}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-elevated rounded-2xl p-16 text-center"
                >
                  <Users className="w-14 h-14 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">Select a client to open their command center</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedClient && (
        <EditClientModal
          client={{
            primaryEmail: selectedClient.primaryEmail,
            name: selectedClient.name,
            company: selectedClient.company,
            website: selectedClient.website,
            emails: selectedClient.emails,
            phones: selectedClient.phones,
            address: selectedClient.address,
            tags: selectedClient.tags,
            preferredContact: selectedClient.preferredContact,
            timezone: selectedClient.timezone,
            referralSource: selectedClient.referralSource,
            notes: selectedClient.notes,
          }}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function Section({ title, count, color, Icon, children }: {
  title: string; count: number; color: string; Icon: LucideIcon; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full mb-2 group"
      >
        <Icon className={`w-4 h-4 ${color}`} />
        <p className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{title}</p>
        <span className="text-xs text-gray-600 bg-white/5 rounded-full px-1.5">{count}</span>
        <ChevronRight className={`w-3.5 h-3.5 text-gray-600 ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

function RecordRow({ title, subtitle, date, badge, badgeColor }: {
  title: string; subtitle?: string; date: number; badge?: string; badgeColor: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium text-white leading-snug">{title || "—"}</p>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>{badge}</span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 line-clamp-2 mb-1">{subtitle}</p>}
      <p className="text-xs text-gray-600">{fmt(date)}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="text-center py-10">
      <Icon className="w-10 h-10 mx-auto mb-2 text-gray-700 opacity-50" />
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
