/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Inbox,
  FileText,
  Image as ImageIcon,
  PenLine,
  Plus,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Briefcase,
  AlertCircle,
  Send,
  UserPlus,
  Globe,
  Mail,
} from "lucide-react";
import SchedulerWidget from "@/components/admin/SchedulerWidget";

export default function AdminDashboard() {


  const inboxItems = useQuery(api.inbox.getInboxItems);
  const subscriberCount = useQuery(api.newsletter.getSubscriberCount, {});
  const blogPosts = useQuery(api.blog.getAllPosts, {});
  const portfolioProjects = useQuery(api.portfolio.getAllProjects);
  const communityMembers = useQuery(api.community.getAllMembers);
  const communityRequests = useQuery(api.community.getInviteRequests);
  const clientProjects = useQuery(api.projects.getAllProjects);
  const vrExperiences = useQuery(api.vr.getAllExperiences);
  function calculateTrend(items: any[] | undefined) {
    if (!items || items.length === 0) return { trend: 0, isUp: false };

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const thisWeek = items.filter((item: any) => item.createdAt > weekAgo).length;
    const lastWeek = items.filter((item: any) => item.createdAt > twoWeeksAgo && item.createdAt <= weekAgo).length;

    if (lastWeek === 0) return { trend: thisWeek > 0 ? 100 : 0, isUp: thisWeek > 0 };

    const percentChange = ((thisWeek - lastWeek) / lastWeek) * 100;
    return { trend: Math.abs(Math.round(percentChange)), isUp: percentChange > 0 };
  }

  const inboxTrend = calculateTrend(inboxItems);
  const blogTrend = calculateTrend(blogPosts);
  const portfolioTrend = calculateTrend(portfolioProjects);

  // Needs Attention counts
  const newInboxItems = inboxItems?.filter((i: any) => i.unifiedStatus === "new").length || 0;
  const pendingCommunity = communityRequests?.filter((r: any) => r.status === "pending").length || 0;
  const pendingApprovals = communityMembers?.filter((m: any) => !m.approved).length || 0;

  const totalPendingItems = newInboxItems + pendingCommunity + pendingApprovals;

  const stats = [
    {
      label: "Inbox",
      value: inboxItems?.length || 0,
      href: "/admin/inbox",
      icon: Inbox,
      color: "from-brand to-brand-light",
      trend: inboxTrend,
    },
    {
      label: "Newsletter Subscribers",
      value: subscriberCount || 0,
      href: "/admin/newsletter",
      icon: Mail,
      color: "from-brand to-brand-dark",
      trend: { trend: 0, isUp: false },
    },
    {
      label: "Client Projects",
      value: clientProjects?.length || 0,
      href: "/admin/projects",
      icon: Briefcase,
      color: "from-orange-500 to-yellow-500",
      trend: calculateTrend(clientProjects),
    },
    {
      label: "Blog Posts",
      value: blogPosts?.length || 0,
      href: "/admin/blog",
      icon: FileText,
      color: "from-amber-500 to-orange-500",
      trend: blogTrend,
    },
    {
      label: "Portfolio Projects",
      value: portfolioProjects?.length || 0,
      href: "/admin/portfolio",
      icon: ImageIcon,
      color: "from-rose-500 to-pink-500",
      trend: portfolioTrend,
    },
    {
      label: "Community Members",
      value: communityMembers?.filter((m: any) => m.approved).length || 0,
      href: "/admin/community",
      icon: Users,
      color: "from-brand to-brand-dark",
      trend: calculateTrend(communityMembers?.filter((m: any) => m.approved)),
    },
    {
      label: "VR Community",
      value: vrExperiences?.length || 0,
      href: "/admin/vr",
      icon: Globe,
      color: "from-teal-500 to-brand-light",
      trend: { trend: 0, isUp: false },
    },
  ];

  // Recent activity from inbox items
  const recentActivity = [
    ...(inboxItems?.slice(0, 5).map((item: any) => ({
      type: item.source === "contact" ? "Contact" : item.source === "request" ? "Project Request" : item.source === "quote" ? "Quote" : "Lead",
      name: item.name,
      time: item.createdAt,
      color: item.source === "contact" ? "text-blue-400" : item.source === "request" ? "text-brand-light" : item.source === "quote" ? "text-amber-400" : "text-green-400",
    })) || []),
    ...(blogPosts?.filter((p: any) => p.published).slice(0, 2).map((item: any) => ({
      type: "Blog Post",
      name: item.title,
      time: item.createdAt,
      color: "text-amber-400",
    })) || []),
  ].sort((a, b) => b.time - a.time).slice(0, 5);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your admin panel. Manage your content below.</p>
      </motion.div>

      {/* Needs Attention Banner */}
      {totalPendingItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Needs Attention</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
              {totalPendingItems} items
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {newInboxItems > 0 && (
              <Link href="/admin/inbox" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Inbox className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">{newInboxItems} new inbox items</span>
              </Link>
            )}
            {pendingCommunity > 0 && (
              <Link href="/admin/community" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <UserPlus className="w-4 h-4 text-brand-light" />
                <span className="text-sm text-white">{pendingCommunity} invite requests</span>
              </Link>
            )}
            {pendingApprovals > 0 && (
              <Link href="/admin/community" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white">{pendingApprovals} pending approvals</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Client Projects Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Link
          href="/admin/projects"
          className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-200 group"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-0.5">Client Projects</h3>
            <p className="text-sm text-gray-400">
              {clientProjects?.length || 0} active projects - View and manage all client work
            </p>
          </div>
          <div className="text-orange-400 group-hover:translate-x-1 transition-transform">
            →
          </div>
        </Link>
      </motion.div>

      {/* Scheduler Widget */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <SchedulerWidget />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={stat.href}>
              <div className="glass-elevated rounded-2xl p-5 hover:border-white/20 transition-all duration-200 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.trend && stat.trend.trend > 0 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.trend.isUp ? "text-green-400" : "text-red-400"
                    }`}>
                      {stat.trend.isUp ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stat.trend.trend}%
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10"
      >
        <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/blog?action=new" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <PenLine className="w-8 h-8 text-amber-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">
                Write Blog Post
              </h3>
            </div>
          </Link>

          <Link href="/admin/portfolio?action=new" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <Plus className="w-8 h-8 text-pink-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">
                Add Project
              </h3>
            </div>
          </Link>

          <Link href="/admin/newsletter" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <Send className="w-8 h-8 text-brand-light mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">
                Send Newsletter
              </h3>
            </div>
          </Link>

          <Link href="/admin/inbox" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <UserPlus className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">
                Add Lead
              </h3>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10"
      >
        <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">Recent Activity</h2>
        <div className="glass-elevated rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${activity.color} mb-1`}>
                        {activity.type}
                      </p>
                      <p className="text-white text-sm truncate">{activity.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.time).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" /> Pro Tip
        </h3>
        <p className="text-gray-400 text-sm">
          Check the &quot;Needs Attention&quot; banner above for items requiring your action. You can also use Settings to test your email configuration.
        </p>
      </motion.div>
    </div>
  );
}
