"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Trash2, X, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";

type SubscriptionStatus = "active" | "past_due" | "canceled" | "unpaid";

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  past_due: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
  unpaid: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  unpaid: "Unpaid",
};

function getPlanName(stripePriceId: string): string {
  // Map known price IDs to human-readable names
  // Falls back to a formatted version of the price ID
  const knownPrices: Record<string, string> = {
    // Add your actual Stripe price IDs here if needed
  };
  if (knownPrices[stripePriceId]) return knownPrices[stripePriceId];
  // Try to make price ID readable: price_monthly_webcare -> Monthly Webcare
  const parts = stripePriceId.replace(/^price_/, "").split(/[_-]/);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "Web Care Plan";
}

type Toast = { type: "success" | "error"; message: string };
type SubscriptionDoc = Doc<"subscriptions"> & { planName?: string; planAmount?: number };

export function SubscriptionsTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const subscriptions = useQuery(
    api.stripe.getAllSubscriptions,
    convexIsAdmin === true ? {} : "skip"
  );
  const syncFromStripe = useAction(api.stripe.syncSubscriptionsFromStripe);

  const filtered = subscriptions?.filter((s: Doc<"subscriptions">) =>
    filterStatus === "all" || s.status === filterStatus
  );

  const deleteSubscription = useMutation(api.stripe.deleteSubscription);

  const selected = filtered?.find((s: Doc<"subscriptions">) => s._id === selectedId);
  const confirmTarget = filtered?.find((s: Doc<"subscriptions">) => s._id === confirmDeleteId);

  function showToast(type: Toast["type"], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSync() {
    setIsSyncing(true);
    try {
      const result = await syncFromStripe({});
      showToast("success", `Synced ${result.synced} subscription(s) from Stripe.`);
    } catch {
      showToast("error", "Failed to sync from Stripe. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteSubscription({ id: confirmTarget._id });
      if (selectedId === confirmTarget._id) setSelectedId(null);
      setConfirmDeleteId(null);
      showToast("success", "Subscription record deleted.");
    } catch {
      showToast("error", "Failed to delete subscription. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

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

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId && confirmTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-elevated rounded-2xl p-6 w-full max-w-sm mx-4 border border-red-500/30"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Delete Subscription Record?</h3>
              <p className="text-sm text-gray-400 mb-1">
                Customer: <span className="text-white">{confirmTarget.customerEmail}</span>
              </p>
              <p className="text-sm text-gray-400 mb-4">
                This only removes the record from your database - it does NOT cancel the subscription in Stripe.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeleting ? "Deleting..." : "Delete Record"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="lg:col-span-3 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {(["all", "active", "past_due", "canceled", "unpaid"] as const).map((status) => (
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
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-light/10 text-brand-light hover:bg-brand-light/20 border border-brand-light/30 text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isSyncing ? "Syncing..." : "Sync from Stripe"}
        </button>
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
              {filtered === undefined ? "Loading..." : `${filtered.length} Subscriptions`}
            </p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {filtered === undefined && (
              <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading subscriptions...</span>
              </div>
            )}
            {filtered?.length === 0 && subscriptions !== undefined && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">No subscriptions found.</p>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="text-brand-light text-sm hover:underline flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync from Stripe
                </button>
              </div>
            )}
            {filtered?.map((subscription: Doc<"subscriptions">) => (
              <motion.button
                key={subscription._id}
                onClick={() => setSelectedId(subscription._id)}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className={`w-full p-4 text-left transition-all border-l-4 ${
                  selectedId === subscription._id
                    ? "border-brand-light bg-white/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                <p className="font-semibold text-white text-sm truncate">
                  {subscription.customerEmail}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {(subscription as SubscriptionDoc).planName || getPlanName(subscription.stripePriceId)}
                  {(subscription as SubscriptionDoc).planAmount ? ` - $${(((subscription as SubscriptionDoc).planAmount ?? 0) / 100).toFixed(0)}/mo` : ""}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded border ${STATUS_COLORS[subscription.status as SubscriptionStatus]}`}
                  >
                    {STATUS_LABELS[subscription.status as SubscriptionStatus]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {subscription.cancelAtPeriodEnd
                      ? "Canceling"
                      : format(new Date(subscription.currentPeriodEnd), "MMM d")}
                  </span>
                </div>
              </motion.button>
            ))}
            {filtered?.length === 0 && subscriptions === undefined && (
              <div className="p-8 text-center text-gray-500">No subscriptions found</div>
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
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Subscription</p>
                <p className="text-xl font-semibold text-white">
                  {(selected as SubscriptionDoc).planName || getPlanName(selected.stripePriceId)}
                </p>
                {(selected as SubscriptionDoc).planAmount && (
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    ${(((selected as SubscriptionDoc).planAmount ?? 0) / 100).toFixed(0)}<span className="text-sm text-gray-400 font-normal">/mo</span>
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${STATUS_COLORS[selected.status as SubscriptionStatus]}`}
              >
                {STATUS_LABELS[selected.status as SubscriptionStatus]}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Customer Email</p>
              <a href={`mailto:${selected.customerEmail}`} className="text-brand-light hover:underline">
                {selected.customerEmail}
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Current Period Start</p>
                <p className="text-white">{format(new Date(selected.currentPeriodStart), "MMMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Current Period End</p>
                <p className="text-white">{format(new Date(selected.currentPeriodEnd), "MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Created</p>
                <p className="text-white">{format(new Date(selected.createdAt), "MMMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Auto-Renew</p>
                <p className={selected.cancelAtPeriodEnd ? "text-yellow-400" : "text-green-400"}>
                  {selected.cancelAtPeriodEnd ? "Canceling at period end" : "Yes"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Stripe IDs</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Subscription: </span>
                  <code className="text-gray-300 text-xs break-all">{selected.stripeSubscriptionId}</code>
                </div>
                <div>
                  <span className="text-gray-500">Price: </span>
                  <code className="text-gray-300 text-xs break-all">{selected.stripePriceId}</code>
                </div>
                <div>
                  <span className="text-gray-500">Customer: </span>
                  <code className="text-gray-300 text-xs break-all">{selected.stripeCustomerId}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://dashboard.stripe.com/subscriptions/${selected.stripeSubscriptionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
                View in Stripe
              </a>
              <button
                onClick={() => setConfirmDeleteId(selected._id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete Record
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Note: To cancel an active subscription, use the Stripe Dashboard link above. Deleting a record here only removes it from your database.
            </p>
          </div>
        ) : (
          <div className="glass-elevated rounded-2xl p-12 text-center">
            <p className="text-gray-400">Select a subscription to view details</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
