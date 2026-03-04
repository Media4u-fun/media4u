// Industry skin registry - defines colors, icons, and default content per industry.
// Each skin can be applied to any template to customize it for a specific trade.

import { poolServiceSkin } from "./pool-service";
import { landscapingSkin } from "./landscaping";
import { hvacSkin } from "./hvac";
import { plumbingSkin } from "./plumbing";

export interface IndustrySkin {
  key: string;
  name: string;
  // Colors
  primaryColor: string; // Tailwind class (e.g., "cyan-500")
  secondaryColor: string;
  gradientFrom: string; // Full Tailwind gradient class
  gradientTo: string;
  // Icons (Lucide icon names)
  heroIcon: string;
  serviceIcons: string[];
  // Default content
  defaultBusinessName: string;
  defaultTagline: string;
  defaultServices: { title: string; description: string; icon: string }[];
  defaultProcess: { step: number; title: string; description: string }[];
  defaultFaqs: { question: string; answer: string }[];
  // Hero style
  heroBackground: "gradient" | "image" | "particles";
}

export const skinRegistry: Record<string, IndustrySkin> = {
  "pool-service": poolServiceSkin,
  landscaping: landscapingSkin,
  hvac: hvacSkin,
  plumbing: plumbingSkin,
};

export function getSkin(industry: string): IndustrySkin | null {
  return skinRegistry[industry] ?? null;
}

export function listSkins(): IndustrySkin[] {
  return Object.values(skinRegistry);
}
