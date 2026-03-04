"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Check, Loader2, Palette } from "lucide-react";
import { listSkins } from "@/templates/skins";

export function SkinPicker({ orgId }: { orgId: Id<"clientOrgs"> }) {
  const org = useQuery(api.factory.getClientOrg, { orgId });
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const skins = listSkins();
  const currentIndustry = org?.industry;

  const handleApplySkin = async (skinKey: string) => {
    setApplying(skinKey);
    try {
      const skin = skins.find((s) => s.key === skinKey);
      if (!skin) return;

      // Save the skin's default content as the org's template content
      await updateContent({
        orgId,
        sectionKey: "skin",
        content: JSON.stringify({
          key: skin.key,
          primaryColor: skin.primaryColor,
          secondaryColor: skin.secondaryColor,
          gradientFrom: skin.gradientFrom,
          gradientTo: skin.gradientTo,
        }),
      });

      // Save default services
      await updateContent({
        orgId,
        sectionKey: "services",
        content: JSON.stringify(skin.defaultServices),
      });

      // Save default process
      await updateContent({
        orgId,
        sectionKey: "process",
        content: JSON.stringify(skin.defaultProcess),
      });

      // Save default FAQs
      await updateContent({
        orgId,
        sectionKey: "faqs",
        content: JSON.stringify(skin.defaultFaqs),
      });

      // Save default business info
      await updateContent({
        orgId,
        sectionKey: "business",
        content: JSON.stringify({
          name: skin.defaultBusinessName,
          tagline: skin.defaultTagline,
        }),
      });

      setApplied(skinKey);
      setTimeout(() => setApplied(null), 2000);
    } finally {
      setApplying(null);
    }
  };

  // Color preview classes for each skin
  const skinColors: Record<string, { from: string; to: string }> = {
    "pool-service": { from: "from-cyan-500", to: "to-blue-600" },
    landscaping: { from: "from-green-500", to: "to-emerald-600" },
    hvac: { from: "from-orange-500", to: "to-amber-600" },
    plumbing: { from: "from-blue-500", to: "to-indigo-600" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="w-5 h-5 text-cyan-400" />
        <p className="text-sm text-gray-400">
          Choose an industry skin to apply default colors, icons, and content.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {skins.map((skin) => {
          const isCurrent = currentIndustry === skin.key;
          const colors = skinColors[skin.key] || { from: "from-gray-500", to: "to-gray-600" };

          return (
            <div
              key={skin.key}
              className={`rounded-xl border p-5 transition-all ${
                isCurrent
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {/* Color preview bar */}
              <div className={`h-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} mb-4`} />

              <h3 className="text-sm font-semibold text-white mb-1">{skin.name}</h3>
              <p className="text-xs text-gray-500 mb-1">
                {skin.defaultBusinessName}
              </p>
              <p className="text-xs text-gray-600 mb-4">
                {skin.defaultServices.length} services, {skin.defaultFaqs.length} FAQs
              </p>

              <button
                onClick={() => handleApplySkin(skin.key)}
                disabled={applying !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  applied === skin.key
                    ? "bg-green-500/20 text-green-400"
                    : isCurrent
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {applying === skin.key ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : applied === skin.key ? (
                  <Check className="w-3 h-3" />
                ) : isCurrent ? (
                  <Check className="w-3 h-3" />
                ) : null}
                {applied === skin.key
                  ? "Applied!"
                  : isCurrent
                  ? "Current Skin"
                  : "Apply Skin"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
