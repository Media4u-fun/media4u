/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Bell, CheckCheck, Eye, ExternalLink, Trash2, Filter, CalendarDays } from "lucide-react";
import Link from "next/link";

type ActivityType = "vault_updated" | "note_added" | "project_updated";

const activityIcons: Record<ActivityType, string> = {
  vault_updated: "🔐",
  note_added: "📝",
  project_updated: "✏️",
};

const activityColors: Record<ActivityType, string> = {
  vault_updated: "bg-brand-dark/20 text-brand-light border-brand-dark/30",
  note_added: "bg-brand-light/20 text-brand-light border-brand-light/30",
  project_updated: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function NotificationsPage() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const activities = useQuery(api.clientActivity.getAllActivities, convexIsAdmin === true ? {} : "skip");
  const markAsRead = useMutation(api.clientActivity.markAsRead);
  const markAllAsRead = useMutation(api.clientActivity.markAllAsRead);
  const deleteActivity = useMutation(api.clientActivity.deleteActivity);

  // Reminders tab
  const reminders = useQuery(api.adminNotifications.getAll, convexIsAdmin === true ? {} : "skip");
  const markReminderRead = useMutation(api.adminNotifications.markAsRead);
  const markAllRemindersRead = useMutation(api.adminNotifications.markAllAsRead);
  const deleteReminder = useMutation(api.adminNotifications.deleteNotification);
  const remindersUnread = reminders?.filter((r) => !r.isRead).length || 0;

  const [tab, setTab] = useState<"client" | "reminders">("client");
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Notifications</h1>
        <p className="text-gray-400">Client updates and admin reminders</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Unread Updates", value: unreadCount, color: "text-yellow-400" },
          { label: "Total Updates", value: activities?.length ?? 0, color: "text-brand-light" },
          { label: "Unread Reminders", value: remindersUnread, color: "text-orange-400" },
          { label: "Total Reminders", value: reminders?.length ?? 0, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="glass-elevated rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("client")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "client" ? "bg-brand/20 text-brand-light border border-brand/40" : "text-gray-400 hover:text-white bg-white/5 border border-white/10"}`}
        >
          <Bell className="w-4 h-4" />
          Client Updates
        </button>
        <button
          onClick={() => setTab("reminders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "reminders" ? "bg-brand/20 text-brand-light border border-brand/40" : "text-gray-400 hover:text-white bg-white/5 border border-white/10"}`}
        >
          <CalendarDays className="w-4 h-4" />
          Reminders
          {remindersUnread > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{remindersUnread}</span>
          )}
        </button>
      </div>

      {/* Reminders tab */}
      {tab === "reminders" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Calendar Reminders</h2>
            {remindersUnread > 0 && (
              <button
                onClick={() => markAllRemindersRead()}
                className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50 text-sm font-medium flex items-center gap-2 transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
          {!reminders || reminders.length === 0 ? (
            <div className="glass-elevated rounded-2xl p-8 text-center text-gray-500">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No reminders yet. Set a reminder when adding a calendar event.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => (
                <div key={r._id} className={`glass-elevated rounded-xl p-4 flex items-start gap-3 border ${r.isRead ? "border-white/5 opacity-60" : "border-brand/30"}`}>
                  <div className="text-2xl mt-0.5">🔔</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!r.isRead && (
                      <button onClick={() => markReminderRead({ notificationId: r._id })} title="Mark read" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-green-400">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {r.appointmentId && (
                      <Link href="/admin/appointments" title="View event" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-brand-light">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <button onClick={() => deleteReminder({ notificationId: r._id })} title="Delete" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client Updates tab */}
      {tab === "client" && (
      <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
              Client Updates
            </h1>
            <p className="text-gray-400">
              Track client activity and changes in their projects
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 border border-brand-light/50 text-sm font-medium flex items-center gap-2 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass-elevated rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {activities?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Total Notifications</div>
          </div>
          <div className="glass-elevated rounded-xl p-4 border border-brand-light/30">
            <div className="text-2xl font-bold text-brand-light mb-1">
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
                ? "bg-brand-light text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-brand-light text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "read"
                ? "bg-brand-light text-white"
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
                !activity.read ? "border border-brand-light/30" : ""
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
                          className="text-brand-light hover:text-brand-light transition-colors flex items-center gap-1"
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
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
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
      )}
    </div>
  );
}
