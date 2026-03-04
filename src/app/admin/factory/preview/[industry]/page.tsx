"use client";

import { use } from "react";
import { getTemplate, templateRegistry } from "@/templates";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TemplatePreviewPage({
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
            href="/admin/factory"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Factory
          </Link>
        </div>
      </div>
    );
  }

  const Template = template.component;

  return (
    <>
      {/* Admin preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 backdrop-blur-sm text-black text-center py-2 text-sm font-medium">
        Preview Mode - {template.name} Template
        <Link
          href="/admin/factory"
          className="ml-4 underline hover:no-underline"
        >
          Back to Factory
        </Link>
      </div>

      <div className="pt-10">
        <Template />
      </div>
    </>
  );
}
