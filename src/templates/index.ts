// Template registry - maps industry slugs to template components
// Each factory client gets a template based on their industry

import { PoolServiceLayout } from "./pool-service/pool-layout";
import { type TemplateSectionKey } from "./feature-map";

export interface TemplateEntry {
  component: typeof PoolServiceLayout;
  name: string;
  description: string;
  // Which sections this template uses (for feature gating)
  sections: TemplateSectionKey[];
}

export const templateRegistry: Record<string, TemplateEntry> = {
  "pool-service": {
    component: PoolServiceLayout,
    name: "Pool Service",
    description: "Professional pool cleaning and maintenance website",
    sections: [
      "hero",
      "services",
      "process",
      "gallery",
      "reviews",
      "about",
      "quote_form",
      "faq",
      "contact",
      "seo",
    ],
  },
};

export function getTemplate(industry: string) {
  return templateRegistry[industry] ?? null;
}
