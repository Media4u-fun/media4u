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
import { type PoolContent } from "./content";

export function PoolServiceLayout({
  content,
}: {
  content?: Partial<PoolContent>;
}) {
  return (
    <div className="min-h-screen bg-[#141419] text-white">
      {/* Simple header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#141419]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between">
          <span className="text-lg font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Orangecrest Pools
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

      {/* Sections */}
      <PoolHero content={content} />
      <PoolServices content={content} />
      <PoolProcess content={content} />
      <PoolGallery />
      <PoolReviews content={content} />
      <PoolAbout content={content} />
      <PoolQuoteForm content={content} />
      <PoolFAQ content={content} />
      <PoolContact content={content} />

      {/* Simple footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Orangecrest Pools. All rights
            reserved.
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            Powered by Media4U Website Factory
          </p>
        </div>
      </footer>
    </div>
  );
}
