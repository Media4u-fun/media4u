"use client";

import { use } from "react";
import { getTemplate, templateRegistry } from "@/templates";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PublicTemplatePreviewPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = use(params);
  const template = getTemplate(industry);

  if (!template) {
    return (
      <div className="min-h-screen bg-[#141419] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-white mb-4">
            Template Not Found
          </h1>
          <p className="text-zinc-400 mb-6">
            No template exists for industry: &ldquo;{industry}&rdquo;
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            Available templates:{" "}
            {Object.keys(templateRegistry).join(", ") || "none"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const Template = template.component;

  return <Template />;
}
