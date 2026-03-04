"use client";

import { useState } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import { BookingCalendar } from "./booking-calendar";

interface BookingFormProps {
  serviceTypes: string[];
  timeSlots?: string[];
  onSubmit: (booking: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    serviceType: string;
    preferredDate: string;
    preferredTime?: string;
    notes?: string;
  }) => Promise<void>;
}

const DEFAULT_TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

export function BookingForm({
  serviceTypes,
  timeSlots = DEFAULT_TIME_SLOTS,
  onSubmit,
}: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !serviceType || !selectedDate) return;

    setSubmitting(true);
    try {
      await onSubmit({
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        serviceType,
        preferredDate: selectedDate,
        preferredTime: selectedTime || undefined,
        notes: notes || undefined,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Booking Submitted!</h3>
        <p className="text-sm text-zinc-400">
          We will confirm your appointment shortly.
        </p>
      </div>
    );
  }

  return (
    <section id="booking" className="py-20 px-6 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
          Book an Appointment
        </h2>
        <p className="text-zinc-400 text-center mb-12">
          Pick a date and time that works for you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <BookingCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            {/* Form fields */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Select service *</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Time slots */}
              {selectedDate && (
                <div>
                  <p className="text-sm text-zinc-400 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Preferred time
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedTime === time
                            ? "bg-cyan-500 text-white"
                            : "bg-white/[0.05] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                placeholder="Any notes or special requests"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />

              <button
                type="submit"
                disabled={submitting || !name || !email || !serviceType || !selectedDate}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
