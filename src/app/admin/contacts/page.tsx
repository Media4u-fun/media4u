/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";

type ContactStatus = "new" | "read" | "replied";

const statusColors: Record<ContactStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  read: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  replied: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusLabels: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

export default function ContactsAdminPage() {
  const submissions = useQuery(api.contactSubmissions.getContactSubmissions, {});
  const updateStatus = useMutation(api.contactSubmissions.updateContactStatus);
  const deleteSubmission = useMutation(api.contactSubmissions.deleteContactSubmission);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "all">("all");

  const filtered =
    submissions && filterStatus !== "all"
      ? submissions.filter((s: any) => s.status === filterStatus)
      : submissions;

  const selected = submissions?.find((s: any) => s._id === selectedId);

  async function handleStatusChange(id: Id<"contactSubmissions">, newStatus: ContactStatus) {
    await updateStatus({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"contactSubmissions">) {
    if (confirm("Delete this submission?")) {
      await deleteSubmission({ id });
      setSelectedId(null);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Contact Submissions</h1>
        <p className="text-gray-400">Manage form submissions from your website</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {(["all", "new", "read", "replied"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {filtered?.length || 0} Submissions
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
              {filtered?.map((submission: any) => (
                <motion.button
                  key={submission._id}
                  onClick={() => setSelectedId(submission._id)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === submission._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">{submission.name}</p>
                  <p className="text-xs text-gray-400 truncate">{submission.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[submission.status as ContactStatus]}`}
                    >
                      {statusLabels[submission.status as ContactStatus]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                <p className="text-xl font-semibold text-white">{selected.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                <a href={`mailto:${selected.email}`} className="text-cyan-400 hover:text-cyan-300">
                  {selected.email}
                </a>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Service</p>
                <p className="text-white">{selected.service}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Message</p>
                <p className="text-gray-300 whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
                <div className="flex gap-2">
                  {(["new", "read", "replied"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusChange(selected._id, status)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selected.status === status
                          ? statusColors[status] + " border"
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDelete(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium"
              >
                Delete Submission
              </button>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select a submission to view details</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
