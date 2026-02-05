/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Mail,
  Inbox,
  FileText,
  Image as ImageIcon,
  PenLine,
  Plus,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const contactSubmissions = useQuery(api.contactSubmissions.getContactSubmissions, {});
  const subscriberCount = useQuery(api.newsletter.getSubscriberCount, {});
  const blogPosts = useQuery(api.blog.getAllPosts, {});
  const projects = useQuery(api.portfolio.getAllProjects);
  const projectRequests = useQuery(api.projectRequests.getProjectRequests, {});

  // Calculate trends (comparing recent activity)
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

  const contactTrend = calculateTrend(contactSubmissions);
  const blogTrend = calculateTrend(blogPosts);
  const projectTrend = calculateTrend(projects);

  const stats = [
    {
      label: "Contact Submissions",
      value: contactSubmissions?.length || 0,
      href: "/admin/contacts",
      icon: Mail,
      color: "from-blue-500 to-cyan-500",
      trend: contactTrend,
    },
    {
      label: "Newsletter Subscribers",
      value: subscriberCount || 0,
      href: "/admin/newsletter",
      icon: Inbox,
      color: "from-purple-500 to-pink-500",
      trend: { trend: 0, isUp: false },
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
      value: projects?.length || 0,
      href: "/admin/portfolio",
      icon: ImageIcon,
      color: "from-emerald-500 to-teal-500",
      trend: projectTrend,
    },
  ];

  // Get recent activity
  const recentActivity = [
    ...(contactSubmissions?.slice(0, 3).map((item: any) => ({
      type: "Contact",
      name: item.name,
      time: item.createdAt,
      color: "text-blue-400",
    })) || []),
    ...(projectRequests?.slice(0, 3).map((item: any) => ({
      type: "Project Request",
      name: item.name,
      time: item.createdAt,
      color: "text-cyan-400",
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
        className="mb-12"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your admin panel. Manage your content below.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <div className="glass-elevated rounded-2xl p-6 hover:border-white/20 transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className="w-10 h-10 text-white" />
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
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-display font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/blog?action=new" className="group">
            <div className="glass-elevated rounded-2xl p-6 hover:border-white/20 transition-all duration-200">
              <PenLine className="w-10 h-10 text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                Create Blog Post
              </h3>
              <p className="text-gray-400 text-sm">Write and publish a new blog post</p>
            </div>
          </Link>

          <Link href="/admin/portfolio?action=new" className="group">
            <div className="glass-elevated rounded-2xl p-6 hover:border-white/20 transition-all duration-200">
              <Plus className="w-10 h-10 text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                Add Project
              </h3>
              <p className="text-gray-400 text-sm">Add a new portfolio project</p>
            </div>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-display font-bold mb-6">Recent Activity</h2>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" /> Tip
        </h3>
        <p className="text-gray-400 text-sm">
          Use the sidebar navigation to manage your content. All changes are saved automatically to the database.
        </p>
      </motion.div>
    </div>
  );
}
