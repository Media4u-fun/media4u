/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Bell, CheckCheck, Eye, ExternalLink, Trash2, Filter } from "lucide-react";
import Link from "next/link";

type ActivityType = "vault_updated" | "note_added" | "project_updated";

const activityIcons: Record<ActivityType, string> = {
  vault_updated: "🔐",
  note_added: "📝",
  project_updated: "✏️",
};

const activityColors: Record<ActivityType, string> = {
  vault_updated: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  note_added: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  project_updated: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function NotificationsPage() {
  const activities = useQuery(api.clientActivity.getAllActivities);
  const markAsRead = useMutation(api.clientActivity.markAsRead);
  const markAllAsRead = useMutation(api.clientActivity.markAllAsRead);
  const deleteActivity = useMutation(api.clientActivity.deleteActivity);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredActivities = activities?.filter((activity) => {
    if (filter === "unread") return !activity.read;
    if (filter === "read") return activity.read;
    return true;
  });

  const unreadCount = activities?.filter((a) => !a.read).length || 0;

  async function handleMarkAsRead(id: Id<"clientActivity">) {
    await markAsRead({ id });
  }

  async function handleMarkAllAsRead() {
    if (confirm("Mark all notifications as read?")) {
      await markAllAsRead();
    }
  }

  async function handleDelete(id: Id<"clientActivity">) {
    if (confirm("Delete this notification?")) {
      await deleteActivity({ id });
    }
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Client Updates
            </h1>
            <p className="text-gray-400">
              Track client activity and changes in their projects
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50 text-sm font-medium flex items-center gap-2 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-elevated rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {activities?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Total Notifications</div>
          </div>
          <div className="glass-elevated rounded-xl p-4 border border-cyan-500/30">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {unreadCount}
            </div>
            <div className="text-sm text-gray-400">Unread</div>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {activities?.filter((a) => a.read).length || 0}
            </div>
            <div className="text-sm text-gray-400">Read</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-cyan-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-cyan-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "read"
                ? "bg-cyan-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Read
          </button>
        </div>
      </motion.div>

      {/* Activities List */}
      <div className="space-y-3">
        {filteredActivities && filteredActivities.length > 0 ? (
          filteredActivities.map((activity: any, idx) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`group glass-elevated rounded-xl p-5 hover:scale-[1.01] transition-all ${
                !activity.read ? "border border-cyan-500/30" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  activityColors[activity.activityType as ActivityType]
                }`}>
                  {activityIcons[activity.activityType as ActivityType]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                        <span>{activity.userName}</span>
                        <span className="text-gray-600">•</span>
                        <Link
                          href={`/admin/projects?id=${activity.projectId}`}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                        >
                          {activity.projectName}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <span className="text-gray-600">•</span>
                        <span>{new Date(activity.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!activity.read && (
                        <button
                          onClick={() => handleMarkAsRead(activity._id)}
                          className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-all"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(activity._id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="mt-2 p-3 rounded-lg bg-white/5 text-xs text-gray-400">
                      {activity.metadata.fieldName && (
                        <div>
                          <span className="font-medium">Field:</span> {activity.metadata.fieldName}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass-elevated rounded-xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {filter === "all"
                ? "No notifications yet"
                : filter === "unread"
                  ? "No unread notifications"
                  : "No read notifications"}
            </p>
            <p className="text-gray-500 text-sm">
              Client activity will appear here when they update their projects
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
