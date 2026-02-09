/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Search, Mail, FolderPlus, Briefcase, Calendar, Trash2 } from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

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
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);
  const convertToProject = useMutation(api.contactSubmissions.createProjectFromContact);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // Filter by status first, then search
  let filtered = submissions;

  if (filterStatus !== "all" && filtered) {
    filtered = filtered.filter((s: any) => s.status === filterStatus);
  }

  if (searchQuery.trim() && filtered) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((s: any) =>
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  }

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

  async function handleSendReply(message: string, attachments?: Array<{ filename: string; content: string }>) {
    if (!selected) return;

    await sendEmailReply({
      to: selected.email,
      subject: `Re: ${selected.service} Inquiry`,
      message,
      recipientName: selected.name,
      attachments,
    });

    // Mark as replied
    await handleStatusChange(selected._id, "replied");
  }

  async function handleConvertToProject(id: Id<"contactSubmissions">) {
    if (confirm("Convert this contact submission to a project?")) {
      await convertToProject({ contactId: id });
      setSelectedId(null);
      alert("Project created successfully!");
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

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

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
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filtered?.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No contact submissions yet
                </div>
              ) : (
              filtered?.map((submission: any) => (
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
              ))
              )}
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {selected.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setIsReplyModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors border border-cyan-500/50 text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Reply via Email
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Service Requested</p>
                  <p className="text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    {selected.service}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Submitted</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Message</p>
                <p className="text-gray-300 whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
                <div className="flex gap-2 flex-wrap">
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
                onClick={() => handleConvertToProject(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all border border-cyan-500/30 font-medium flex items-center justify-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Convert to Project
              </button>

              <button
                onClick={() => handleDelete(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
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

      {/* Email Reply Modal */}
      {selected && (
        <EmailReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          recipientEmail={selected.email}
          recipientName={selected.name}
          subject={`Re: ${selected.service} Inquiry`}
          onSend={handleSendReply}
        />
      )}
    </div>
  );
}
