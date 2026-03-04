"use client";

import { FileText, Calendar, MessageSquare, Settings } from "lucide-react";

interface DashboardStats {
  documentsCount: number;
  upcomingBookings: number;
  unreadMessages: number;
}

interface ClientDashboardProps {
  clientName: string;
  businessName: string;
  stats: DashboardStats;
  onNavigate?: (section: "documents" | "bookings" | "messages" | "settings") => void;
}

export function ClientDashboard({
  clientName,
  businessName,
  stats,
  onNavigate,
}: ClientDashboardProps) {
  const cards = [
    {
      key: "documents" as const,
      label: "Documents",
      value: stats.documentsCount,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      key: "bookings" as const,
      label: "Upcoming Bookings",
      value: stats.upcomingBookings,
      icon: Calendar,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      key: "messages" as const,
      label: "Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      key: "settings" as const,
      label: "Account Settings",
      value: null,
      icon: Settings,
      color: "text-zinc-400",
      bg: "bg-zinc-500/10",
    },
  ];

  return (
    <div className="py-12 px-6 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold">
            Welcome back, {clientName}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your {businessName} client portal
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={() => onNavigate?.(card.key)}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left hover:border-white/[0.12] transition-colors"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-sm text-zinc-400">{card.label}</p>
              {card.value !== null && (
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
