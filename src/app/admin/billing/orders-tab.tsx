"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Trash2, X, CheckCircle, AlertCircle, Loader2, Download, Search } from "lucide-react";

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

type Toast = { type: "success" | "error"; message: string };

function exportCSV(orders: Doc<"orders">[]) {
  const headers = ["Customer Name", "Email", "Product", "Amount", "Status", "Date"];
  const rows = orders.map((o) => [
    o.customerName ?? "",
    o.customerEmail,
    PRODUCT_NAMES[o.productType] ?? o.productType,
    `$${(o.amount / 100).toFixed(2)}`,
    o.status,
    format(new Date(o.createdAt), "yyyy-MM-dd"),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function OrdersTab() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const orders = useQuery(
    api.stripe.getAllOrders,
    convexIsAdmin === true ? {} : "skip"
  );

  const deleteOrder = useMutation(api.stripe.deleteOrder);

  const filtered = orders?.filter((o: Doc<"orders">) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (o.customerName ?? "").toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const selected = filtered?.find((o: Doc<"orders">) => o._id === selectedId);
  const confirmTarget = filtered?.find((o: Doc<"orders">) => o._id === confirmDeleteId);

  function showToast(type: Toast["type"], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteOrder({ id: confirmTarget._id });
      if (selectedId === confirmTarget._id) setSelectedId(null);
      setConfirmDeleteId(null);
      showToast("success", "Order deleted successfully.");
    } catch {
      showToast("error", "Failed to delete order. Please try again.");
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
              <h3 className="text-lg font-semibold text-white mb-2">Delete Order?</h3>
              <p className="text-sm text-gray-400 mb-1">
                Customer: <span className="text-white">{confirmTarget.customerName ?? confirmTarget.customerEmail}</span>
              </p>
              <p className="text-sm text-gray-400 mb-1">
                Product: <span className="text-white">{PRODUCT_NAMES[confirmTarget.productType] ?? confirmTarget.productType}</span>
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Amount: <span className="text-white">${(confirmTarget.amount / 100).toFixed(2)}</span>
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
                  {isDeleting ? "Deleting..." : "Delete Order"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="lg:col-span-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(["all", "pending", "paid", "failed", "refunded"] as const).map((status) => (
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
          onClick={() => filtered && exportCSV(filtered)}
          disabled={!filtered?.length}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 text-sm font-medium transition-all disabled:opacity-40 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export CSV
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
              {filtered === undefined ? "Loading..." : `${filtered.length} Orders`}
            </p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {filtered === undefined && (
              <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading orders...</span>
              </div>
            )}
            {filtered?.map((order: Doc<"orders">) => (
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
            {filtered?.length === 0 && (
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
                <a href={`mailto:${selected.customerEmail}`} className="text-brand-light hover:underline">
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
                  <code className="text-gray-300 text-xs break-all">{selected.stripeSessionId}</code>
                </div>
                {selected.stripePaymentIntentId && (
                  <div>
                    <span className="text-gray-500">Payment Intent: </span>
                    <code className="text-gray-300 text-xs break-all">{selected.stripePaymentIntentId}</code>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Customer: </span>
                  <code className="text-gray-300 text-xs break-all">{selected.stripeCustomerId}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://dashboard.stripe.com/payments/${selected.stripePaymentIntentId ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
                View in Stripe
              </a>

              <button
                onClick={() => setConfirmDeleteId(selected._id)}
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
