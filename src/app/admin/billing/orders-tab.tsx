"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

type OrderStatus = "pending" | "paid" | "failed" | "refunded";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

export function OrdersTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = useQuery(
    api.stripe.getAllOrders,
    convexIsAdmin === true
      ? (filterStatus !== "all" ? { status: filterStatus } : {})
      : "skip"
  );

  const deleteOrder = useMutation(api.stripe.deleteOrder);

  const selected = orders?.find((o: Doc<"orders">) => o._id === selectedId);

  async function handleDelete() {
    if (!selected) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this order?\n\nCustomer: ${selected.customerName ?? selected.customerEmail}\nProduct: ${PRODUCT_NAMES[selected.productType] ?? selected.productType}\nAmount: $${(selected.amount / 100).toFixed(2)}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteOrder({ id: selected._id });
      setSelectedId(null);
    } catch {
      alert("Failed to delete order. Please try again.");
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Filters */}
      <div className="lg:col-span-3 flex gap-3 overflow-x-auto scrollbar-hide">
        {(["all", "pending", "paid", "failed", "refunded"] as const).map((status) => (
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
              {orders?.length ?? 0} Orders
            </p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {orders?.map((order: Doc<"orders">) => (
              <motion.button
                key={order._id}
                onClick={() => setSelectedId(order._id)}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className={`w-full p-4 text-left transition-all border-l-4 ${
                  selectedId === order._id
                    ? "border-brand-light bg-white/10"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm truncate">
                    {order.customerName ?? order.customerEmail}
                  </p>
                  <span className="text-white font-medium text-sm">
                    ${(order.amount / 100).toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {PRODUCT_NAMES[order.productType] ?? order.productType}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded border ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </motion.button>
            ))}
            {orders?.length === 0 && (
              <div className="p-8 text-center text-gray-500">No orders found</div>
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
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Order</p>
                <p className="text-xl font-semibold text-white">
                  {PRODUCT_NAMES[selected.productType] ?? selected.productType}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${STATUS_COLORS[selected.status as OrderStatus]}`}
              >
                {STATUS_LABELS[selected.status as OrderStatus]}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Customer Name</p>
                <p className="text-white">{selected.customerName ?? "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Customer Email</p>
                <a href={`mailto:${selected.customerEmail}`} className="text-brand-light hover:text-brand-light">
                  {selected.customerEmail}
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Amount</p>
                <p className="text-2xl font-display font-bold text-white">
                  ${(selected.amount / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Order Date</p>
                <p className="text-white">
                  {format(new Date(selected.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {selected.paidAt && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Paid Date</p>
                <p className="text-green-400">
                  {format(new Date(selected.paidAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Stripe IDs</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Session: </span>
                  <code className="text-gray-300 text-xs">{selected.stripeSessionId}</code>
                </div>
                {selected.stripePaymentIntentId && (
                  <div>
                    <span className="text-gray-500">Payment Intent: </span>
                    <code className="text-gray-300 text-xs">{selected.stripePaymentIntentId}</code>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Customer: </span>
                  <code className="text-gray-300 text-xs">{selected.stripeCustomerId}</code>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={`https://dashboard.stripe.com/payments/${selected.stripePaymentIntentId ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
                View in Stripe Dashboard
              </a>

              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete Order
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-elevated rounded-2xl p-12 text-center">
            <p className="text-gray-400">Select an order to view details</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
