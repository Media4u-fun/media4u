"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/vr", label: "VR Experiences" },
];

const learnSections = [
  {
    heading: "Learn",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/services", label: "All Services" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/start-project", label: "Start a Project" },
    ],
  },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (learnRef.current && !learnRef.current.contains(event.target as Node)) {
        setIsLearnOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2 bg-[#141419]">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left side: Logo + Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/" className="relative group flex items-center flex-shrink-0">
            <Image
              src="/media4u-logo.png"
              alt="Media4U Logo"
              width={40}
              height={40}
              priority
              className="w-9 h-9 hover:scale-110 transition-transform duration-300"
            />
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-white ${
                pathname === link.href ? "text-white" : "text-gray-400"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Learn Dropdown */}
          <div
            ref={learnRef}
            className="relative"
            onMouseEnter={() => setIsLearnOpen(true)}
            onMouseLeave={() => setIsLearnOpen(false)}
          >
            <button
              className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:text-white ${
                isLearnOpen ? "text-white" : "text-gray-400"
              }`}
              aria-expanded={isLearnOpen}
              aria-haspopup="true"
            >
              Learn
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLearnOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isLearnOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 pt-3"
                >
                  <div className="w-52 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden p-4">
                    {learnSections.map((section, idx) => (
                      <div key={section.heading}>
                        {idx > 0 && <div className="border-t border-zinc-800 my-3" />}
                        <p className="text-xs font-medium text-zinc-500 mb-2">{section.heading}</p>
                        {section.links.map((link) => (
                          <Link
                            key={link.href + link.label}
                            href={link.href}
                            onClick={() => setIsLearnOpen(false)}
                            className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: Logo only on left */}
        <Link href="/" className="lg:hidden relative group flex items-center">
          <Image
            src="/media4u-logo.png"
            alt="Media4U Logo"
            width={40}
            height={40}
            priority
            className="w-9 h-9 hover:scale-110 transition-transform duration-300"
          />
        </Link>

        {/* Right side: Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center text-white text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {user?.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            Admin Panel
                          </Link>
                          <Link
                            href="/portal"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            User Portal
                          </Link>
                        </>
                      )}
                      {!isAdmin && (
                        <Link
                          href="/portal"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-gray-400 text-sm font-medium hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden relative w-9 h-9 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <div className="relative w-5 h-4">
            <span
              className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "top-2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-2 w-full h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "top-2 -rotate-45" : "top-4"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-zinc-900 border border-zinc-800 mt-2 mx-4 rounded-2xl overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-medium py-2 ${
                      pathname === link.href
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Learn sections in mobile */}
              {learnSections.map((section, idx) => (
                <motion.div
                  key={section.heading}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + idx) * 0.05 }}
                  className="border-t border-white/10 pt-4"
                >
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-500 mb-3">{section.heading}</p>
                  <div className="flex flex-col gap-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-300 hover:text-white text-sm py-1 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.05 }}
                  className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10"
                >
                  <div className="text-sm font-medium text-gray-300">
                    {user?.name}
                  </div>
                  <Link
                    href={isAdmin ? "/admin" : "/portal"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all"
                  >
                    Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.05 }}
                  className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10"
                >
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-full text-center text-gray-400 text-sm font-medium hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-full bg-white text-zinc-950 text-center text-sm font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
