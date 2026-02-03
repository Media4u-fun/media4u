/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Download, Send, Calendar, Save, Plus, Trash2, Eye } from "lucide-react";
import NewsletterEditor from "@/components/admin/NewsletterEditor";

interface NewsletterFormData {
  subject: string;
  content: string;
}

interface Newsletter extends NewsletterFormData {
  _id: string;
  status: "draft" | "scheduled" | "sent";
  scheduledFor?: number;
  sentAt?: number;
  createdAt: number;
  updatedAt: number;
  recipientCount?: number;
  successCount?: number;
  errorCount?: number;
}

type FilterStatus = "all" | "draft" | "scheduled" | "sent";

export default function NewsletterAdminPage() {
  const newsletters = useQuery(api.newsletters.getAllNewsletters, {});
  const subscribers = useQuery(api.newsletter.getNewsletterSubscribers, {
    unsubscribedOnly: false,
  });
  const createNewsletter = useMutation(api.newsletters.createNewsletter);
  const updateNewsletter = useMutation(api.newsletters.updateNewsletter);
  const deleteNewsletter = useMutation(api.newsletters.deleteNewsletter);
  const scheduleNewsletter = useMutation(api.newsletters.scheduleNewsletter);
  const sendNewsletterNow = useAction(api.newsletters.sendNewsletterNow);
  const unsubscribe = useMutation(api.newsletter.unsubscribeFromNewsletter);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [formData, setFormData] = useState<NewsletterFormData>({
    subject: "",
    content: "",
  });
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const activeSubscribers = subscribers?.filter((s: any) => !s.unsubscribed) || [];
  const unsubscribedList = subscribers?.filter((s: any) => s.unsubscribed) || [];

  const filteredNewsletters =
    filterStatus === "all"
      ? newsletters
      : newsletters?.filter((n: any) => n.status === filterStatus);

  function handleNewNewsletter() {
    setIsCreating(true);
    setSelectedId(null);
    setFormData({
      subject: "",
      content: "<p>Start writing your newsletter...</p>",
    });
    setScheduledDate("");
    setScheduledTime("");
  }

  function handleSelectNewsletter(newsletter: Newsletter) {
    setSelectedId(newsletter._id);
    setIsCreating(false);
    setFormData({
      subject: newsletter.subject,
      content: newsletter.content,
    });
    setScheduledDate("");
    setScheduledTime("");
  }

  async function handleSaveDraft() {
    if (!formData.subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    try {
      if (isCreating) {
        const id = await createNewsletter(formData);
        setSelectedId(id as string);
        setIsCreating(false);
      } else if (selectedId) {
        await updateNewsletter({
          id: selectedId as Id<"newsletters">,
          ...formData,
        });
      }
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save draft");
    }
  }

  async function handleSchedule() {
    if (!selectedId || isCreating) {
      alert("Please save draft first");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      alert("Please select date and time");
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).getTime();

    if (scheduledFor <= Date.now()) {
      alert("Scheduled time must be in the future");
      return;
    }

    try {
      await scheduleNewsletter({
        id: selectedId as Id<"newsletters">,
        scheduledFor,
      });
      alert("Newsletter scheduled successfully!");
      setScheduledDate("");
      setScheduledTime("");
    } catch (error) {
      console.error("Failed to schedule:", error);
      alert("Failed to schedule newsletter");
    }
  }

  async function handleSendNow() {
    if (!selectedId || isCreating) {
      alert("Please save draft first");
      return;
    }

    if (
      !confirm(
        `Send this newsletter to ${activeSubscribers.length} subscribers now?`
      )
    ) {
      return;
    }

    setIsSending(true);
    try {
      const result = await sendNewsletterNow({
        newsletterId: selectedId as Id<"newsletters">,
      });
      alert(
        `Newsletter sent! ${result.successCount} successful, ${result.errorCount} failed.`
      );
    } catch (error) {
      console.error("Failed to send:", error);
      alert("Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !confirm("Delete this draft?")) return;

    try {
      await deleteNewsletter({ id: selectedId as Id<"newsletters"> });
      setSelectedId(null);
      setIsCreating(false);
      setFormData({ subject: "", content: "" });
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete newsletter");
    }
  }

  function copyToClipboard(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function exportCSV() {
    if (!activeSubscribers.length) return;

    const csv = ["Email", "Subscribed Date"]
      .concat(
        activeSubscribers.map(
          (s: any) =>
            `"${s.email}","${new Date(s.subscribedAt).toLocaleDateString()}"`
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectedNewsletter = selectedId
    ? newsletters?.find((n: any) => n._id === selectedId)
    : null;

  const canEdit = isCreating || selectedNewsletter?.status === "draft";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Newsletter Management</h1>
        <p className="text-gray-400">Create, schedule, and send newsletters to your subscribers</p>
      </motion.div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Sidebar - Newsletter List */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-elevated rounded-2xl overflow-hidden"
          >
            {/* Filter Tabs */}
            <div className="p-4 border-b border-white/10 flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filterStatus === "all"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "hover:bg-white/5 text-gray-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("draft")}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filterStatus === "draft"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "hover:bg-white/5 text-gray-400"
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilterStatus("scheduled")}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filterStatus === "scheduled"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "hover:bg-white/5 text-gray-400"
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setFilterStatus("sent")}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filterStatus === "sent"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "hover:bg-white/5 text-gray-400"
                }`}
              >
                Sent
              </button>
            </div>

            {/* New Newsletter Button */}
            <div className="p-4 border-b border-white/10">
              <button
                onClick={handleNewNewsletter}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Newsletter
              </button>
            </div>

            {/* Newsletter List */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredNewsletters?.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No newsletters found</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredNewsletters?.map((newsletter: any) => (
                    <button
                      key={newsletter._id}
                      onClick={() => handleSelectNewsletter(newsletter)}
                      className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${
                        selectedId === newsletter._id ? "bg-white/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white line-clamp-1">
                          {newsletter.subject || "Untitled"}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            newsletter.status === "draft"
                              ? "bg-gray-500/20 text-gray-400"
                              : newsletter.status === "scheduled"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {newsletter.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {newsletter.status === "sent" && newsletter.sentAt
                          ? `Sent ${new Date(newsletter.sentAt).toLocaleDateString()}`
                          : newsletter.status === "scheduled" && newsletter.scheduledFor
                          ? `Scheduled for ${new Date(newsletter.scheduledFor).toLocaleDateString()}`
                          : `Updated ${new Date(newsletter.updatedAt).toLocaleDateString()}`}
                      </p>
                      {newsletter.status === "sent" && (
                        <p className="text-xs text-gray-500 mt-1">
                          {newsletter.successCount}/{newsletter.recipientCount} sent
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Newsletter Editor */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-elevated rounded-2xl p-6"
          >
            {!selectedId && !isCreating ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg mb-2">No newsletter selected</p>
                <p className="text-sm">Create a new newsletter or select one from the list</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Subject Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    disabled={!canEdit}
                    placeholder="Enter newsletter subject..."
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  {canEdit ? (
                    <NewsletterEditor
                      content={formData.content}
                      onChange={(html) => setFormData({ ...formData, content: html })}
                    />
                  ) : (
                    <div className="border border-white/10 rounded-lg p-4 bg-dark-bg/50 min-h-[400px]">
                      <div
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  )}
                </div>

                {/* Scheduling */}
                {canEdit && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Schedule Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Schedule Time
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                )}

                {/* Stats for sent newsletters */}
                {selectedNewsletter?.status === "sent" && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-dark-bg/50 rounded-lg border border-white/10">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Recipients</p>
                      <p className="text-lg font-bold text-white">
                        {selectedNewsletter.recipientCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Successful</p>
                      <p className="text-lg font-bold text-green-400">
                        {selectedNewsletter.successCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Failed</p>
                      <p className="text-lg font-bold text-red-400">
                        {selectedNewsletter.errorCount}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>

                  {canEdit && (
                    <>
                      <button
                        onClick={handleSaveDraft}
                        className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-2 border border-cyan-500/50"
                      >
                        <Save className="w-4 h-4" /> Save Draft
                      </button>

                      <button
                        onClick={handleSchedule}
                        disabled={!scheduledDate || !scheduledTime}
                        className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Calendar className="w-4 h-4" /> Schedule
                      </button>

                      <button
                        onClick={handleSendNow}
                        disabled={isSending}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        {isSending ? "Sending..." : "Send Now"}
                      </button>

                      {!isCreating && (
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2 border border-red-500/50 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Draft
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Subscribers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-bold">Subscribers</h2>
          <button
            onClick={exportCSV}
            disabled={activeSubscribers.length === 0}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors border border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-elevated rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Active Subscribers</p>
            <p className="text-4xl font-bold text-cyan-400">{activeSubscribers.length}</p>
          </div>
          <div className="glass-elevated rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Unsubscribed</p>
            <p className="text-4xl font-bold text-gray-400">{unsubscribedList.length}</p>
          </div>
        </div>

        {/* Active Subscribers List */}
        <div className="glass-elevated rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Active Subscribers</h3>
          </div>
          {activeSubscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No active subscribers yet</div>
          ) : (
            <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
              {activeSubscribers.map((subscriber: any) => (
                <div
                  key={subscriber._id}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{subscriber.email}</p>
                    <p className="text-xs text-gray-400">
                      Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(subscriber.email)}
                      className="px-3 py-1 rounded text-sm bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedEmail === subscriber.email ? "✓ Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => unsubscribe({ email: subscriber.email })}
                      className="px-3 py-1 rounded text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Unsubscribe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-dark-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-dark-card z-10">
              <h3 className="text-xl font-bold text-white">Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 pb-4 border-b border-white/10">
                <p className="text-sm text-gray-400 mb-1">Subject:</p>
                <p className="text-lg font-semibold text-white">{formData.subject}</p>
              </div>
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
