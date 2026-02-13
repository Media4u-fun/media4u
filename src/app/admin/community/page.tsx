/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import {
  Send,
  Users,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  RefreshCw,
  ExternalLink,
  Globe,
  UserPlus,
  X,
  Newspaper,
  Pencil,
} from "lucide-react";

type TabType = "requests" | "invites" | "pending" | "members";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  revoked: "bg-red-500/20 text-red-400 border-red-500/30",
  expired: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function CommunityAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Get pending invite requests count for badge
  const inviteRequests = useQuery(api.community.getInviteRequests);
  const pendingRequestsCount = inviteRequests?.filter(r => r.status === "pending").length || 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">VR Multiverse Community</h1>
        <p className="text-gray-400">Manage invites and community members</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "requests"
              ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
              : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Requests
          {pendingRequestsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
              {pendingRequestsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("invites")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "invites"
              ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
              : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <Mail className="w-4 h-4" />
          Invites
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "pending"
              ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
              : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Approval
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "members"
              ? "bg-brand-light/30 text-brand-light border border-brand-light/50"
              : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <Users className="w-4 h-4" />
          Members
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && <RequestsTab />}
      {activeTab === "invites" && <InvitesTab onOpenInviteModal={() => setIsInviteModalOpen(true)} />}
      {activeTab === "pending" && <PendingTab />}
      {activeTab === "members" && <MembersTab />}

      {/* Invite Modal */}
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
}

// ============================================
// REQUESTS TAB (Public invite requests)
// ============================================

