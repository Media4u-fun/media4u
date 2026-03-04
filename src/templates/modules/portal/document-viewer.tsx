"use client";

import { FileText, Download, Eye } from "lucide-react";

interface Document {
  _id: string;
  title: string;
  type: "invoice" | "contract" | "proposal" | "receipt";
  status: "draft" | "sent" | "viewed" | "signed";
  amount?: number;
  fileUrl?: string;
  createdAt: number;
}

interface DocumentViewerProps {
  documents: Document[];
  onView?: (docId: string) => void;
  onDownload?: (docId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice",
  contract: "Contract",
  proposal: "Proposal",
  receipt: "Receipt",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-zinc-500",
  sent: "text-blue-400",
  viewed: "text-amber-400",
  signed: "text-green-400",
};

export function DocumentViewer({
  documents,
  onView,
  onDownload,
}: DocumentViewerProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05]">
              <FileText className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{doc.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-500">
                  {TYPE_LABELS[doc.type]}
                </span>
                <span className={`text-xs ${STATUS_COLORS[doc.status]}`}>
                  {doc.status}
                </span>
                {doc.amount && (
                  <span className="text-xs text-zinc-500">
                    ${(doc.amount / 100).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onView?.(doc._id)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            {doc.fileUrl && (
              <button
                onClick={() => onDownload?.(doc._id)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
