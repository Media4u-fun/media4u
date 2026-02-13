"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { CalendarDays, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  "Blog Post", "Podcast Episode", "Client Follow-Up", "Internal Reminder",
  "Meeting", "Install Job", "Marketing Task", "Personal Development", "Other",
];
const PRIORITIES = ["Low", "Medium", "High"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AppointmentsPage() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  const myAppointments = useQuery(api.appointments.getMyAppointments);
  const availableSlots = useQuery(
    api.appointments.getAvailableSlots,
    selectedDate ? { date: selectedDate } : "skip"
  );
  const bookAppointment = useMutation(api.appointments.bookAppointment);
  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  const { firstDay, daysInMonth } = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return;
    setBooking(true);
    try {
      await bookAppointment({
        date: selectedDate,
        time: selectedSlot,
        serviceType: category,
        category,
        priority,
        notes: notes || undefined,
      });
      setSelectedSlot(null);
      setNotes("");
      setSelectedDate(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id: Id<"appointments">) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment({ appointmentId: id });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Cancel failed");
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Appointments</h1>
        <p className="text-zinc-400">Book and manage your appointments</p>
      </div>

      {/* Calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-xs text-zinc-500 font-medium py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(viewYear, viewMonth, day);
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const isSunday = new Date(viewYear, viewMonth, day).getDay() === 0;

            return (
              <button
                key={day}
                disabled={isPast || isSunday}
                onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                className={`py-2 rounded-lg text-sm transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-white font-bold"
                    : isToday
                    ? "bg-zinc-800 text-cyan-400 font-semibold"
                    : isPast || isSunday
                    ? "text-zinc-700 cursor-not-allowed"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot Selection */}
      {selectedDate && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-cyan-400" />
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {availableSlots === undefined ? (
            <p className="text-zinc-500">Loading slots...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-zinc-500">No available slots for this date.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-sm border transition-all flex items-center justify-center gap-1.5 ${
                      selectedSlot === slot
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {slot}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="space-y-4 border-t border-zinc-800 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-zinc-800 [&>option]:text-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm [&>option]:bg-zinc-800 [&>option]:text-white"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any details about your appointment..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
                    />
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {booking ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* My Appointments */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">My Appointments</h3>
        {!myAppointments || myAppointments.length === 0 ? (
          <p className="text-zinc-500 text-sm">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {myAppointments.map((apt) => (
              <div
                key={apt._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-zinc-800/50 border border-zinc-800"
              >
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    {new Date(apt.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}{" "}
                    at {apt.time}
                  </p>
                  <p className="text-zinc-400 text-sm">{apt.category || apt.serviceType}</p>
                  {apt.priority && (
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${
                      apt.priority === "High" ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : apt.priority === "Medium" ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}>{apt.priority}</span>
                  )}
                  {apt.notes && <p className="text-zinc-500 text-xs">{apt.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[apt.status]}`}>
                    {apt.status}
                  </span>
                  {(apt.status === "pending" || apt.status === "confirmed") && (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
