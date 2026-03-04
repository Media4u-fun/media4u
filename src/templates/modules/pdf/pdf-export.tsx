"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

interface PdfExportProps {
  documentTitle: string;
  onExport: () => Promise<string | void>; // Returns PDF URL or void
  variant?: "button" | "icon";
}

// PDF export button component.
// The actual PDF generation happens server-side (via Convex action or API route).
// This component just triggers the export and handles loading state.
export function PdfExport({
  documentTitle,
  onExport,
  variant = "button",
}: PdfExportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = await onExport();
      if (url && typeof window !== "undefined") {
        window.open(url, "_blank");
      }
    } finally {
      setExporting(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleExport}
        disabled={exporting}
        className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        title={`Export ${documentTitle} as PDF`}
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 text-sm bg-white/[0.05] border border-white/[0.06] rounded-lg text-zinc-300 hover:text-white hover:border-white/[0.12] transition-colors disabled:opacity-50"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Export PDF
    </button>
  );
}
