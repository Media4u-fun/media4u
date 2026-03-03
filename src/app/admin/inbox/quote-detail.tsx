"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Phone, Mail, Briefcase, Building2, DollarSign, Trash2, FolderPlus, ArrowLeft } from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

type QuoteStatus = "new" | "contacted" | "quoted" | "closed";

const STATUS_COLORS: Record<QuoteStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quoted: "bg-brand-dark/20 text-brand-light border-brand-dark/30",
  closed: "bg-green-500/20 text-green-400 border-green-500/30",
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  closed: "Closed",
};

type QuoteDetailProps = {
  data: Doc<"quoteRequests">;
  onClose: () => void;
};

export function QuoteDetail({ data, onClose }: QuoteDetailProps) {
  const updateStatus = useMutation(api.quoteRequests.updateQuoteRequestStatus);
  const deleteQuote = useMutation(api.quoteRequests.deleteQuoteRequest);
  const convertToProject = useMutation(api.quoteRequests.createProjectFromQuoteRequest);
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  async function handleStatusChange(status: QuoteStatus) {
    await updateStatus({ id: data._id as Id<"quoteRequests">, status });
  }

  async function handleDelete() {
    if (confirm("Delete this quote request?")) {
      await deleteQuote({ id: data._id as Id<"quoteRequests"> });
      onClose();
    }
  }

  async function handleConvert() {
    if (confirm("Convert this quote request to a project?")) {
      await convertToProject({ quoteId: data._id as Id<"quoteRequests"> });
      onClose();
      alert("Project created successfully!");
    }
  }

  return (
    <div className="glass-elevated rounded-2xl p-6 space-y-6">
      <button
        onClick={onClose}
        className="lg:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
        <p className="text-xl font-semibold text-white">{data.name}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
          <a href={`tel:${data.phone}`} className="text-brand-light hover:text-brand-light flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {data.phone}
          </a>
        </div>
        {data.email && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
            <button
              onClick={() => setIsReplyModalOpen(true)}
              className="text-brand-light hover:text-brand-light flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              {data.email}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Service Needed</p>
          <p className="text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-light" />
            {data.issueType}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Business Type</p>
          <p className="text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            {data.propertyType}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Zip Code</p>
          <p className="text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            {data.zipCode}
          </p>
        </div>
      </div>

      {data.description && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
          <p className="text-gray-300 whitespace-pre-wrap">{data.description}</p>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Submitted</p>
        <p className="text-white">{new Date(data.createdAt).toLocaleString()}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
        <div className="flex gap-2 flex-wrap">
          {(["new", "contacted", "quoted", "closed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                data.status === status
                  ? STATUS_COLORS[status] + " border"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="w-full px-4 py-3 rounded-lg bg-brand-light/10 text-brand-light hover:bg-brand-light/20 transition-all border border-brand-light/30 font-medium flex items-center justify-center gap-2"
      >
        <FolderPlus className="w-4 h-4" />
        Convert to Project
      </button>

      <button
        onClick={handleDelete}
        className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Quote Request
      </button>

      {data.email && (
        <EmailReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          recipientEmail={data.email}
          recipientName={data.name}
          subject={`Re: Quote Request - ${data.issueType}`}
          onSend={async (toEmail, subject, message, attachments) => {
            await sendEmailReply({ to: toEmail, subject, message, recipientName: data.name || "", attachments });
          }}
        />
      )}
    </div>
  );
}
