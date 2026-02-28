// Appointment configuration - change these values per client when cloning the template
export const appointmentConfig = {
  businessHours: {
    start: "9:00 AM",
    end: "5:00 PM",
  },
  slotDuration: 60, // minutes
  serviceTypes: ["General Consultation"],
  daysOff: [0] as number[], // 0 = Sunday
  maxAdvanceBookingDays: 30,
};

// Event categories - customize per business
export const categories = [
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

export const priorities = ["Low", "Normal", "High", "Critical"] as const;

export const publishStatuses = ["Draft", "Scheduled", "Posted"] as const;

export const relatedProjects = ["Media4U", "TriVirtual", "Other"] as const;

export const platforms = ["YouTube", "Website", "Spotify", "Apple Podcasts", "Other"] as const;

// Categories that show content-specific fields (Title, Platform, Publish Status)
export const contentCategories = ["Blog Post", "Podcast Episode"] as const;

// Helper: parse "9:00 AM" to 24h hour number (9)
export function parseHour(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  let [hours] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours;
}

// Generate all slot times for a day based on config
export function generateTimeSlots(): string[] {
  const startHour = parseHour(appointmentConfig.businessHours.start);
  const endHour = parseHour(appointmentConfig.businessHours.end);
  const slotMinutes = appointmentConfig.slotDuration;
  const slots: string[] = [];

  let current = startHour * 60; // minutes from midnight
  const end = endHour * 60;

  while (current + slotMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const displayM = m.toString().padStart(2, "0");
    slots.push(`${displayH}:${displayM} ${period}`);
    current += slotMinutes;
  }

  return slots;
}
