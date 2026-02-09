"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { format } from "date-fns";
import { Briefcase, Lock, ExternalLink } from "lucide-react";

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
};

type ProjectStatus = "new" | "planning" | "design" | "development" | "review" | "completed" | "launched";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  planning: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  design: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  development: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  launched: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
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

  const recentOrders = orders?.slice(0, 3) ?? [];
  const paidOrdersCount = orders?.filter((o: Doc<"orders">) => o.status === "paid").length ?? 0;
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
        <h1 className="text-4xl font-display font-bold mb-2">
          Welcome back, <span className="text-gradient-cyber">{user?.name}</span>
        </h1>
        <p className="text-gray-400">
          Track your projects, manage orders, and access your integration vault.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-elevated rounded-2xl p-6 border border-cyan-500/30"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Briefcase className="w-4 h-4" />
            My Projects
          </div>
          <div className="text-3xl font-display font-bold text-white">
            {projects?.length ?? 0}
          </div>
          {activeProjectsCount > 0 && (
            <div className="text-xs text-cyan-400 mt-1">
              {activeProjectsCount} active
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="text-sm text-gray-400 mb-1">Total Orders</div>
          <div className="text-3xl font-display font-bold text-white">
            {paidOrdersCount}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="text-sm text-gray-400 mb-1">Subscription Status</div>
          <div className="text-3xl font-display font-bold">
            {subscription?.status === "active" ? (
              <span className="text-green-400">Active</span>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="text-sm text-gray-400 mb-1">Account Email</div>
          <div className="text-lg font-medium text-white truncate">
            {user?.email}
          </div>
        </motion.div>
      </div>

      {/* Active Subscription */}
      {subscription?.status === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-elevated rounded-2xl p-6 mb-8 border border-green-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-display font-semibold mb-1">
                Web Care Subscription
              </h2>
              <p className="text-gray-400 text-sm">
                Next billing date:{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
              </p>
            </div>
            <Link
              href="/portal/subscription"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
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
          <h2 className="text-xl font-display font-semibold">My Projects</h2>
          {projects && projects.length > 3 && (
            <Link
              href="/portal/projects"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="glass-elevated rounded-2xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No projects yet</p>
            <p className="text-gray-500 text-sm mb-4">
              Your projects will appear here once they&apos;re created
            </p>
            <Link
              href="/start-project"
              className="inline-block text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Start a new project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project: Doc<"projects">) => (
              <div key={project._id} className="glass-elevated rounded-2xl p-5 hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">
                      {project.projectType}
                    </h3>
                    {project.company && (
                      <p className="text-sm text-gray-400 truncate">{project.company}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border flex-shrink-0 ml-2 ${
                      statusColors[project.status as ProjectStatus]
                    }`}
                  >
                    {statusLabels[project.status as ProjectStatus]}
                  </span>
                </div>

                <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                  {project.description}
                </p>

                <div className="flex gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Site
                    </a>
                  )}
                  <Link
                    href={`/portal/projects/${project._id}/vault`}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50 transition-colors text-sm font-medium ${!project.liveUrl ? 'flex-1' : ''}`}
                  >
                    <Lock className="w-4 h-4" />
                    Vault
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Recent Orders</h2>
          {orders && orders.length > 3 && (
            <Link
              href="/portal/orders"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass-elevated rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No orders yet</p>
            <Link
              href="/start-project"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Browse our packages
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: Doc<"orders">) => (
              <div key={order._id} className="glass-elevated rounded-2xl p-6">
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
    </div>
  );
}
