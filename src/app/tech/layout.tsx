"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navLinks = [
  { href: "/tech", label: "My Route", icon: MapPin },
  { href: "/tech/week", label: "Week View", icon: Calendar },
  { href: "/tech/payout", label: "My Pay", icon: DollarSign },
  { href: "/tech/messages", label: "Messages", icon: MessageSquare },
];

export default function TechLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, userRole, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isTech = userRole === "lead_tech" || userRole === "assistant_tech" || userRole === "admin";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isTech) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isTech, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isTech) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Link href="/tech">
            <Image
              src="/media4u-logo.png"
              alt="Media4U"
              width={32}
              height={32}
              className="w-8 h-8 hover:scale-110 transition-transform"
            />
          </Link>
          <span className="font-bold text-white text-sm">Tech Portal</span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-slate-500 hidden sm:block">
          {user?.name}
        </span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-slate-400 hover:text-white md:hidden"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop nav tabs */}
      <nav className="bg-[#0f0f18] border-b border-white/10 px-4 hidden md:flex gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/tech" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                isActive
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500 hover:text-red-400 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </nav>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f0f18] border-b border-white/10 px-4 py-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
