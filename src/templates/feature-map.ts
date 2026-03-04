// Maps feature keys to the template sections they control.
// When a feature key is enabled, its associated sections render.
// When disabled, sections show the LockedFeature upgrade prompt.

export type TemplateSectionKey =
  | "hero"
  | "services"
  | "process"
  | "about"
  | "contact"
  | "quote_form"
  | "faq"
  | "seo"
  | "gallery"
  | "reviews"
  | "blog"
  | "booking"
  | "newsletter"
  | "analytics"
  | "mapping"
  | "client_portal"
  | "integrations"
  | "pdf_export";

// Which feature key gates each template section
export const sectionFeatureMap: Record<TemplateSectionKey, string> = {
  // Starter tier (core_pages + seo + contact_form)
  hero: "core_pages",
  services: "core_pages",
  process: "core_pages",
  about: "core_pages",
  contact: "contact_form",
  quote_form: "quote_widget",
  faq: "core_pages",
  seo: "seo",

  // Growth tier
  gallery: "gallery",
  reviews: "reviews",
  blog: "blog",
  booking: "booking",
  newsletter: "newsletter",
  analytics: "analytics",

  // Enterprise tier
  mapping: "mapping",
  client_portal: "client_portal",
  integrations: "integration_vault",
  pdf_export: "pdf_export",
};

// Sections that are always shown (no gating needed) - part of core_pages
export const ALWAYS_VISIBLE_SECTIONS: TemplateSectionKey[] = [
  "hero",
  "services",
  "process",
  "about",
  "faq",
];

// Get the feature key required for a given section
export function getRequiredFeature(section: TemplateSectionKey): string {
  return sectionFeatureMap[section];
}
