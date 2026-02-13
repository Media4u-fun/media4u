"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  ClipboardList,
  RefreshCw,
  Settings,
  HelpCircle,
  Globe,
  LogOut,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { PortalMobileNav } from "./portal-mobile-nav";

const portalNavItems = [
  { href: "/portal", label: "Dashboard", icon: Home },
  { href: "/portal/projects", label: "My Projects", icon: Briefcase },
  { href: "/portal/orders", label: "Orders", icon: ClipboardList },
  { href: "/portal/subscription", label: "Subscription", icon: RefreshCw },
  { href: "/portal/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/portal/settings", label: "Settings", icon: Settings },
  { href: "/portal/support", label: "Support", icon: HelpCircle },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=/portal");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile Navigation */}
      <PortalMobileNav
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={portalNavItems}
        pathname={pathname ?? ""}
        user={user}
        onSignOut={signOut}
      />

      {/* Desktop Sidebar - hidden on mobile */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block w-64 border-r border-zinc-800 bg-zinc-900 p-6 sticky top-0 h-screen overflow-y-auto"
      >
        <div className="mb-8">
          <Link href="/" className="flex items-center justify-center mb-4">
            <Image
              src="/media4u-logo.png"
              alt="Media4U Logo"
              width={60}
              height={60}
              priority
              className="w-16 h-16 hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <p className="text-xs text-gray-500 uppercase tracking-wider text-center">
            Portal
          </p>
        </div>

        {/* User Info */}
        <div className="mb-8 p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
          <p className="text-sm font-medium text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>

        <nav className="space-y-2 mb-8">
          {portalNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">Back to Site</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/50 text-red-400 hover:bg-red-950 transition-all duration-200 border border-red-900/50 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-4 pt-18 pb-20 lg:p-8 lg:pt-8 lg:pb-8 overflow-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}
