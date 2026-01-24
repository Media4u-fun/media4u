"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";

export default function AdminDashboard() {
  const contactSubmissions = useQuery(api.contactSubmissions.getContactSubmissions, {});
  const subscriberCount = useQuery(api.newsletter.getSubscriberCount, {});
  const blogPosts = useQuery(api.blog.getAllPosts, {});
  const projects = useQuery(api.portfolio.getAllProjects);

  const stats = [
    {
      label: "Contact Submissions",
      value: contactSubmissions?.length || 0,
      href: "/admin/contacts",
      icon: "📧",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Newsletter Subscribers",
      value: subscriberCount || 0,
      href: "/admin/newsletter",
      icon: "📬",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Blog Posts",
      value: blogPosts?.length || 0,
      href: "/admin/blog",
      icon: "📝",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Portfolio Projects",
      value: projects?.length || 0,
      href: "/admin/portfolio",
      icon: "🖼️",
      color: "from-emerald-500 to-teal-500",
    },
  ];

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
                  <div className={`text-4xl`}>{stat.icon}</div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">
                    View
                  </span>
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
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                Create Blog Post
              </h3>
              <p className="text-gray-400 text-sm">Write and publish a new blog post</p>
            </div>
          </Link>

          <Link href="/admin/portfolio?action=new" className="group">
            <div className="glass-elevated rounded-2xl p-6 hover:border-white/20 transition-all duration-200">
              <div className="text-4xl mb-3">➕</div>
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
        className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-lg font-semibold mb-2">💡 Tip</h3>
        <p className="text-gray-400 text-sm">
          Use the sidebar navigation to manage your content. All changes are saved automatically to the database.
        </p>
      </motion.div>
    </div>
  );
}