function RequestsTab() {
  const requests = useQuery(api.community.getInviteRequests);
  const updateStatus = useMutation(api.community.updateInviteRequestStatus);
  const createInvite = useMutation(api.community.createInvite);
  const sendInviteEmail = useAction(api.community.sendInviteEmail);
  const [processing, setProcessing] = useState<string | null>(null);

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const processedRequests = requests?.filter(r => r.status !== "pending") || [];

  async function handleApproveAndInvite(request: any) {
    if (!confirm(`Send an invite to ${request.name} (${request.email})?`)) return;

    setProcessing(request._id);
    try {
      // Create the invite
      const result = await createInvite({
        email: request.email,
        name: request.name,
        message: "Welcome! Your request to join the VR Multiverse Community has been approved.",
      });

      // Send the email
      await sendInviteEmail({
        email: request.email,
        name: request.name,
        token: result.token,
        message: "Welcome! Your request to join the VR Multiverse Community has been approved.",
      });

      // Update request status
      await updateStatus({ id: request._id, status: "invited" });

      alert(`Invite sent to ${request.email}!`);
    } catch (err: any) {
      alert(err.message || "Failed to send invite");
    }
    setProcessing(null);
  }

  async function handleDecline(request: any) {
    if (!confirm(`Decline request from ${request.name}?`)) return;
    await updateStatus({ id: request._id, status: "declined" });
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-brand-light" />
          Pending Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-gray-400">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-white">{request.name}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-brand-light mb-2">{request.email}</p>
                    {request.message && (
                      <p className="text-sm text-gray-400 bg-white/5 rounded-lg p-3 italic">
                        &quot;{request.message}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleApproveAndInvite(request)}
                      disabled={processing === request._id}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processing === request._id ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve & Invite
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDecline(request)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Previously Processed</h3>
          <div className="space-y-2">
            {processedRequests.map((request) => (
              <div
                key={request._id}
                className="glass rounded-lg p-3 flex items-center justify-between opacity-60"
              >
                <div>
                  <span className="text-white">{request.name}</span>
                  <span className="text-gray-500 mx-2">-</span>
                  <span className="text-gray-400 text-sm">{request.email}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  request.status === "invited"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// INVITES TAB
// ============================================

function InvitesTab({ onOpenInviteModal }: { onOpenInviteModal: () => void }) {
  const invites = useQuery(api.community.getAllInvites);
  const revokeInvite = useMutation(api.community.revokeInvite);
  const resendInvite = useMutation(api.community.resendInvite);
  const sendInviteEmail = useAction(api.community.sendInviteEmail);
  const [resending, setResending] = useState<string | null>(null);

  async function handleResend(id: Id<"communityInvites">) {
    setResending(id);
    try {
      const result = await resendInvite({ id });
      await sendInviteEmail({
        email: result.email,
        name: result.name,
        token: result.token,
      });
      alert("Invite resent successfully!");
    } catch {
      alert("Failed to resend invite");
    }
    setResending(null);
  }

  async function handleRevoke(id: Id<"communityInvites">) {
    if (confirm("Revoke this invite?")) {
      await revokeInvite({ id });
    }
  }

  return (
    <div>
      {/* Send Invite Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={onOpenInviteModal}
          className="px-8 py-4 rounded-xl bg-brand-light text-white hover:bg-brand transition-all flex items-center gap-3 font-semibold text-lg shadow-lg shadow-brand-light/25 hover:shadow-brand-light/40 hover:scale-105"
        >
          <Send className="w-6 h-6" />
          Send Invite
        </button>
      </div>

      {/* Invites List */}
      <div className="glass-elevated rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <p className="text-sm font-semibold text-gray-300">
            {invites?.length || 0} Invites
          </p>
        </div>
        <div className="divide-y divide-white/10">
          {invites?.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No invites sent yet. Click &quot;Send Invite&quot; to get started.
            </div>
          ) : (
            invites?.map((invite: any) => (
              <div
                key={invite._id}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{invite.name}</p>
                  <p className="text-sm text-gray-400">{invite.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sent {new Date(invite.sentAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[invite.status]}`}
                  >
                    {invite.status}
                  </span>
                  {invite.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleResend(invite._id)}
                        disabled={resending === invite._id}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-brand-light hover:bg-brand-light/10 transition-all"
                        title="Resend invite"
                      >
                        <RefreshCw className={`w-4 h-4 ${resending === invite._id ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleRevoke(invite._id)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Revoke invite"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PENDING TAB
// ============================================

function PendingTab() {
  const pending = useQuery(api.community.getPendingSubmissions);
  const approveSubmission = useMutation(api.community.approveSubmission);
  const rejectSubmission = useMutation(api.community.rejectSubmission);

  async function handleApprove(id: Id<"communityMembers">) {
    if (confirm("Approve this submission?")) {
      await approveSubmission({ id });
      alert("Submission approved!");
    }
  }

  async function handleReject(id: Id<"communityMembers">) {
    if (confirm("Reject this submission? They can resubmit.")) {
      await rejectSubmission({ id });
    }
  }

  return (
    <div>
      {pending?.length === 0 ? (
        <div className="glass-elevated rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No pending submissions</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pending?.map((member: any) => (
            <div key={member._id} className="glass-elevated rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{member.worldName}</h3>
                  <p className="text-sm text-gray-400">
                    by {member.name} ({member.inviteEmail})
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(member._id)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all border border-green-500/30 font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(member._id)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{member.description}</p>

              {/* Images */}
              {member.images && member.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {member.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${member.worldName} ${idx + 1}`}
                      className="w-32 h-24 object-cover rounded-lg border border-white/10"
                    />
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex gap-4 text-sm">
                {member.multiverseUrl && (
                  <a
                    href={member.multiverseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-light hover:text-brand-light flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" /> Multiverse
                  </a>
                )}
                {member.websiteUrl && (
                  <a
                    href={member.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-light hover:text-brand-light flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MEMBERS TAB
// ============================================

function MembersTab() {
  const members = useQuery(api.community.getAllMembers);
  const toggleFeatured = useMutation(api.community.toggleFeatured);
  const deleteMember = useMutation(api.community.deleteMember);
  const addToNewsletter = useMutation(api.community.addMemberToNewsletter);
  const addAllToNewsletter = useMutation(api.community.addAllMembersToNewsletter);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  async function handleToggleFeatured(id: Id<"communityMembers">) {
    await toggleFeatured({ id });
  }

  async function handleDelete(id: Id<"communityMembers">) {
    if (confirm("Delete this community member?")) {
      await deleteMember({ id });
    }
  }

  async function handleAddToNewsletter(id: Id<"communityMembers">) {
    try {
      await addToNewsletter({ memberId: id });
      alert("Added to newsletter!");
    } catch (error: any) {
      alert(error.message || "Failed to add to newsletter");
    }
  }

  async function handleAddAllToNewsletter() {
    if (!confirm("Add all community members to the newsletter?")) return;
    setIsAddingAll(true);
    try {
      const result = await addAllToNewsletter();
      alert(`Added ${result.added} members to newsletter. ${result.skipped} were already subscribed.`);
    } catch (error: any) {
      alert(error.message || "Failed to add members");
    }
    setIsAddingAll(false);
  }

  const approvedMembers = members?.filter((m: any) => m.approved) || [];

  return (
    <div>
      {/* Header with Add All button */}
      {approvedMembers.length > 0 && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddAllToNewsletter}
            disabled={isAddingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-all border border-brand-light/30 disabled:opacity-50"
          >
            <Newspaper className="w-4 h-4" />
            {isAddingAll ? "Adding..." : "Add All to Newsletter"}
          </button>
        </div>
      )}

      {approvedMembers.length === 0 ? (
        <div className="glass-elevated rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No approved members yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {approvedMembers.map((member: any) => (
            <div key={member._id} className="glass-elevated rounded-2xl overflow-hidden">
              {/* Image */}
              {member.images && member.images[0] && (
                <div className="relative h-40">
                  <img
                    src={member.images[0]}
                    alt={member.worldName}
                    className="w-full h-full object-cover"
                  />
                  {member.featured && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1 border border-yellow-500/30">
                      <Star className="w-3 h-3" /> Featured
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{member.worldName}</h3>
                <p className="text-sm text-gray-400 mb-2">by {member.name}</p>
                <p className="text-sm text-gray-300 line-clamp-2 mb-4">{member.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleFeatured(member._id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                      member.featured
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-white/5 text-gray-400 hover:text-yellow-400 border border-white/10"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    {member.featured ? "Featured" : "Feature"}
                  </button>
                  <button
                    onClick={() => setEditingMember(member)}
                    className="px-3 py-2 rounded-lg bg-brand-dark/10 text-brand-light hover:bg-brand-dark/20 transition-all border border-brand-dark/30"
                    title="Edit Member"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddToNewsletter(member._id)}
                    className="px-3 py-2 rounded-lg bg-brand-light/10 text-brand-light hover:bg-brand-light/20 transition-all border border-brand-light/30"
                    title="Add to Newsletter"
                  >
                    <Newspaper className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

// ============================================
// INVITE MODAL
// ============================================

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const createInvite = useMutation(api.community.createInvite);
  const sendInviteEmail = useAction(api.community.sendInviteEmail);

  async function handleSend() {
    if (!name.trim() || !email.trim()) {
      alert("Please enter name and email");
      return;
    }

    setIsSending(true);
    try {
      const { token } = await createInvite({
        email: email.trim(),
        name: name.trim(),
        message: message.trim() || undefined,
      });

      await sendInviteEmail({
        email: email.trim(),
        name: name.trim(),
        token,
        message: message.trim() || undefined,
      });

      alert("Invite sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to send invite");
    }
    setIsSending(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-white/10 p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Send Community Invite</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Personal Message <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We loved seeing your VR city and would love to feature it..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-light text-white hover:bg-brand font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Invite
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// EDIT MEMBER MODAL
// ============================================

function EditMemberModal({ member, onClose }: { member: any; onClose: () => void }) {
  const [name, setName] = useState(member.name || "");
  const [worldName, setWorldName] = useState(member.worldName || "");
  const [description, setDescription] = useState(member.description || "");
  const [videoUrl, setVideoUrl] = useState(member.videoUrl || "");
  const [multiverseUrl, setMultiverseUrl] = useState(member.multiverseUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(member.websiteUrl || "");
  const [instagram, setInstagram] = useState(member.socialLinks?.instagram || "");
  const [youtube, setYoutube] = useState(member.socialLinks?.youtube || "");
  const [tiktok, setTiktok] = useState(member.socialLinks?.tiktok || "");
  const [isSaving, setIsSaving] = useState(false);

  const updateMember = useMutation(api.community.updateMember);

  async function handleSave() {
    if (!name.trim() || !worldName.trim() || !description.trim()) {
      alert("Name, World Name, and Description are required");
      return;
    }

    setIsSaving(true);
    try {
      await updateMember({
        id: member._id,
        name: name.trim(),
        worldName: worldName.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim() || undefined,
        multiverseUrl: multiverseUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        socialLinks: {
          instagram: instagram.trim() || undefined,
          youtube: youtube.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
        },
      });
      alert("Member updated successfully!");
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to update member");
    }
    setIsSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Community Member</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Creator Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">World Name</label>
              <input
                type="text"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
            />
          </div>

          {/* Links */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Links</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Multiverse URL</label>
                <input
                  type="url"
                  value={multiverseUrl}
                  onChange={(e) => setMultiverseUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Video Tour URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">YouTube</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TikTok</label>
                <input
                  type="url"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="https://tiktok.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand text-white hover:bg-brand-dark font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
