"use client";

import Link from "next/link";

const quickLinks = [
  { href: "/tvr/about", label: "About" },
  { href: "/tvr/hosts", label: "Hosts" },
  { href: "/tvr/podcast", label: "Podcast" },
  { href: "/tvr/blog", label: "Blog" },
  { href: "/tvr/heart", label: "H.E.A.R.T." },
];

const platformLinks = [
  { href: "https://youtube.com/@trivirtualroundtable", label: "YouTube" },
  { href: "https://open.spotify.com/show/2xwFFH8uFmSUMgAU662Xz4", label: "Spotify" },
  { href: "https://patreon.com/TriVirtualRoundtable", label: "Patreon" },
];

export function TVRFooter() {
  return (
    <footer className="relative border-t border-tvr-light/10">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0818] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/tvr" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold text-white">
                Tri Virtual Roundtable
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Where truth, faith, culture, and technology meet. A future-focused, faith-driven podcast with MrHarmony, Iceman, and Doc Maasi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-tvr-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Listen & Watch */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Listen & Watch
            </h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 text-sm hover:text-tvr-light transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
              Support the Show
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Help us keep the conversation going.
            </p>
            <a
              href="https://patreon.com/TriVirtualRoundtable"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tvr-light/20 text-tvr-light text-sm font-semibold hover:bg-tvr-light/30 transition-colors border border-tvr-light/30"
            >
              Support on Patreon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-tvr-light/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Tri Virtual Roundtable. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Powered by <Link href="/" className="text-gray-500 hover:text-tvr-light transition-colors">Media4U</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
