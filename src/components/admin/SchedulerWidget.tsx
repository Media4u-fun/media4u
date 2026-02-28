"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  CalendarDays,
  AlertTriangle,
  Clock,
  Plus,
  ChevronRight,
  X,
  Loader2,
  Mic,
  MicOff,
  CheckCircle2,
  Zap,
} from "lucide-react";

const priorityColors: Record<string, string> = {
  Critical: "text-red-400 bg-red-400/10 border-red-400/30",
  High: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  Normal: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Low: "text-gray-400 bg-gray-400/10 border-gray-400/30",
};

const categoryColors: Record<string, string> = {
  "Client Call": "text-emerald-400",
  "Install / Field Job": "text-yellow-400",
  Podcast: "text-purple-400",
  "Blog Post": "text-amber-400",
  "Follow-Up": "text-blue-400",
  "Family / Personal": "text-pink-400",
  "Admin / Finance": "text-gray-400",
  "Build Task": "text-cyan-400",
  "Reminder Only": "text-violet-400",
  Deadline: "text-red-400",
  Meeting: "text-teal-400",
  "Marketing Task": "text-orange-400",
  Other: "text-gray-400",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type Appointment = {
  _id: string;
  title?: string;
  serviceType: string;
  date: string;
  time: string;
  category?: string;
  priority?: string;
  status: string;
};

function EventRow({ event, showDate = false }: { event: Appointment; showDate?: boolean }) {
  const label = event.title || event.serviceType;
  const priorityClass = priorityColors[event.priority ?? "Normal"] ?? priorityColors["Normal"];
  const catColor = categoryColors[event.category ?? "Other"] ?? "text-gray-400";

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-400">
            {showDate ? `${formatDate(event.date)} - ` : ""}{event.time}
          </span>
          {event.category && (
            <span className={`text-xs ${catColor}`}>{event.category}</span>
          )}
        </div>
      </div>
      {event.priority && (
        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityClass} hidden sm:block`}>
          {event.priority}
        </span>
      )}
    </div>
  );
}

export default function SchedulerWidget() {
  const convexIsAdmin = useQuery(api.auth.isAdmin);
  const todayEvents = useQuery(api.appointments.getTodayAppointments, convexIsAdmin === true ? {} : "skip");
  const overdueEvents = useQuery(api.appointments.getOverdueAppointments, convexIsAdmin === true ? {} : "skip");
  const upcomingEvents = useQuery(api.appointments.getUpcomingAppointments, convexIsAdmin === true ? {} : "skip");
  const quickAdd = useMutation(api.appointments.adminQuickAddAppointment);

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const todayCount = todayEvents?.length ?? 0;
  const overdueCount = overdueEvents?.length ?? 0;
  const upcomingCount = upcomingEvents?.length ?? 0;

  async function handleQuickAdd() {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) throw new Error("Failed to parse event");
      const parsed = await res.json();

      if (parsed.needsClarification) {
        setError(parsed.question);
        setIsProcessing(false);
        return;
      }

      await quickAdd({
        date: parsed.date,
        time: parsed.time,
        title: parsed.title,
        category: parsed.category,
        priority: parsed.priority,
        notes: parsed.notes,
        duration: parsed.duration,
        createdFrom: "quick-add",
      });

      // Push to Google Calendar (silently - don't block if it fails)
      fetch("/api/google-calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: parsed.title,
          date: parsed.date,
          time: parsed.time,
          duration: parsed.duration,
          notes: parsed.notes,
          category: parsed.category,
        }),
      }).catch(() => null);

      setSuccess(true);
      setInputText("");
      setTimeout(() => {
        setSuccess(false);
        setShowQuickAdd(false);
      }, 1500);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    type SpeechRecognitionConstructor = new () => {
      lang: string;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
      start: () => void;
    };

    const SR = (
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
    );

    if (!SR) {
      setError("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError("Could not hear you. Try again.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.start();
  }

  return (
    <div className="mb-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-brand-light" />
          Scheduler
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowQuickAdd(true); setError(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand-light text-sm font-medium transition-all"
          >
            <Zap className="w-4 h-4" />
            Quick Add
          </button>
          <Link
            href="/admin/appointments"
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-2xl glass-elevated border border-brand/30"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">
                What do you need to schedule?
              </p>
              <button onClick={() => setShowQuickAdd(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Example: &quot;Call Amanda Monday at 2pm, remind me 30 mins before&quot;
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                  placeholder="Type or speak your event..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand/50"
                  autoFocus
                />
                <button
                  onClick={handleVoice}
                  className={`p-3 rounded-xl border transition-all flex-shrink-0 ${
                    isListening
                      ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleQuickAdd}
                disabled={isProcessing || !inputText.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-brand hover:bg-brand/90 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isProcessing ? "AI is thinking..." : success ? "Added!" : "Add Event"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-amber-400">{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today */}
        <div className="glass-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Today
            </h3>
            <span className="text-xs text-gray-400">{todayCount} events</span>
          </div>
          {todayEvents === undefined ? (
            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-500" /></div>
          ) : todayCount === 0 ? (
            <p className="text-xs text-gray-500 py-2 px-3">Nothing scheduled today</p>
          ) : (
            <div className="space-y-0.5">
              {todayEvents.map((e) => <EventRow key={e._id} event={e as Appointment} />)}
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className="glass-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? "text-red-400" : "text-gray-500"}`} />
              Overdue
            </h3>
            {overdueCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20">
                {overdueCount}
              </span>
            )}
          </div>
          {overdueEvents === undefined ? (
            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-500" /></div>
          ) : overdueCount === 0 ? (
            <p className="text-xs text-gray-500 py-2 px-3">All caught up</p>
          ) : (
            <div className="space-y-0.5">
              {overdueEvents.slice(0, 5).map((e) => <EventRow key={e._id} event={e as Appointment} showDate />)}
            </div>
          )}
        </div>

        {/* Next 7 Days */}
        <div className="glass-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-light inline-block" />
              Next 7 Days
            </h3>
            <span className="text-xs text-gray-400">{upcomingCount} events</span>
          </div>
          {upcomingEvents === undefined ? (
            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-500" /></div>
          ) : upcomingCount === 0 ? (
            <p className="text-xs text-gray-500 py-2 px-3">Nothing coming up</p>
          ) : (
            <div className="space-y-0.5">
              {upcomingEvents.slice(0, 5).map((e) => <EventRow key={e._id} event={e as Appointment} showDate />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
