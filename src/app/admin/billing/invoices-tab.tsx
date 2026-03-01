"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, ExternalLink, FileText, FolderOpen, X, AlertCircle, Loader2 } from "lucide-react";

type Toast = { type: "success" | "error"; message: string };
import Link from "next/link";

type InvoiceStatus = "pending" | "sent" | "needs_verification" | "paid";

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  needs_verification: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  needs_verification: "Needs Verification",
  paid: "Paid",
};

function formatAmount(inv: { setupFeeAmount?: number; budget?: string }) {
  if (inv.setupFeeAmount) return `$${inv.setupFeeAmount}`;
  return inv.budget ?? "N/A";
}

export function InvoicesTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const invoices = useQuery(api.projects.getProjectsWithInvoices, convexIsAdmin === true ? {} : "skip");
  const confirmPaid = useMutation(api.projects.confirmSetupInvoicePaid);

  function showToast(type: Toast["type"], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = invoices?.filter((inv) => {
    if (filterStatus === "all") return true;
    return inv.setupInvoiceStatus === filterStatus;
  });

  const selected = filtered?.find((inv) => inv._id === selectedId);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/40 text-green-300"
                : "bg-red-500/20 border-red-500/40 text-red-300"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="lg:col-span-3 flex gap-3 overflow-x-auto scrollbar-hide">
        {(["all", "pending", "sent", "needs_verification", "paid"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filterStatus === status
                ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`lg:col-span-1 ${selectedId ? "hidden lg:block" : ""}`}
      >
        <div className="glass-elevated rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <p className="text-sm font-semibold text-gray-300">
              {filtered?.length ?? 0} Invoices
            </p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {filtered?.map((inv) => (
              <motion.button
                key={inv._id}
                onClick={() => setSelectedId(inv._id)}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className={`w-full p-4 text-left transition-all border-l-4 ${
                  selectedId === inv._id
                    ? "border-brand-light bg-white/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm truncate">
                    {inv.name}
                  </p>
                  <span className="text-white font-medium text-sm">
                    {formatAmount(inv)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {inv.company ?? inv.email}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded border ${STATUS_COLORS[(inv.setupInvoiceStatus as InvoiceStatus) ?? "pending"]}`}
                  >
                    {STATUS_LABELS[(inv.setupInvoiceStatus as InvoiceStatus) ?? "pending"]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(inv.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </motion.button>
            ))}
            {filtered?.length === 0 && (
              <div className="p-8 text-center text-gray-500">No invoices found</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`lg:col-span-2 ${!selectedId ? "hidden lg:block" : ""}`}
      >
        {selected ? (
          <div className="glass-elevated rounded-2xl p-6 space-y-6">
            <button
              onClick={() => setSelectedId(null)}
              className="lg:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to list
            </button>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Setup Invoice</p>
                <p className="text-xl font-semibold text-white">{selected.name}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${STATUS_COLORS[(selected.setupInvoiceStatus as InvoiceStatus) ?? "pending"]}`}
              >
                {STATUS_LABELS[(selected.setupInvoiceStatus as InvoiceStatus) ?? "pending"]}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Client Name</p>
                <p className="text-white">{selected.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                <a href={`mailto:${selected.email}`} className="text-brand-light hover:underline">
                  {selected.email}
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Amount</p>
                <p className="text-2xl font-display font-bold text-white">
                  {formatAmount(selected)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Company</p>
                <p className="text-white">{selected.company ?? "Not provided"}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Project Type</p>
                <p className="text-white">{selected.projectType}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Created</p>
                <p className="text-white">
                  {format(new Date(selected.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Stripe Details</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Invoice ID: </span>
                  <code className="text-gray-300 text-xs">{selected.setupInvoiceStripeId}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {selected.setupInvoiceStatus !== "paid" && (
                <button
                  onClick={async () => {
                    setIsMarking(true);
                    try {
                      await confirmPaid({ projectId: selected._id });
                      showToast("success", "Invoice marked as paid.");
                    } catch {
                      showToast("error", "Failed to mark as paid. Please try again.");
                    } finally {
                      setIsMarking(false);
                    }
                  }}
                  disabled={isMarking}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all border border-green-500/30 disabled:opacity-50"
                >
                  {isMarking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isMarking ? "Marking..." : "Mark as Paid"}
                </button>
              )}
              <Link
                href={`/admin/projects?id=${selected._id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-light/10 text-brand-light hover:bg-brand-light/20 transition-all border border-brand-light/30"
              >
                <FolderOpen className="w-4 h-4" />
                View Project
              </Link>
              {selected.setupInvoiceUrl && (
                <a
                  href={selected.setupInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <FileText className="w-4 h-4" />
                  View Invoice
                </a>
              )}
              <a
                href={`https://dashboard.stripe.com/invoices/${selected.setupInvoiceStripeId ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
                View in Stripe
              </a>
            </div>
          </div>
        ) : (
          <div className="glass-elevated rounded-2xl p-12 text-center">
            <p className="text-gray-400">Select an invoice to view details</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
