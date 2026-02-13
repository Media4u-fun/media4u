"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/components/AuthContext";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CreditCard,
  Inbox,
  FileText,
  Image as ImageIcon,
  Glasses,
  Settings,
  Briefcase,
  Globe,
  Bell,
  Menu,
  X,
  Mail,
  MessageCircle,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, countKey: null },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, countKey: "inbox" },
  { href: "/admin/billing", label: "Billing", icon: CreditCard, countKey: null },
  { href: "/admin/notifications", label: "Client Updates", icon: Bell, countKey: "clientActivity" },
  { href: "/admin/messages", label: "Messages", icon: MessageCircle, countKey: "messages" },
  { href: "/admin/projects", label: "Projects", icon: Briefcase, countKey: null },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail, countKey: null },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText, countKey: null },
  { href: "/admin/portfolio", label: "Portfolio", icon: ImageIcon, countKey: null },
  { href: "/admin/vr", label: "VR Experiences", icon: Glasses, countKey: null },
  { href: "/admin/community", label: "Community", icon: Globe, countKey: "community" },
  { href: "/admin/settings", label: "Settings", icon: Settings, countKey: null },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch notification counts
  const inboxNewCount = useQuery(api.inbox.getInboxNewCount);
  const communityRequests = useQuery(api.community.getInviteRequests);
  const clientActivityCount = useQuery(api.clientActivity.getUnreadCount);
  const messagesUnreadCount = useQuery(api.messages.getUnreadCountForAdmin);

  const counts: Record<string, number> = {
    inbox: inboxNewCount || 0,
    clientActivity: clientActivityCount || 0,
    messages: messagesUnreadCount || 0,
    community: communityRequests?.filter((r) => r.status === "pending").length || 0,
  };

  const totalBadgeCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-brand-light animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const sidebarContent = (
    <>
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between lg:justify-center mb-6">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/media4u-logo.png"
              alt="Media4U Logo"
              width={60}
              height={60}
              priority
              className="w-12 h-12 lg:w-16 lg:h-16 hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-wider text-center">Admin Panel</p>
      </div>

      <nav className="space-y-1 mb-8 lg:mb-12">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          const count = item.countKey ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1 text-sm">{item.label}</span>
              {count > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut()}
        className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 border border-red-500/30 font-medium text-sm"
      >
        Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#141419]/95 backdrop-blur-lg border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
            {totalBadgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalBadgeCount > 99 ? "99+" : totalBadgeCount}
              </span>
            )}
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/media4u-logo.png"
              alt="Media4U Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Admin</span>
          </Link>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden bg-[#141419] border-r border-white/10 p-5 overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block w-64 border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 sticky top-0 h-screen overflow-y-auto flex-shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-4 pt-[72px] lg:pt-8 lg:p-8 min-w-0"
      >
        {children}
      </motion.main>
    </div>
  );
}
