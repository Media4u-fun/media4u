"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Sparkles,
  Loader2,
  Calendar,
  List,
  LayoutGrid,
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  ClipboardList,
  Flame,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Trash2,
  Tag,
  Clock,
  CircleDot,
  CircleCheck,
  Circle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Client Call",
  "Install / Field Job",
  "Podcast",
  "Blog Post",
  "Follow-Up",
  "Family / Personal",
  "Admin / Finance",
  "Build Task",
  "Reminder Only",
  "Deadline",
  "Meeting",
  "Marketing Task",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  "Client Call": {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  "Install / Field Job": {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  Podcast: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  "Blog Post": {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  "Follow-Up": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  "Family / Personal": {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    border: "border-pink-500/30",
    dot: "bg-pink-400",
  },
  "Admin / Finance": {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    dot: "bg-gray-400",
  },
  "Build Task": {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  "Reminder Only": {
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/30",
    dot: "bg-violet-400",
  },
  Deadline: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  Meeting: {
    bg: "bg-teal-500/20",
    text: "text-teal-400",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
  },
  "Marketing Task": {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  Other: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "text-red-400 bg-red-400/10 border-red-400/30",
  High: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  Normal: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Low: "text-gray-400 bg-gray-400/10 border-gray-400/30",
};

const PRIORITIES = ["Low", "Normal", "High", "Critical"] as const;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

type ViewMode = "month" | "week" | "list";
type AiMode = "briefing" | "weekly" | "conflicts" | "schedule";

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function padDate(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateStr(y: number, m: number, d: number) {
  return `${y}-${padDate(m + 1)}-${padDate(d)}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function getWeekDates(referenceDate: Date): Date[] {
  const dow = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function friendlyDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getCategoryColors(category?: string | null) {
  return CATEGORY_COLORS[category ?? "Other"] ?? CATEGORY_COLORS["Other"];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppointmentDoc {
  _id: Id<"appointments">;
  date: string;
  time?: string;
  title?: string;
  category?: string;
  priority?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  adminNotes?: string;
  relatedProject?: string;
  userName?: string;
  userEmail?: string;
  serviceType?: string;
}

interface NewEventForm {
  title: string;
  time: string;
  category: Category;
  priority: string;
  notes: string;
  adminNotes: string;
  relatedProject: string;
  reminderMinutes: number;
}

const emptyForm: NewEventForm = {
  title: "",
  time: "",
  category: "Meeting",
  priority: "Normal",
  notes: "",
  adminNotes: "",
  relatedProject: "",
  reminderMinutes: 0,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryDot({ category }: { category?: string | null }) {
  const colors = getCategoryColors(category);
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}
    />
  );
}

function CategoryBadge({ category }: { category?: string | null }) {
  const colors = getCategoryColors(category);
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {category ?? "Other"}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  const cls = PRIORITY_COLORS[priority ?? "Normal"] ?? PRIORITY_COLORS["Normal"];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      {priority ?? "Normal"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Event Detail Sidebar
// ---------------------------------------------------------------------------

interface EventDetailProps {
  event: AppointmentDoc;
  onClose: () => void;
  onComplete: (id: Id<"appointments">) => void;
  onCancel: (id: Id<"appointments">) => void;
  onEditNote: (id: Id<"appointments">, current: string) => void;
}

function EventDetailPanel({ event, onClose, onComplete, onCancel, onEditNote }: EventDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22 }}
      className="glass-elevated rounded-2xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CategoryDot category={event.category} />
          <h3 className="text-white font-semibold text-base truncate">
            {event.title ?? event.serviceType ?? "Untitled Event"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span>{friendlyDate(event.date)}</span>
          {event.time && (
            <span className="text-gray-500">at {event.time}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <CategoryBadge category={event.category} />
          <PriorityBadge priority={event.priority} />
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_BADGE[event.status] ?? STATUS_BADGE.pending}`}
          >
            {event.status}
          </span>
        </div>

        {event.relatedProject && (
          <div className="text-gray-400 text-xs">
            Project: <span className="text-white">{event.relatedProject}</span>
          </div>
        )}

        {event.notes && (
          <div className="bg-white/5 rounded-lg p-3 text-gray-300 text-xs leading-relaxed">
            <p className="text-gray-500 text-xs mb-1 font-medium uppercase tracking-wide">Notes</p>
            {event.notes}
          </div>
        )}

        {event.adminNotes && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-yellow-300 text-xs leading-relaxed">
            <p className="text-yellow-500 text-xs mb-1 font-medium uppercase tracking-wide">Admin Notes</p>
            {event.adminNotes}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
        {(event.status === "pending" || event.status === "confirmed") && (
          <button
            onClick={() => onComplete(event._id)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Complete
          </button>
        )}
        {(event.status === "pending" || event.status === "confirmed") && (
          <button
            onClick={() => onCancel(event._id)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
        <button
          onClick={() => onEditNote(event._id, event.adminNotes ?? "")}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors border border-white/10"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Edit Note
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Month View
// ---------------------------------------------------------------------------

interface MonthViewProps {
  viewYear: number;
  viewMonth: number;
  todayStr: string;
  allAppointments: AppointmentDoc[];
  onPrev: () => void;
  onNext: () => void;
  onSelectEvent: (event: AppointmentDoc) => void;
  onOpenAdd: (dateStr: string) => void;
}

function MonthView({
  viewYear,
  viewMonth,
  todayStr,
  allAppointments,
  onPrev,
  onNext,
  onSelectEvent,
  onOpenAdd,
}: MonthViewProps) {
  const { firstDay, daysInMonth } = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, AppointmentDoc[]> = {};
    for (const apt of allAppointments) {
      if (!map[apt.date]) map[apt.date] = [];
      map[apt.date].push(apt);
    }
    return map;
  }, [allAppointments]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="glass-elevated rounded-2xl p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-white">{monthLabel}</h2>
        <button
          onClick={onNext}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-xs text-gray-500 font-medium text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid - start week on Monday */}
      <div className="grid grid-cols-7 gap-1">
        {/* Offset: firstDay is 0=Sun...6=Sat, convert to Mon-start */}
        {Array.from({ length: (firstDay + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDateStr(viewYear, viewMonth, day);
          const isToday = dateStr === todayStr;
          const dayEvents = eventsByDate[dateStr] ?? [];
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - 3;

          return (
            <div
              key={day}
              className={`min-h-[80px] rounded-lg p-1.5 flex flex-col gap-1 border transition-colors cursor-default ${
                isToday
                  ? "border-cyan-500/50 bg-cyan-500/5 ring-1 ring-cyan-500/40"
                  : "border-white/5 hover:border-white/15 hover:bg-white/3"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`text-xs font-medium ${isToday ? "text-cyan-400" : "text-gray-400"}`}
                >
                  {day}
                </span>
                <button
                  onClick={() => onOpenAdd(dateStr)}
                  className="opacity-0 hover:opacity-100 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                  style={{ opacity: undefined }}
                  title="Add event"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {visible.map((evt) => {
                const colors = getCategoryColors(evt.category);
                return (
                  <button
                    key={evt._id}
                    onClick={() => onSelectEvent(evt)}
                    className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate border transition-colors ${colors.bg} ${colors.text} ${colors.border} hover:brightness-125`}
                    title={evt.title ?? evt.serviceType ?? "Event"}
                  >
                    {evt.title ?? evt.serviceType ?? "Event"}
                  </button>
                );
              })}

              {overflow > 0 && (
                <span className="text-xs text-gray-500 pl-1">+{overflow} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week View
// ---------------------------------------------------------------------------

interface WeekViewProps {
  weekStart: Date;
  todayStr: string;
  allAppointments: AppointmentDoc[];
  onPrev: () => void;
  onNext: () => void;
  onThisWeek: () => void;
  onSelectEvent: (event: AppointmentDoc) => void;
}

function WeekView({
  weekStart,
  todayStr,
  allAppointments,
  onPrev,
  onNext,
  onThisWeek,
  onSelectEvent,
}: WeekViewProps) {
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, AppointmentDoc[]> = {};
    for (const apt of allAppointments) {
      if (!map[apt.date]) map[apt.date] = [];
      map[apt.date].push(apt);
    }
    return map;
  }, [allAppointments]);

  const weekLabel = (() => {
    const s = weekDates[0];
    const e = weekDates[6];
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  })();

  return (
    <div className="glass-elevated rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-white">{weekLabel}</span>
          <button
            onClick={onThisWeek}
            className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 transition-colors border border-white/10"
          >
            This Week
          </button>
        </div>
        <button
          onClick={onNext}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const dateStr = formatDateStr(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          const isToday = dateStr === todayStr;
          const dayEvents = eventsByDate[dateStr] ?? [];

          return (
            <div key={dateStr} className="flex flex-col gap-1.5">
              <div
                className={`text-center pb-2 border-b ${isToday ? "border-cyan-500/50" : "border-white/10"}`}
              >
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-sm font-semibold mt-0.5 ${isToday ? "text-cyan-400" : "text-gray-200"}`}
                >
                  {date.getDate()}
                </div>
              </div>

              <div className="flex flex-col gap-1 min-h-[120px]">
                {dayEvents.length === 0 && (
                  <div className="flex-1" />
                )}
                {dayEvents.map((evt) => {
                  const colors = getCategoryColors(evt.category);
                  return (
                    <button
                      key={evt._id}
                      onClick={() => onSelectEvent(evt)}
                      className={`w-full text-left text-xs p-1.5 rounded-lg border transition-colors ${colors.bg} ${colors.text} ${colors.border} hover:brightness-125`}
                    >
                      <div className="font-medium truncate">
                        {evt.title ?? evt.serviceType ?? "Event"}
                      </div>
                      {evt.time && (
                        <div className="opacity-70 mt-0.5">{evt.time}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List View
// ---------------------------------------------------------------------------

interface ListViewProps {
  allAppointments: AppointmentDoc[];
  onSelectEvent: (event: AppointmentDoc) => void;
}

function ListView({ allAppointments, onSelectEvent }: ListViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const today = new Date();
  const past7 = new Date(today);
  past7.setDate(today.getDate() - 7);
  const future30 = new Date(today);
  future30.setDate(today.getDate() + 30);

  const past7Str = formatDateStr(past7.getFullYear(), past7.getMonth(), past7.getDate());
  const future30Str = formatDateStr(future30.getFullYear(), future30.getMonth(), future30.getDate());

  const filtered = useMemo(() => {
    return allAppointments
      .filter((a) => a.date >= past7Str && a.date <= future30Str)
      .filter((a) => categoryFilter === "all" || a.category === categoryFilter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allAppointments, categoryFilter, past7Str, future30Str]);

  const grouped = useMemo(() => {
    const map: Record<string, AppointmentDoc[]> = {};
    for (const evt of filtered) {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    }
    return map;
  }, [filtered]);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="glass-elevated rounded-2xl p-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            categoryFilter === "all"
              ? "bg-white/15 border-white/30 text-white"
              : "border-white/10 text-gray-500 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => {
          const colors = getCategoryColors(c);
          return (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                categoryFilter === c
                  ? `${colors.bg} ${colors.text} ${colors.border}`
                  : "border-white/10 text-gray-500 hover:text-gray-300"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {sortedDates.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No events in range.</p>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const events = grouped[dateStr];
            return (
              <div key={dateStr}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {friendlyDate(dateStr)}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="space-y-1.5">
                  {events.map((evt) => {
                    const colors = getCategoryColors(evt.category);
                    return (
                      <button
                        key={evt._id}
                        onClick={() => onSelectEvent(evt)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all group"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <span className="flex-1 min-w-0">
                          <span className="text-sm text-white truncate block">
                            {evt.title ?? evt.serviceType ?? "Untitled"}
                          </span>
                        </span>
                        {evt.time && (
                          <span className="text-xs text-gray-500 flex-shrink-0">{evt.time}</span>
                        )}
                        <CategoryBadge category={evt.category} />
                        <PriorityBadge priority={evt.priority} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Assistant Panel
// ---------------------------------------------------------------------------

interface AiPanelProps {
  allAppointments: AppointmentDoc[];
}

interface AiEvent {
  title?: string;
  date: string;
  time?: string;
  category?: string;
  priority?: string;
  notes?: string;
}

function AiAssistantPanel({ allAppointments }: AiPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scheduleQuery, setScheduleQuery] = useState("");
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  const todayStr = (() => {
    const t = new Date();
    return formatDateStr(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  const call = useCallback(
    async (type: AiMode, query?: string) => {
      setLoading(true);
      setResult(null);
      try {
        let events: AiEvent[] = [];
        if (type === "briefing") {
          events = allAppointments
            .filter((a) => a.date === todayStr)
            .map((a) => ({
              title: a.title ?? a.serviceType,
              date: a.date,
              time: a.time,
              category: a.category,
              priority: a.priority,
              notes: a.notes,
            }));
        } else if (type === "weekly") {
          const future7 = new Date();
          future7.setDate(future7.getDate() + 7);
          const future7Str = formatDateStr(
            future7.getFullYear(),
            future7.getMonth(),
            future7.getDate()
          );
          events = allAppointments
            .filter((a) => a.date >= todayStr && a.date <= future7Str)
            .map((a) => ({
              title: a.title ?? a.serviceType,
              date: a.date,
              time: a.time,
              category: a.category,
              priority: a.priority,
            }));
        } else {
          const future30 = new Date();
          future30.setDate(future30.getDate() + 30);
          const future30Str = formatDateStr(
            future30.getFullYear(),
            future30.getMonth(),
            future30.getDate()
          );
          events = allAppointments
            .filter((a) => a.date >= todayStr && a.date <= future30Str)
            .map((a) => ({
              title: a.title ?? a.serviceType,
              date: a.date,
              time: a.time,
              category: a.category,
              priority: a.priority,
            }));
        }

        const res = await fetch("/api/calendar-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, events, query }),
        });
        const data = (await res.json()) as { result?: string; error?: string };
        setResult(data.result ?? data.error ?? "No response.");
      } catch {
        setResult("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [allAppointments, todayStr]
  );

  return (
    <div className="glass-elevated rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => { setShowScheduleInput(false); void call("briefing"); }}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors disabled:opacity-50"
        >
          How&apos;s my day?
        </button>
        <button
          onClick={() => { setShowScheduleInput(false); void call("weekly"); }}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors disabled:opacity-50"
        >
          Weekly outlook
        </button>
        <button
          onClick={() => { setShowScheduleInput(false); void call("conflicts"); }}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-colors disabled:opacity-50"
        >
          Check for conflicts
        </button>
        <button
          onClick={() => setShowScheduleInput((v) => !v)}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30 hover:bg-teal-500/25 transition-colors disabled:opacity-50"
        >
          Find me time for...
        </button>
      </div>

      {showScheduleInput && (
        <div className="flex gap-2 mb-3">
          <input
            value={scheduleQuery}
            onChange={(e) => setScheduleQuery(e.target.value)}
            placeholder="e.g. a 1-hour client call this week"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600"
            onKeyDown={(e) => {
              if (e.key === "Enter" && scheduleQuery.trim()) {
                void call("schedule", scheduleQuery.trim());
              }
            }}
          />
          <button
            onClick={() => { if (scheduleQuery.trim()) void call("schedule", scheduleQuery.trim()); }}
            disabled={loading || !scheduleQuery.trim()}
            className="px-3 py-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-colors disabled:opacity-50 text-xs font-medium"
          >
            Ask
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Thinking...
        </div>
      )}

      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 leading-relaxed relative"
          >
            <button
              onClick={() => setResult(null)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="pr-6 whitespace-pre-line">{result}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Event Modal
// ---------------------------------------------------------------------------

interface AddEventModalProps {
  defaultDate: string;
  onClose: () => void;
  onSave: (form: NewEventForm, date: string) => Promise<void>;
  saving: boolean;
}

function AddEventModal({ defaultDate, onClose, onSave, saving }: AddEventModalProps) {
  const [form, setForm] = useState<NewEventForm>({ ...emptyForm });
  const [date, setDate] = useState(defaultDate);
  const allProjects = useQuery(api.projects.getAllProjects, {});

  const canSave = form.title.trim().length > 0 && date.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.22 }}
        className="bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-base">Add Event</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/30"
              placeholder="Event title"
              autoFocus
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a22] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Time</label>
              <select
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-[#1a1a22] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
              >
                <option value="">-- Select time --</option>
                {["12:00 AM","12:30 AM","1:00 AM","1:30 AM","2:00 AM","2:30 AM","3:00 AM","3:30 AM","4:00 AM","4:30 AM","5:00 AM","5:30 AM","6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM","10:30 PM","11:00 PM","11:30 PM"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full bg-[#1a1a22] border border-white/10 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-[#1a1a22] [&>option]:text-white focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-[#1a1a22] border border-white/10 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-[#1a1a22] [&>option]:text-white focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Related Project */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Related Project</label>
            <select
              value={form.relatedProject}
              onChange={(e) => setForm({ ...form, relatedProject: e.target.value })}
              className="w-full bg-[#1a1a22] border border-white/10 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-[#1a1a22] [&>option]:text-white focus:outline-none"
            >
              <option value="">None</option>
              {(allProjects ?? []).map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}{p.projectType ? ` - ${p.projectType}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none placeholder-gray-600 focus:outline-none focus:border-white/30"
              placeholder="Event notes..."
            />
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Admin Notes (internal)</label>
            <textarea
              value={form.adminNotes}
              onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none placeholder-gray-600 focus:outline-none focus:border-white/30"
              placeholder="Private notes..."
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Reminder</label>
            <select
              value={form.reminderMinutes}
              onChange={(e) => setForm({ ...form, reminderMinutes: Number(e.target.value) })}
              className="w-full bg-[#1a1a22] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            >
              <option value={0}>No reminder</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={180}>3 hours before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void onSave(form, date)}
            disabled={saving || !canSave}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Add Event"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Note Modal
// ---------------------------------------------------------------------------

interface NoteModalProps {
  eventId: Id<"appointments">;
  initial: string;
  onClose: () => void;
  onSave: (id: Id<"appointments">, note: string) => Promise<void>;
}

function NoteModal({ eventId, initial, onClose, onSave }: NoteModalProps) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(eventId, text);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1a22] border border-white/10 rounded-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-white font-semibold mb-3">Admin Note</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none mb-4 focus:outline-none focus:border-white/30"
          placeholder="Internal note..."
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Board
// ---------------------------------------------------------------------------

const TASK_CATEGORIES = [
  "Follow-Up", "Client Work", "Build Task", "Marketing", "Admin", "Finance", "Personal", "Urgent", "Other",
] as const;

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", icon: Flame },
  high:   { label: "High",   color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", icon: ArrowUp },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", icon: ArrowRight },
  low:    { label: "Low",    color: "text-blue-400",   bg: "bg-blue-500/20",   border: "border-blue-500/30",   icon: ArrowDown },
};

const STATUS_COLUMNS = [
  { key: "todo",        label: "To Do",       icon: Circle,      color: "text-gray-400",   border: "border-gray-700" },
  { key: "in_progress", label: "In Progress", icon: CircleDot,   color: "text-cyan-400",   border: "border-cyan-500/30" },
  { key: "done",        label: "Done",        icon: CircleCheck, color: "text-emerald-400", border: "border-emerald-500/30" },
] as const;

type TaskDoc = {
  _id: Id<"tasks">;
  title: string;
  notes?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "done";
  category: string;
  dueDate?: string;
  projectId?: string;
  completedAt?: number;
  createdAt: number;
};

type ProjectOption = { _id: Id<"projects">; name: string };

type TaskBoardProps = {
  tasks: TaskDoc[];
  projects: ProjectOption[];
  onCreateTask: (args: { title: string; notes?: string; priority: "low" | "medium" | "high" | "urgent"; category: string; dueDate?: string; projectId?: Id<"projects"> }) => Promise<unknown>;
  onUpdateStatus: (args: { id: Id<"tasks">; status: "todo" | "in_progress" | "done" }) => Promise<unknown>;
  onDeleteTask: (args: { id: Id<"tasks"> }) => Promise<unknown>;
};

function TaskBoard({ tasks, projects, onCreateTask, onUpdateStatus, onDeleteTask }: TaskBoardProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDueDate, setNewDueDate] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterProject !== "all" && t.projectId !== filterProject) return false;
      return true;
    });
  }, [tasks, filterPriority, filterCategory, filterProject]);

  const byStatus = useMemo(() => {
    const map: Record<string, TaskDoc[]> = { todo: [], in_progress: [], done: [] };
    for (const t of filtered) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [filtered]);

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }), [tasks]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await onCreateTask({
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || undefined,
      projectId: newProjectId ? (newProjectId as Id<"projects">) : undefined,
    });
    setNewTitle(""); setNewNotes(""); setNewPriority("medium"); setNewCategory("Other"); setNewDueDate(""); setNewProjectId("");
    setShowAdd(false);
    setSaving(false);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Task Board</h2>
          <div className="flex items-center gap-2">
            {STATUS_COLUMNS.map((col) => (
              <span key={col.key} className={`text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${col.color}`}>
                {counts[col.key]} {col.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-gray-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#1a1a22]">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k} className="bg-[#1a1a22]">{v.label}</option>
            ))}
          </select>
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-gray-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#1a1a22]">All Categories</option>
            {TASK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#1a1a22]">{c}</option>)}
          </select>
          {/* Project filter */}
          {projects.length > 0 && (
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-gray-300 outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1a1a22]">All Projects</option>
              {projects.map((p) => <option key={p._id} value={p._id} className="bg-[#1a1a22]">{p.name}</option>)}
            </select>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = byStatus[col.key] ?? [];
          const ColIcon = col.icon;
          return (
            <div key={col.key} className={`glass-elevated rounded-2xl border ${col.border} flex flex-col min-h-[200px]`}>
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <ColIcon className={`w-4 h-4 ${col.color}`} />
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-gray-600 bg-white/5 rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[420px]">
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-gray-700 text-xs">
                    No tasks here
                  </div>
                )}
                {colTasks.map((task) => {
                  const p = PRIORITY_CONFIG[task.priority];
                  const PIcon = p.icon;
                  const isOverdue = task.dueDate && task.dueDate < today && task.status !== "done";
                  return (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative bg-white/[0.03] border border-white/8 hover:border-white/15 rounded-xl p-3 transition-all`}
                    >
                      {/* Priority bar */}
                      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${p.bg.replace("bg-", "bg-").replace("/20", "/60")} ml-1`} />

                      <div className="pl-2">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-sm font-medium text-white leading-snug ${task.status === "done" ? "line-through text-gray-500" : ""}`}>
                            {task.title}
                          </span>
                          <button
                            onClick={() => void onDeleteTask({ id: task._id })}
                            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Notes */}
                        {task.notes && (
                          <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">{task.notes}</p>
                        )}

                        {/* Badges row */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md ${p.bg} ${p.color} border ${p.border}`}>
                            <PIcon className="w-2.5 h-2.5" />{p.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/8">
                            <Tag className="w-2.5 h-2.5" />{task.category}
                          </span>
                          {task.dueDate && (
                            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border ${isOverdue ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5 text-gray-400 border-white/8"}`}>
                              <Clock className="w-2.5 h-2.5" />
                              {task.dueDate}
                            </span>
                          )}
                          {task.projectId && (() => {
                            const proj = projects.find((p) => p._id === task.projectId);
                            return proj ? (
                              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/25">
                                <Sparkles className="w-2.5 h-2.5" />{proj.name}
                              </span>
                            ) : null;
                          })()}
                        </div>

                        {/* Status move buttons */}
                        <div className="flex gap-1">
                          {STATUS_COLUMNS.filter((c) => c.key !== col.key).map((c) => {
                            const CIcon = c.icon;
                            return (
                              <button
                                key={c.key}
                                onClick={() => void onUpdateStatus({ id: task._id, status: c.key })}
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/8 hover:border-white/20 ${c.color} transition-all`}
                              >
                                <CIcon className="w-3 h-3" />
                                {c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-lg bg-[#1a1a22] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-cyan-400" /> New Task
                </h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Task Title *</label>
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
                    placeholder="What needs to get done?"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Any details..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm outline-none focus:border-cyan-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as typeof newPriority)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm outline-none focus:border-cyan-500/50"
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <option key={k} value={k} className="bg-[#1a1a22]">{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm outline-none focus:border-cyan-500/50"
                    >
                      {TASK_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#1a1a22]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Due Date (optional)</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  {projects.length > 0 && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5 font-medium">Link to Project (optional)</label>
                      <select
                        value={newProjectId}
                        onChange={(e) => setNewProjectId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm outline-none focus:border-cyan-500/50"
                      >
                        <option value="" className="bg-[#1a1a22]">No project</option>
                        {projects.map((p) => <option key={p._id} value={p._id} className="bg-[#1a1a22]">{p.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleAdd()}
                    disabled={!newTitle.trim() || saving}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-all disabled:opacity-40"
                  >
                    {saving ? "Saving..." : "Add Task"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminCalendarPage() {
  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [weekStart, setWeekStart] = useState(today);

  // Selection & modals
  const [selectedEvent, setSelectedEvent] = useState<AppointmentDoc | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addDefaultDate, setAddDefaultDate] = useState(todayStr);
  const [savingAdd, setSavingAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [noteModalId, setNoteModalId] = useState<Id<"appointments"> | null>(null);
  const [noteModalInitial, setNoteModalInitial] = useState("");

  // Convex
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const allTasks = useQuery(api.tasks.getAllTasks, {});
  const allProjects = useQuery(api.projects.getAllProjects, {});
  const createTask = useMutation(api.tasks.createTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const allAppointments = useQuery(
    api.appointments.getAllAppointments,
    convexIsAdmin === true ? {} : "skip"
  );
  const quickAdd = useMutation(api.appointments.adminQuickAddAppointment);
  const updateStatus = useMutation(api.appointments.updateStatus);
  const addAdminNote = useMutation(api.appointments.addAdminNote);
  const clearNotifications = useMutation(api.adminNotifications.markAllAsRead);
  const notifCount = useQuery(api.adminNotifications.getUnreadCount);

  const appointments = (allAppointments ?? []) as AppointmentDoc[];

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Week navigation
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const thisWeek = () => setWeekStart(new Date());

  // Add event
  const handleOpenAdd = (dateStr?: string) => {
    setAddDefaultDate(dateStr ?? todayStr);
    setShowAdd(true);
  };

  const handleSaveAdd = async (form: NewEventForm, date: string) => {
    setSavingAdd(true);
    try {
      // Calculate reminder timestamp in the browser so timezone is correct
      let reminderAt: number | undefined;
      if (form.reminderMinutes && form.time) {
        const [y, mo, d] = date.split("-").map(Number);
        const match = form.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1]);
          const min = parseInt(match[2]);
          const period = match[3].toUpperCase();
          if (period === "PM" && h !== 12) h += 12;
          if (period === "AM" && h === 12) h = 0;
          const eventMs = new Date(y, mo - 1, d, h, min).getTime();
          reminderAt = eventMs - form.reminderMinutes * 60 * 1000;
        }
      }

      await quickAdd({
        date,
        time: form.time || "All Day",
        title: form.title,
        category: form.category || undefined,
        priority: form.priority || undefined,
        notes: form.notes || undefined,
        relatedProject: form.relatedProject || undefined,
        createdFrom: "calendar",
        reminderMinutes: form.reminderMinutes || undefined,
        reminderAt,
      });

      // Push to Google Calendar silently
      fetch("/api/google-calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          date,
          time: form.time || "9:00 AM",
          duration: 60,
          notes: form.notes,
          category: form.category,
        }),
      }).catch(() => null);

      setShowAdd(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to add event");
    } finally {
      setSavingAdd(false);
    }
  };

  // Bulk sync all appointments to Google Calendar
  const handleSyncAll = async () => {
    if (!allAppointments || allAppointments.length === 0) return;
    setSyncing(true);
    setSyncResult("");
    let success = 0;
    let failed = 0;
    let lastError = "";
    for (const appt of allAppointments) {
      try {
        const res = await fetch("/api/google-calendar/create-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: appt.title || appt.serviceType,
            date: appt.date,
            time: appt.time || "9:00 AM",
            duration: 60,
            notes: appt.notes,
            category: appt.category,
          }),
        });
        if (res.ok) {
          success++;
        } else {
          failed++;
          if (!lastError) {
            const body = await res.json().catch(() => ({}));
            lastError = body.error ?? `HTTP ${res.status}`;
          }
        }
      } catch (e) {
        failed++;
        if (!lastError) lastError = e instanceof Error ? e.message : "network error";
      }
    }
    setSyncing(false);
    const msg = `Done - ${success} synced${failed > 0 ? `, ${failed} failed` : ""}${lastError ? ` (${lastError})` : ""}`;
    setSyncResult(msg);
    setTimeout(() => setSyncResult(""), 10000);
  };

  // Status actions
  const handleComplete = async (id: Id<"appointments">) => {
    await updateStatus({ appointmentId: id, status: "completed" });
    setSelectedEvent(null);
  };

  const handleCancel = async (id: Id<"appointments">) => {
    await updateStatus({ appointmentId: id, status: "cancelled" });
    setSelectedEvent(null);
  };

  // Note
  const handleEditNote = (id: Id<"appointments">, current: string) => {
    setNoteModalId(id);
    setNoteModalInitial(current);
  };

  const handleSaveNote = async (id: Id<"appointments">, note: string) => {
    await addAdminNote({ appointmentId: id, adminNotes: note });
    // Update selected event note in place if still shown
    if (selectedEvent && selectedEvent._id === id) {
      setSelectedEvent({ ...selectedEvent, adminNotes: note });
    }
  };

  const VIEW_TABS: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: "month", icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "Month" },
    { id: "week", icon: <Calendar className="w-3.5 h-3.5" />, label: "Week" },
    { id: "list", icon: <List className="w-3.5 h-3.5" />, label: "List" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your schedule and events</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === tab.id
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Clear Notifications */}
          {(notifCount ?? 0) > 0 && (
            <button
              onClick={() => clearNotifications()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Clear {notifCount} Alert{(notifCount ?? 0) > 1 ? "s" : ""}
            </button>
          )}

          {/* Sync to Google Calendar */}
          <button
            onClick={handleSyncAll}
            disabled={syncing || !allAppointments?.length}
            title="Push all events to Google Calendar"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : syncResult || "Sync Google"}
          </button>

          {/* Add Event */}
          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Main grid: calendar + detail sidebar */}
      <div className="flex gap-6">
        {/* Calendar area */}
        <div className="flex-1 min-w-0">
          {viewMode === "month" ? (
            <MonthView
              viewYear={viewYear}
              viewMonth={viewMonth}
              todayStr={todayStr}
              allAppointments={appointments}
              onPrev={prevMonth}
              onNext={nextMonth}
              onSelectEvent={setSelectedEvent}
              onOpenAdd={handleOpenAdd}
            />
          ) : viewMode === "week" ? (
            <WeekView
              weekStart={weekStart}
              todayStr={todayStr}
              allAppointments={appointments}
              onPrev={prevWeek}
              onNext={nextWeek}
              onThisWeek={thisWeek}
              onSelectEvent={setSelectedEvent}
            />
          ) : (
            <ListView
              allAppointments={appointments}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </div>

        {/* Event Detail Sidebar - desktop */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <EventDetailPanel
                key={selectedEvent._id}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onComplete={(id) => void handleComplete(id)}
                onCancel={(id) => void handleCancel(id)}
                onEditNote={handleEditNote}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-elevated rounded-2xl p-6 text-center"
              >
                <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Click any event to see details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AiAssistantPanel allAppointments={appointments} />

      {/* Task Board */}
      <TaskBoard
        tasks={allTasks ?? []}
        projects={allProjects ?? []}
        onCreateTask={createTask}
        onUpdateStatus={updateTaskStatus}
        onDeleteTask={deleteTask}
      />

      {/* Event Detail - mobile bottom sheet */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="lg:hidden fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25 }}
              className="w-full bg-[#1a1a22] border-t border-white/10 rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto"
            >
              <EventDetailPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onComplete={(id) => void handleComplete(id)}
                onCancel={(id) => void handleCancel(id)}
                onEditNote={handleEditNote}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && (
          <AddEventModal
            defaultDate={addDefaultDate}
            onClose={() => setShowAdd(false)}
            onSave={handleSaveAdd}
            saving={savingAdd}
          />
        )}
      </AnimatePresence>

      {/* Admin Note Modal */}
      <AnimatePresence>
        {noteModalId && (
          <NoteModal
            eventId={noteModalId}
            initial={noteModalInitial}
            onClose={() => setNoteModalId(null)}
            onSave={handleSaveNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
