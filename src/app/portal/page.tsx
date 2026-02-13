"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { format } from "date-fns";
import { Briefcase, Lock, ExternalLink, CreditCard, ArrowRight, MessageCircle } from "lucide-react";

const GETTING_STARTED_STEPS = [
  {
    number: "01",
    title: "Start a Project",
    description: "Tell us what you want to build - website, branding, VR, or all three.",
    href: "/portal/projects",
    cta: "Build Your Project",
  },
  {
    number: "02",
    title: "We Review Your Request",
    description: "We review your blueprint and follow up within 1-2 business days with a plan.",
    href: null,
    cta: null,
  },
  {
    number: "03",
    title: "We Build and Launch",
    description: "Once you approve the plan, we get to work and keep you updated every step of the way.",
    href: null,
    cta: null,
  },
];

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

type ProjectStatus = "new" | "planning" | "design" | "development" | "review" | "completed" | "launched";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  planning: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  design: "bg-brand-dark/10 text-pink-400 border border-brand-dark/20",
  development: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  review: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  launched: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
};

const statusLabels: Record<ProjectStatus, string> = {
  new: "New",
  planning: "Planning",
  design: "Design",
  development: "Development",
  review: "Review",
  completed: "Completed",
  launched: "Launched",
};

export default function PortalPage(): ReactElement {
  const { user } = useAuth();

  const orders = useQuery(
    api.stripe.getUserOrders,
    user?.id ? { userId: user.id } : "skip"
  );

  const subscription = useQuery(
    api.stripe.getUserSubscription,
    user?.id ? { userId: user.id } : "skip"
  );

  const projects = useQuery(api.projects.getMyProjects);

  const handlePayNow = async (packageType: "starter" | "professional", projectId: string) => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType: packageType,
          userId: user?.id,
          customerEmail: user?.email,
          customerName: user?.name,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to start payment. Please try again.");
    }
  };

  const recentOrders = orders?.slice(0, 3) ?? [];
  const allOrdersCount = orders?.length ?? 0;
  const pendingOrdersCount = orders?.filter((o: Doc<"orders">) => o.status === "pending").length ?? 0;
  const recentProjects = projects?.slice(0, 3) ?? [];
  const activeProjectsCount = projects?.filter((p: Doc<"projects">) =>
    p.status !== "completed" && p.status !== "launched"
  ).length ?? 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">
          Welcome back, <span className="text-white">{user?.name}</span>
        </h1>
        <p className="text-gray-400">
          Track your projects, manage orders, and access your integration vault.
        </p>
      </motion.div>

      {/* Quick Message CTA - always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <Link
          href="/portal/support/messages"
          className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-5 hover:bg-zinc-800/50 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors">
            <MessageCircle className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-0.5">Have a question?</h3>
            <p className="text-xs text-gray-400">Send us a message - we are here to help with anything.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0" />
        </Link>
      </motion.div>

      {/* Getting Started - only show when brand new (no projects, no orders) */}
      {projects !== undefined && projects.length === 0 && recentOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-8"
        >
          <div className="mb-6">
            <span className="inline-block mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
              Welcome
            </span>
            <h2 className="text-lg font-medium text-white mb-1">
              Here is how it works
            </h2>
            <p className="text-gray-400 text-sm">
              You are all set up. Here is what happens next.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {GETTING_STARTED_STEPS.map((step, index) => (
              <div key={step.number} className="relative">
                {index < GETTING_STARTED_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-zinc-800 z-0" />
                )}
                <div className="relative z-10 p-4 rounded-xl bg-zinc-800/50 border border-zinc-800 h-full">
                  <div className="text-3xl font-bold text-zinc-700 mb-2">{step.number}</div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/portal/projects"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors text-sm"
          >
            Build Your First Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Briefcase className="w-4 h-4" />
            My Projects
          </div>
          <div className="text-2xl font-semibold text-white">
            {projects?.length ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {activeProjectsCount > 0 ? `${activeProjectsCount} in progress` : "No active projects"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="text-sm text-gray-400 mb-3">Orders</div>
          <div className="text-2xl font-semibold text-white">
            {allOrdersCount}
          </div>
          <div className="text-xs mt-1">
            {pendingOrdersCount > 0 ? (
              <span className="text-yellow-400">{pendingOrdersCount} pending payment</span>
            ) : (
              <span className="text-gray-500">No pending orders</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <div className="text-sm text-gray-400 mb-3">Web Care Plan</div>
          <div className="text-2xl font-semibold">
            {subscription?.status === "active" ? (
              <span className="text-green-400">Active</span>
            ) : (
              <span className="text-white">No Active Plan</span>
            )}
          </div>
        </motion.div>

      </div>

      {/* Active Subscription */}
      {subscription?.status === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-emerald-500/20 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-medium mb-1">
                Web Care Subscription
              </h2>
              <p className="text-gray-400 text-sm">
                Next billing date:{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
              </p>
            </div>
            <Link
              href="/portal/subscription"
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">My Projects</h2>
          {projects && projects.length > 3 && (
            <Link
              href="/portal/projects"
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Ready to build something?
                </h3>
                <p className="text-gray-400 text-sm">
                  Start your first project - whether it is a professional website, branding, a VR experience, or all three. We will guide you through every step.
                </p>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/portal/projects"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors text-sm whitespace-nowrap"
                >
                  View Project Options
                </Link>
                <Link
                  href="/start-project"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-brand/40 text-zinc-300 hover:border-brand-light hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Start the Wizard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project: Doc<"projects">) => (
              <div key={project._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">
                      {project.projectType}
                    </h3>
                    {project.company && (
                      <p className="text-sm text-gray-400 truncate">{project.company}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 flex-shrink-0 ml-2">
                    {project.paymentStatus === "unpaid" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full border bg-red-500/20 text-red-400 border-red-500/30">
                        Unpaid
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        statusColors[project.status as ProjectStatus]
                      }`}
                    >
                      {statusLabels[project.status as ProjectStatus]}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                  {project.description}
                </p>

                {/* Show Pay Now button for unpaid projects */}
                {project.paymentStatus === "unpaid" && project.packageType && (
                  <button
                    onClick={() => handlePayNow(project.packageType!, project._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors font-semibold mb-3"
                  >
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Pay Now - {project.budget}</span>
                  </button>
                )}

                <div className="flex gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Site
                    </a>
                  )}
                  <Link
                    href={`/portal/projects/${project._id}/vault`}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium ${!project.liveUrl ? 'flex-1' : ''}`}
                  >
                    <Lock className="w-4 h-4" />
                    Vault
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-gray-500">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Orders - hide when brand new with nothing yet */}
      {(recentOrders.length > 0 || (projects && projects.length > 0)) && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Recent Orders</h2>
          {orders && orders.length > 3 && (
            <Link
              href="/portal/orders"
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">No orders yet</p>
            <Link
              href="/start-project"
              className="text-zinc-300 hover:text-white font-medium transition-colors"
            >
              Browse our packages
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: Doc<"orders">) => (
              <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-medium text-white">
                      {PRODUCT_NAMES[order.productType] ?? order.productType}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {format(new Date(order.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      ${(order.amount / 100).toFixed(2)}
                    </div>
                    <div
                      className={`text-sm capitalize ${
                        order.status === "paid"
                          ? "text-green-400"
                          : order.status === "pending"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      )}
    </div>
  );
}
