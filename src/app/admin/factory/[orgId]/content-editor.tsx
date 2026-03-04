"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Save, Loader2, Check } from "lucide-react";

const EDITABLE_SECTIONS = [
  { key: "hero", label: "Hero Section", fields: ["headline", "subheadline", "ctaPrimary", "ctaSecondary"] },
  { key: "business", label: "Business Info", fields: ["name", "tagline", "phone", "email", "address"] },
  { key: "about", label: "About Section", fields: ["story", "mission"] },
] as const;

export function ContentEditor({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const allContent = useQuery(api.factory.getAllTemplateContent, { orgId });
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // Local edits (key = "sectionKey.fieldName")
  const [edits, setEdits] = useState<Record<string, string>>({});

  const getFieldValue = (sectionKey: string, fieldName: string): string => {
    const editKey = `${sectionKey}.${fieldName}`;
    if (edits[editKey] !== undefined) return edits[editKey];

    const sectionData = allContent?.[sectionKey] as Record<string, string> | undefined;
    return sectionData?.[fieldName] ?? "";
  };

  const setFieldValue = (sectionKey: string, fieldName: string, value: string) => {
    setEdits((prev) => ({ ...prev, [`${sectionKey}.${fieldName}`]: value }));
  };

  const handleSaveSection = async (sectionKey: string, fields: readonly string[]) => {
    setSaving(sectionKey);
    try {
      const existing = (allContent?.[sectionKey] as Record<string, string>) ?? {};
      const updated = { ...existing };
      for (const field of fields) {
        const editKey = `${sectionKey}.${field}`;
        if (edits[editKey] !== undefined) {
          updated[field] = edits[editKey];
        }
      }
      await updateContent({
        orgId,
        sectionKey,
        content: JSON.stringify(updated),
      });
      // Clear edits for this section
      const newEdits = { ...edits };
      for (const field of fields) {
        delete newEdits[`${sectionKey}.${field}`];
      }
      setEdits(newEdits);
      setSaved(sectionKey);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  if (allContent === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Edit the content for each section of this client&apos;s website. Changes are saved per section.
      </p>

      {EDITABLE_SECTIONS.map((section) => {
        const hasChanges = section.fields.some(
          (f) => edits[`${section.key}.${f}`] !== undefined
        );

        return (
          <div
            key={section.key}
            className="p-5 rounded-xl bg-white/[0.03] border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{section.label}</h3>
              <button
                onClick={() => handleSaveSection(section.key, section.fields)}
                disabled={!hasChanges || saving === section.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  saved === section.key
                    ? "bg-green-500/20 text-green-400"
                    : hasChanges
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                {saving === section.key ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : saved === section.key ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {saved === section.key ? "Saved" : "Save"}
              </button>
            </div>

            <div className="space-y-3">
              {section.fields.map((field) => {
                const value = getFieldValue(section.key, field);
                const isLong = field === "story" || field === "mission" || field === "subheadline";

                return (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    {isLong ? (
                      <textarea
                        value={value}
                        onChange={(e) => setFieldValue(section.key, field, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setFieldValue(section.key, field, e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
