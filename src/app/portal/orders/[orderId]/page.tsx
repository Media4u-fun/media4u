"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/components/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Download, CreditCard, Calendar, Mail, User, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { useState } from "react";

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
  refunded: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
};

export default function OrderDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const orders = useQuery(
    api.stripe.getUserOrders,
    user?.id ? { userId: user.id } : "skip"
  );

  const cancelOrder = useMutation(api.stripe.cancelMyOrder);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const order = orders?.find((o) => o._id === orderId);

  if (!order && orders) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Order not found</p>
        <Link
          href="/portal/orders"
          className="text-zinc-300 hover:text-white transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder({ orderId: order!._id });
      router.push("/portal/orders");
    } catch {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .mesh-bg {
            background: white !important;
          }
          .glass-elevated {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          @page {
            margin: 1in;
          }
        }
      `}</style>

      <div>
        {/* Print-only Invoice Header */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-600 mt-1">Media4U</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Invoice #</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-600 mt-2">Date</p>
            <p className="text-sm font-semibold text-gray-900">{format(new Date(order.createdAt), "MMMM d, yyyy")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Bill To:</p>
            {order.customerName && <p className="text-sm text-gray-700">{order.customerName}</p>}
            <p className="text-sm text-gray-700">{order.customerEmail}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">From:</p>
            <p className="text-sm text-gray-700">Media4U</p>
            <p className="text-sm text-gray-700">support@media4u.fun</p>
          </div>
        </div>
      </div>

      {/* Header with back button */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold">Order Details</h1>
            <p className="text-gray-400 text-sm">
              Order placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto print:hidden">
          {order.status === "pending" && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Cancel Order
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all border border-zinc-700"
          >
            <Download className="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Order Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-medium mb-2">
              {PRODUCT_NAMES[order.productType] || order.productType}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  STATUS_COLORS[order.status] || STATUS_COLORS.pending
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Total Amount</div>
            <div className="text-2xl lg:text-3xl font-semibold text-white">
              ${(order.amount / 100).toFixed(2)}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-400" />
            Order Information
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Order Date</div>
              <div className="text-white">
                {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
            {order.paidAt && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Payment Date</div>
                <div className="text-green-400">
                  {format(new Date(order.paidAt), "MMMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400 mb-1">Order ID</div>
              <div className="text-white font-mono text-sm break-all">
                {order._id}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-zinc-400" />
            Customer Information
          </h3>
          <div className="space-y-4">
            {order.customerName && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Name</div>
                <div className="text-white">{order.customerName}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400 mb-1">Email</div>
              <div className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {order.customerEmail}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-zinc-400" />
            Payment Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Payment Status</div>
              <div className="text-white capitalize">{order.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Amount Paid</div>
              <div className="text-white font-semibold">
                ${(order.amount / 100).toFixed(2)}
              </div>
            </div>
            {order.stripePaymentIntentId && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-400 mb-1">Transaction ID</div>
                <div className="text-white font-mono text-sm break-all">
                  {order.stripePaymentIntentId}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stripe Dashboard Link (for paid orders) */}
      {order.stripePaymentIntentId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 print:hidden"
        >
          <a
            href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View in Stripe Dashboard →
          </a>
        </motion.div>
      )}

      {/* Print-only Invoice Summary */}
      <div className="hidden print:block mt-8 pt-8 border-t-2 border-gray-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 text-gray-900">Description</th>
              <th className="text-right py-2 text-gray-900">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 text-gray-700">{PRODUCT_NAMES[order.productType] || order.productType}</td>
              <td className="text-right py-3 text-gray-900 font-semibold">${(order.amount / 100).toFixed(2)}</td>
            </tr>
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-3 text-gray-900">Total</td>
              <td className="text-right py-3 text-gray-900 text-lg">${(order.amount / 100).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Payment Status: <span className="font-semibold text-gray-900 capitalize">{order.status}</span>
          </p>
          {order.paidAt && (
            <p className="text-xs text-gray-600 mt-1">
              Payment Date: <span className="font-semibold text-gray-900">{format(new Date(order.paidAt), "MMMM d, yyyy 'at' h:mm a")}</span>
            </p>
          )}
          {order.stripePaymentIntentId && (
            <p className="text-xs text-gray-600 mt-1">
              Transaction ID: <span className="font-mono text-gray-900">{order.stripePaymentIntentId}</span>
            </p>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">Questions? Contact us at support@media4u.fun</p>
        </div>
      </div>
    </div>

      {/* Cancel Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm mx-4 w-full"
          >
            <h3 className="text-lg font-semibold mb-2">Cancel this order?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              This will permanently remove this pending order. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
