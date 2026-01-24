"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import Image from "next/image";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/contacts", label: "Contact Forms", icon: "📧" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📬" },
  { href: "/admin/blog", label: "Blog Posts", icon: "📝" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "🖼️" },
  { href: "/admin/vr", label: "VR Experiences", icon: "🥽" },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect to home if authenticated but not admin
    if (!isAdmin) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 sticky top-0 h-screen overflow-y-auto"
      >
        <div className="mb-12">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Image
              src="/media4u-logo.png"
              alt="Media4U Logo"
              width={60}
              height={60}
              priority
              className="w-16 h-16 hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <p className="text-xs text-gray-500 uppercase tracking-wider text-center">Admin Panel</p>
        </div>

        <nav className="space-y-2 mb-12">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 border border-red-500/30 font-medium"
        >
          Logout
        </button>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
