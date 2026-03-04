"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  bookedDates?: string[]; // ISO date strings that are already booked
}

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  bookedDates = [],
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
    const isPast = date < today;
    const isBooked = bookedDates.includes(dateStr);
    const isSelected = selectedDate === dateStr;
    const isDisabled = isPast || isBooked;

    days.push(
      <button
        key={day}
        type="button"
        disabled={isDisabled}
        onClick={() => onDateSelect(dateStr)}
        className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
          isSelected
            ? "bg-cyan-500 text-white"
            : isDisabled
            ? "text-zinc-700 cursor-not-allowed"
            : "text-zinc-300 hover:bg-white/[0.05]"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium">{monthName}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-xs text-zinc-500 text-center font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}
