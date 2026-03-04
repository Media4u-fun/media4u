"use client";

import { PoolHero } from "./hero";
import { PoolServices } from "./services";
import { PoolProcess } from "./process";
import { PoolGallery } from "./gallery";
import { PoolReviews } from "./reviews";
import { PoolAbout } from "./about";
import { PoolQuoteForm } from "./quote-form";
import { PoolFAQ } from "./faq";
import { PoolContact } from "./contact";
import { defaultPoolContent, type PoolContent } from "./content";
import { GatedSection } from "../gated-section";

export function PoolServiceLayout({
  content,
  headerOffset = false,
}: {
  content?: Partial<PoolContent>;
  headerOffset?: boolean;
}) {
  const c = { ...defaultPoolContent, ...content };
  const businessName = c.business.name;

  return (
    <div className="min-h-screen bg-[#141419] text-white">
      {/* Simple header bar */}
      <header className={`fixed ${headerOffset ? "top-10" : "top-0"} left-0 right-0 z-50 bg-[#141419]/80 backdrop-blur-xl border-b border-white/[0.06]`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between">
          <span className="text-lg font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {businessName}
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {["Services", "Gallery", "Reviews", "About", "FAQ", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </nav>
          <a
            href="#quote"
            className="px-5 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Free Quote
          </a>
        </div>
      </header>

      {/* Core sections (Starter tier - always visible) */}
      <PoolHero content={content} />
      <PoolServices content={content} />
      <PoolProcess content={content} />

      {/* Gallery - Starter tier */}
      <GatedSection section="gallery">
        <PoolGallery />
      </GatedSection>

      {/* Reviews - Growth tier */}
      <GatedSection section="reviews" showLocked featureName="Customer Reviews">
        <PoolReviews content={content} />
      </GatedSection>

      {/* Core sections continued */}
      <PoolAbout content={content} />

      {/* Quote form - Growth tier */}
      <GatedSection section="quote_form" showLocked featureName="Quote Request Form">
        <PoolQuoteForm content={content} />
      </GatedSection>

      <PoolFAQ content={content} />

      {/* Contact - Starter tier */}
      <GatedSection section="contact">
        <PoolContact content={content} />
      </GatedSection>

      {/* Simple footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} {businessName}. All rights
            reserved.
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            Powered by QuickSite Pro
          </p>
        </div>
      </footer>
    </div>
  );
}
