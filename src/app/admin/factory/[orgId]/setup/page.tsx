"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Loader2, Check, ArrowRight, ArrowLeft, Palette,
  Building2, Type, Wrench, Image, Rocket,
} from "lucide-react";
import { listSkins } from "@/templates/skins";

const STEPS = [
  { key: "skin", label: "Industry Skin", icon: Palette },
  { key: "business", label: "Business Info", icon: Building2 },
  { key: "hero", label: "Hero Text", icon: Type },
  { key: "services", label: "Services", icon: Wrench },
  { key: "gallery", label: "Gallery", icon: Image },
  { key: "publish", label: "Review & Publish", icon: Rocket },
] as const;

type StepKey = typeof STEPS[number]["key"];

export default function SetupWizardPage() {
  const params = useParams() as { orgId: string };
  const router = useRouter();
  const orgId = params.orgId as Id<"clientOrgs">;

  const org = useQuery(api.factory.getClientOrg, { orgId });
  const allContent = useQuery(api.factory.getAllTemplateContent, { orgId });
  const updateContent = useMutation(api.factory.updateTemplateContent);
  const publishSite = useMutation(api.factory.publishSite);

  const [step, setStep] = useState<StepKey>("skin");
  const [saving, setSaving] = useState(false);

  // Local state for edits
  const [selectedSkin, setSelectedSkin] = useState(org?.industry || "pool-service");
  const [businessInfo, setBusinessInfo] = useState({
    name: "", phone: "", email: "", address: "",
  });
  const [heroInfo, setHeroInfo] = useState({
    headline: "", subheadline: "",
  });
  const [services, setServices] = useState<Array<{ title: string; description: string }>>([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ]);

  // Populate from Convex when data loads
  const contentMap = allContent as Record<string, Record<string, string>> | undefined;
  if (contentMap && !businessInfo.name && org) {
    const biz = contentMap.business || {};
    if (biz.name || org.name) {
      setBusinessInfo({
        name: biz.name || org.name || "",
        phone: biz.phone || "",
        email: biz.email || org.ownerEmail || "",
        address: biz.address || "",
      });
    }
    const hero = contentMap.hero || {};
    if (hero.headline) {
      setHeroInfo({ headline: hero.headline, subheadline: hero.subheadline || "" });
    }
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === step);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === STEPS.length - 1;

  const saveAndNext = async () => {
    setSaving(true);
    try {
      if (step === "business") {
        await updateContent({
          orgId,
          sectionKey: "business",
          content: JSON.stringify(businessInfo),
        });
      } else if (step === "hero") {
        await updateContent({
          orgId,
          sectionKey: "hero",
          content: JSON.stringify(heroInfo),
        });
      } else if (step === "services") {
        await updateContent({
          orgId,
          sectionKey: "services",
          content: JSON.stringify({ items: services.filter((s) => s.title.trim()) }),
        });
      }

      if (!isLast) {
        setStep(STEPS[currentIdx + 1].key);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await publishSite({ orgId });
      router.push(`/admin/factory/${orgId}`);
    } finally {
      setSaving(false);
    }
  };

  const skins = listSkins();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                isCurrent ? "bg-cyan-500/10" : "hover:bg-white/5"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                isComplete ? "bg-green-500/20 border-green-500/30 text-green-400" :
                isCurrent ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" :
                "bg-white/5 border-white/10 text-gray-600"
              }`}>
                {isComplete ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-medium ${
                isCurrent ? "text-cyan-400" : isComplete ? "text-gray-400" : "text-gray-600"
              }`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 min-h-[300px]">
        {step === "skin" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Choose Industry Skin</h2>
            <p className="text-sm text-gray-400 mb-6">This sets the default colors, icons, and content for the site.</p>
            <div className="grid grid-cols-2 gap-3">
              {skins.map((skin) => (
                <button
                  key={skin.key}
                  onClick={() => setSelectedSkin(skin.key)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedSkin === skin.key
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${skin.primaryColor}, ${skin.secondaryColor})` }} />
                    <span className="text-sm font-semibold text-white">{skin.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{skin.defaultTagline}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "business" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Business Information</h2>
            <p className="text-sm text-gray-400 mb-6">This shows up in the header, footer, and contact section.</p>
            <div className="space-y-4">
              {[
                { key: "name", label: "Business Name", placeholder: "Orangecrest Pools" },
                { key: "phone", label: "Phone Number", placeholder: "(951) 555-0123" },
                { key: "email", label: "Email", placeholder: "info@orangecrestpools.com" },
                { key: "address", label: "Service Area", placeholder: "Riverside, CA" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={businessInfo[field.key as keyof typeof businessInfo]}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "hero" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Hero Section</h2>
            <p className="text-sm text-gray-400 mb-6">The first thing visitors see when they land on the site.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Headline</label>
                <input
                  type="text"
                  value={heroInfo.headline}
                  onChange={(e) => setHeroInfo({ ...heroInfo, headline: e.target.value })}
                  placeholder="Crystal Clear Pools, Year Round"
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subheadline</label>
                <textarea
                  value={heroInfo.subheadline}
                  onChange={(e) => setHeroInfo({ ...heroInfo, subheadline: e.target.value })}
                  placeholder="Professional pool care that keeps your backyard paradise sparkling clean..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === "services" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Services</h2>
            <p className="text-sm text-gray-400 mb-6">List the main services this business offers.</p>
            <div className="space-y-3">
              {services.map((svc, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2fr] gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <input
                    type="text"
                    value={svc.title}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setServices(next);
                    }}
                    placeholder="Service name"
                    className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="text"
                    value={svc.description}
                    onChange={(e) => {
                      const next = [...services];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setServices(next);
                    }}
                    placeholder="Brief description"
                    className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}
              <button
                onClick={() => setServices([...services, { title: "", description: "" }])}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                + Add another service
              </button>
            </div>
          </div>
        )}

        {step === "gallery" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Gallery Photos</h2>
            <p className="text-sm text-gray-400 mb-6">
              You can add photos later from the Content Editor. For now, the site will show placeholder images.
            </p>
            <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
              <Image className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Gallery management available in Content Editor</p>
              <p className="text-xs text-gray-600 mt-1">Skip this step to use default placeholder images</p>
            </div>
          </div>
        )}

        {step === "publish" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Review & Publish</h2>
            <p className="text-sm text-gray-400 mb-6">
              Your site is ready. Publishing makes it live at <span className="text-cyan-400">/s/{org.slug}</span>.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">Industry: <span className="text-gray-400 capitalize">{selectedSkin}</span></span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">Plan: <span className="text-gray-400 capitalize">{org.plan}</span></span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">Business: <span className="text-gray-400">{businessInfo.name || org.name}</span></span>
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {org.publishedAt ? "Update & Republish" : "Publish Site"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => !isFirst && setStep(STEPS[currentIdx - 1].key)}
          disabled={isFirst}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {!isLast && (
          <button
            onClick={saveAndNext}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {step === "gallery" ? "Skip & Continue" : "Save & Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
