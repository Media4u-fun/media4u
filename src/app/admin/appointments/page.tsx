"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, X, MessageSquare, Plus, Clock } from "lucide-react";

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export default function AdminAppointmentsPage() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [noteId, setNoteId] = useState<Id<"appointments"> | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApt, setNewApt] = useState({ customerName: "", customerEmail: "", customerPhone: "", serviceType: "General Consultation", notes: "", adminNotes: "", time: "" });
  const [addingApt, setAddingApt] = useState(false);

  const allAppointments = useQuery(api.appointments.getAllAppointments);
  const dayAppointments = useQuery(
    api.appointments.getAppointmentsByDate,
    selectedDate ? { date: selectedDate } : "skip"
  );
  const availableSlots = useQuery(
    api.appointments.getAvailableSlots,
    showAddForm && selectedDate ? { date: selectedDate } : "skip"
  );
  const updateStatus = useMutation(api.appointments.updateStatus);
  const addAdminNote = useMutation(api.appointments.addAdminNote);
  const adminBook = useMutation(api.appointments.adminBookAppointment);

  const { firstDay, daysInMonth } = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // Map dates to appointment counts for calendar dots
  const dateCounts = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    if (!allAppointments) return map;
    for (const apt of allAppointments) {
      if (!map[apt.date]) map[apt.date] = {};
      map[apt.date][apt.status] = (map[apt.date][apt.status] || 0) + 1;
    }
    return map;
  }, [allAppointments]);

  const filteredDayAppointments = useMemo(() => {
    if (!dayAppointments) return [];
    if (statusFilter === "all") return dayAppointments;
    return dayAppointments.filter((a) => a.status === statusFilter);
  }, [dayAppointments, statusFilter]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleStatus = async (id: Id<"appointments">, status: "pending" | "confirmed" | "completed" | "cancelled") => {
    await updateStatus({ appointmentId: id, status });
  };

  const handleSaveNote = async () => {
    if (!noteId) return;
    await addAdminNote({ appointmentId: noteId, adminNotes: noteText });
    setNoteId(null);
    setNoteText("");
  };

  const handleAddAppointment = async () => {
    if (!selectedDate || !newApt.time || !newApt.customerName) return;
    setAddingApt(true);
    try {
      await adminBook({
        date: selectedDate,
        time: newApt.time,
        serviceType: newApt.serviceType,
        customerName: newApt.customerName,
        customerEmail: newApt.customerEmail || undefined,
        customerPhone: newApt.customerPhone || undefined,
        notes: newApt.notes || undefined,
        adminNotes: newApt.adminNotes || undefined,
      });
      setShowAddForm(false);
      setNewApt({ customerName: "", customerEmail: "", customerPhone: "", serviceType: "General Consultation", notes: "", adminNotes: "", time: "" });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to add appointment");
    } finally {
      setAddingApt(false);
    }
  };

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Appointments</h1>
        <p className="text-gray-400">View and manage all customer appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-xs text-gray-500 font-medium py-2">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const counts = dateCounts[dateStr];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`py-2 rounded-lg text-sm transition-all relative ${
                    isSelected
                      ? "bg-cyan-500 text-white font-bold"
                      : isToday
                      ? "bg-white/10 text-cyan-400 font-semibold"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {day}
                  {counts && (
                    <div className="flex gap-0.5 justify-center mt-0.5">
                      {Object.entries(counts).map(([status, count]) => (
                        <span
                          key={status}
                          className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`}
                          title={`${count} ${status}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-[600px] overflow-y-auto">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                  })}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                    title="Add appointment"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap gap-1 mb-4">
                {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors capitalize ${
                      statusFilter === s
                        ? "bg-white/10 border-white/20 text-white"
                        : "border-white/10 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {dayAppointments === undefined ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : filteredDayAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments.</p>
              ) : (
                <div className="space-y-3">
                  {filteredDayAppointments.map((apt) => (
                    <div key={apt._id} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{apt.userName}</p>
                          <p className="text-gray-400 text-xs">{apt.time} - {apt.serviceType}</p>
                          {apt.userEmail && (
                            <p className="text-gray-500 text-xs">{apt.userEmail}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge[apt.status]}`}>
                          {apt.status}
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-gray-400 text-xs bg-white/5 rounded p-2">Customer: {apt.notes}</p>
                      )}
                      {apt.adminNotes && (
                        <p className="text-yellow-400/80 text-xs bg-yellow-500/5 rounded p-2">Admin: {apt.adminNotes}</p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {apt.status === "pending" && (
                          <button
                            onClick={() => handleStatus(apt._id, "confirmed")}
                            className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {(apt.status === "pending" || apt.status === "confirmed") && (
                          <>
                            <button
                              onClick={() => handleStatus(apt._id, "completed")}
                              className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatus(apt._id, "cancelled")}
                              className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setNoteId(apt._id); setNoteText(apt.adminNotes || ""); }}
                          className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 hover:bg-white/20 transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Note
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Click a date to see appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Note Modal */}
      {noteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a22] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-white font-semibold mb-3">Admin Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none mb-4"
              placeholder="Internal note..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setNoteId(null)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Appointment Modal */}
      {showAddForm && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a22] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-semibold mb-1">Add Appointment</h3>
            <p className="text-gray-500 text-sm mb-4">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Customer Name *</label>
                <input
                  value={newApt.customerName}
                  onChange={(e) => setNewApt({ ...newApt, customerName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <input
                    value={newApt.customerEmail}
                    onChange={(e) => setNewApt({ ...newApt, customerEmail: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <input
                    value={newApt.customerPhone}
                    onChange={(e) => setNewApt({ ...newApt, customerPhone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Time Slot *</label>
                {availableSlots === undefined ? (
                  <p className="text-gray-500 text-sm">Loading slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No available slots for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setNewApt({ ...newApt, time: slot })}
                        className={`py-1.5 px-2 rounded-lg text-xs border transition-all flex items-center justify-center gap-1 ${
                          newApt.time === slot
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                            : "border-white/10 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Service Type</label>
                <select
                  value={newApt.serviceType}
                  onChange={(e) => setNewApt({ ...newApt, serviceType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="General Consultation">General Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Customer Notes</label>
                <textarea
                  value={newApt.notes}
                  onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  placeholder="Customer request details..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Admin Notes (internal)</label>
                <textarea
                  value={newApt.adminNotes}
                  onChange={(e) => setNewApt({ ...newApt, adminNotes: e.target.value })}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  placeholder="Internal notes..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAppointment}
                disabled={addingApt || !newApt.customerName || !newApt.time}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {addingApt ? "Adding..." : "Add Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
