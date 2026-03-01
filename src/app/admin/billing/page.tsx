"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CreditCard, RefreshCw, Receipt, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { OrdersTab } from "./orders-tab";
import { SubscriptionsTab } from "./subscriptions-tab";
import { InvoicesTab } from "./invoices-tab";

type BillingTab = "orders" | "subscriptions" | "invoices";

const TABS: Array<{ key: BillingTab; label: string; icon: typeof CreditCard }> = [
  { key: "orders", label: "Orders", icon: CreditCard },
  { key: "subscriptions", label: "Subscriptions", icon: RefreshCw },
  { key: "invoices", label: "Invoices", icon: Receipt },
];

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>("invoices");

  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const isAdmin = convexIsAdmin === true;
  const allOrders = useQuery(api.stripe.getAllOrders, isAdmin ? {} : "skip");
  const allSubscriptions = useQuery(api.stripe.getAllSubscriptions, isAdmin ? {} : "skip");
  const allProjects = useQuery(api.projects.getAllProjects);

  const paidOrders = allOrders?.filter((o) => o.status === "paid") ?? [];
  const activeSubscriptions = allSubscriptions?.filter((s) => s.status === "active") ?? [];
  const pendingInvoices = allProjects?.filter((p) => p.setupInvoiceStatus === "pending" || p.setupInvoiceStatus === "sent") ?? [];
  const paidInvoices = allProjects?.filter((p) => p.setupInvoicePaid === true) ?? [];

  const orderRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / 100;
  const invoiceRevenue = paidInvoices.reduce((sum, p) => sum + ((p.setupFeeAmount as number) || 0), 0);
  const totalRevenue = orderRevenue + invoiceRevenue;
  const mrr = activeSubscriptions.length * 149;

  const stats = [
    {
      label: "Total Collected",
      value: `$${totalRevenue.toLocaleString()}`,
      sub: `${paidOrders.length} orders + ${paidInvoices.length} invoices`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Est. MRR",
      value: `$${mrr.toLocaleString()}`,
      sub: `${activeSubscriptions.length} active subscriptions`,
      icon: TrendingUp,
      color: "text-brand-light",
      bg: "bg-brand-light/10 border-brand-light/20",
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices.length.toString(),
      sub: "Awaiting payment",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Paid Invoices",
      value: paidInvoices.length.toString(),
      sub: `$${invoiceRevenue.toLocaleString()} collected`,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Billing</h1>
        <p className="text-gray-400">View and manage orders, subscriptions, and invoices</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat) => (
          <div key={stat.label} className={`glass-elevated rounded-xl p-4 border ${stat.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-brand-light/20 text-brand-light border border-brand-light/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "subscriptions" && <SubscriptionsTab />}
      {activeTab === "invoices" && <InvoicesTab />}
    </div>
  );
}
