"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/components/AuthContext";
import { motion } from "motion/react";
import {
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Loader2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface CustomDealPanelProps {
  project: Doc<"projects">;
}

export function CustomDealPanel({ project }: CustomDealPanelProps) {
  const { user } = useAuth();
  const markInvoicePaid = useMutation(api.projects.markSetupInvoicePaid);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscription = useQuery(
    api.stripe.getUserSubscription,
    user?.id ? { userId: user.id } : "skip"
  );

  async function handleMarkPaid() {
    setError(null);
    setMarkingPaid(true);
    try {
      await markInvoicePaid({ projectId: project._id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMarkingPaid(false);
    }
  }

  const invoiceStatus = project.setupInvoiceStatus ?? "pending";
  const hasActiveSub = subscription?.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Setup Fee Card */}
      <div className="glass-elevated rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-0.5">Setup Fee - $500</h3>
            <p className="text-sm text-gray-400 mb-4">
              A Stripe invoice for the one-time setup fee will be sent to <span className="text-white">{project.email}</span>. Pay it directly from that email.
            </p>

            {/* Status indicator */}
            {invoiceStatus === "pending" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-yellow-400">
                  <Clock className="w-4 h-4" />
                  Invoice pending - check your email
                </div>
                <button
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-gray-300 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-60"
                >
                  {markingPaid ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {"I've Paid the Invoice"}
                </button>
              </div>
            )}

            {invoiceStatus === "needs_verification" && (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <RotateCcw className="w-4 h-4" />
                Payment submitted - admin is verifying (usually within 1 business day)
              </div>
            )}

            {invoiceStatus === "paid" && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                Setup fee confirmed - paid
              </div>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="glass-elevated rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-0.5">Monthly Subscription - $149/month</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your ongoing service plan. Start it anytime - you can begin even before the setup invoice is confirmed.
            </p>

            {hasActiveSub ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Subscription active
                </div>
                <a
                  href="/portal/subscription"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-gray-300 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Manage Billing
                </a>
              </div>
            ) : (
              <a
                href="/portal/subscription"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                <CreditCard className="w-4 h-4" />
                Start $149/month Subscription
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
