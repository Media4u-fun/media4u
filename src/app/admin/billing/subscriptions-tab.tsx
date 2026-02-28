"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";

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

export function SubscriptionsTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const subscriptions = useQuery(
    api.stripe.getAllSubscriptions,
    convexIsAdmin === true
      ? (filterStatus !== "all" ? { status: filterStatus } : {})
      : "skip"
  );

  const selected = subscriptions?.find((s: Doc<"subscriptions">) => s._id === selectedId);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Filters */}
      <div className="lg:col-span-3 flex gap-3 overflow-x-auto scrollbar-hide">
        {(["all", "active", "past_due", "canceled", "unpaid"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
              {subscriptions?.length ?? 0} Subscriptions
            </p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {subscriptions?.map((subscription: Doc<"subscriptions">) => (
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
                <p className="text-xs text-gray-400">Web Care Monthly</p>
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
            {subscriptions?.length === 0 && (
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
                <p className="text-xl font-semibold text-white">Web Care Monthly</p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${STATUS_COLORS[selected.status as SubscriptionStatus]}`}
              >
                {STATUS_LABELS[selected.status as SubscriptionStatus]}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Customer Email</p>
              <a href={`mailto:${selected.customerEmail}`} className="text-brand-light hover:text-brand-light">
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
                  <code className="text-gray-300 text-xs">{selected.stripeSubscriptionId}</code>
                </div>
                <div>
                  <span className="text-gray-500">Price: </span>
                  <code className="text-gray-300 text-xs">{selected.stripePriceId}</code>
                </div>
                <div>
                  <span className="text-gray-500">Customer: </span>
                  <code className="text-gray-300 text-xs">{selected.stripeCustomerId}</code>
                </div>
              </div>
            </div>

            <a
              href={`https://dashboard.stripe.com/subscriptions/${selected.stripeSubscriptionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              View in Stripe Dashboard
            </a>
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
