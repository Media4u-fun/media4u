"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useMemo } from "react";
import { Id } from "@convex/_generated/dataModel";
import {
  MapPin,
  Users,
  Calendar,
  Route,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

type Job = {
  _id: Id<"jobs">;
  storeNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  jobType?: string;
  scheduledDate: string;
  status: string;
  notes?: string;
};

type RouteDay = {
  date: string;
  jobs: Job[];
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isSunday(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getDay() === 0;
}

export default function RoutePlannerPage() {
  const unassignedJobs = useQuery(api.jobs.getUnassignedJobsByRegion);
  const allUsers = useQuery(api.admin.getAllUsers);
  const bulkAssign = useMutation(api.assignments.bulkAssignJobs);

  // Step state
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [leadTechId, setLeadTechId] = useState("");
  const [assistantTechId, setAssistantTechId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [maxPerDay, setMaxPerDay] = useState(5);
  const [generatedRoute, setGeneratedRoute] = useState<RouteDay[] | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<number | null>(null);

  // Get techs from user roles
  const techs = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(
      (u) => u.role === "lead_tech" || u.role === "assistant_tech"
    );
  }, [allUsers]);

  // Group jobs by state
  const stateGroups = useMemo(() => {
    if (!unassignedJobs) return {};
    const groups: Record<string, Job[]> = {};
    for (const job of unassignedJobs) {
      const st = job.state || "Unknown";
      if (!groups[st]) groups[st] = [];
      groups[st].push(job as Job);
    }
    return groups;
  }, [unassignedJobs]);

  // Group selected state's jobs by city
  const cityGroups = useMemo(() => {
    if (!selectedState || !stateGroups[selectedState]) return {};
    const groups: Record<string, Job[]> = {};
    for (const job of stateGroups[selectedState]) {
      const city = job.city || "Unknown";
      if (!groups[city]) groups[city] = [];
      groups[city].push(job);
    }
    return groups;
  }, [selectedState, stateGroups]);

  // Jobs to route based on selection
  const selectedJobs = useMemo(() => {
    if (!selectedState) return [];
    const stateJobs = stateGroups[selectedState] || [];
    if (selectedCities.length === 0) return stateJobs;
    return stateJobs.filter((j) => selectedCities.includes(j.city));
  }, [selectedState, selectedCities, stateGroups]);

  const totalUnassigned = unassignedJobs?.length || 0;

  // Generate route preview
  function generateRoute() {
    if (selectedJobs.length === 0) return;

    // Sort by ZIP for geographic clustering
    const sorted = [...selectedJobs].sort((a, b) =>
      a.zip.localeCompare(b.zip)
    );

    const days: RouteDay[] = [];
    let currentDate = startDate;
    let idx = 0;

    while (idx < sorted.length) {
      // Skip Sundays
      if (isSunday(currentDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      const dayJobs = sorted.slice(idx, idx + maxPerDay);
      days.push({ date: currentDate, jobs: dayJobs });
      idx += maxPerDay;
      currentDate = addDays(currentDate, 1);
    }

    setGeneratedRoute(days);
    setAssignResult(null);
  }

  // Bulk assign
  async function handleAssign() {
    if (!generatedRoute || !leadTechId) return;
    setAssigning(true);

    const assignments: {
      jobId: Id<"jobs">;
      assignedDate: string;
      routeOrder: number;
    }[] = [];

    for (const day of generatedRoute) {
      for (let i = 0; i < day.jobs.length; i++) {
        assignments.push({
          jobId: day.jobs[i]._id,
          assignedDate: day.date,
          routeOrder: i + 1,
        });
      }
    }

    const result = await bulkAssign({
      assignments,
      leadTechId,
      assistantTechId: assistantTechId || undefined,
    });

    setAssigning(false);
    setAssignResult(result.count);
    setGeneratedRoute(null);
    setSelectedState(null);
    setSelectedCities([]);
  }

  // Helper to get city summary for a day
  function dayCitySummary(jobs: Job[]): string {
    const cities = [...new Set(jobs.map((j) => j.city))];
    if (cities.length <= 2) return cities.join(", ");
    return `${cities[0]}, ${cities[1]} +${cities.length - 2} more`;
  }

  const canGenerate = selectedJobs.length > 0 && leadTechId && startDate;
  const stateList = Object.entries(stateGroups).sort(
    (a, b) => b[1].length - a[1].length
  );
  const cityList = Object.entries(cityGroups).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Route className="w-7 h-7 text-brand-light" />
          Route Planner
        </h1>
        <p className="text-gray-400 mt-1">
          Bulk-assign jobs by region into daily routes
        </p>
      </motion.div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <span className="text-gray-400 text-sm">Unassigned Jobs</span>
          <span className="ml-2 text-white font-bold">{totalUnassigned}</span>
        </div>
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <span className="text-gray-400 text-sm">States</span>
          <span className="ml-2 text-white font-bold">{stateList.length}</span>
        </div>
        {selectedJobs.length > 0 && (
          <div className="px-4 py-2 rounded-lg bg-brand-light/10 border border-brand-light/30">
            <span className="text-brand-light text-sm">Selected</span>
            <span className="ml-2 text-white font-bold">
              {selectedJobs.length} jobs
            </span>
          </div>
        )}
      </div>

      {/* Success banner */}
      {assignResult !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-400 font-semibold">
              {assignResult} jobs assigned successfully!
            </p>
            <p className="text-green-400/70 text-sm">
              Techs can see their routes in the Tech Portal.
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {!unassignedJobs && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-light animate-spin" />
        </div>
      )}

      {unassignedJobs && totalUnassigned === 0 && !assignResult && (
        <div className="text-center py-20 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">No unassigned jobs</p>
          <p className="text-sm mt-1">
            Import jobs first, then come back to plan routes.
          </p>
        </div>
      )}

      {unassignedJobs && totalUnassigned > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Region selection */}
          <div className="space-y-4">
            {/* Step A: Pick State */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-brand-light" />
                Step 1: Pick a State
              </h2>
              <div className="flex flex-wrap gap-2">
                {stateList.map(([state, jobs]) => (
                  <button
                    key={state}
                    onClick={() => {
                      setSelectedState(
                        selectedState === state ? null : state
                      );
                      setSelectedCities([]);
                      setGeneratedRoute(null);
                      setAssignResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedState === state
                        ? "bg-brand-light text-black"
                        : "bg-white/10 text-gray-300 hover:bg-white/15"
                    }`}
                  >
                    {state} ({jobs.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Step A2: Pick Cities (optional filter) */}
            {selectedState && cityList.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white/5 border border-white/10 p-5"
              >
                <h2 className="text-white font-semibold flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Filter by City
                  <span className="text-gray-500 text-xs font-normal ml-1">
                    (optional)
                  </span>
                </h2>
                <p className="text-gray-500 text-xs mb-3">
                  Leave all unselected to include every city
                </p>
                <div className="flex flex-wrap gap-2">
                  {cityList.map(([city, jobs]) => {
                    const selected = selectedCities.includes(city);
                    return (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCities((prev) =>
                            selected
                              ? prev.filter((c) => c !== city)
                              : [...prev, city]
                          );
                          setGeneratedRoute(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selected
                            ? "bg-cyan-500 text-black"
                            : "bg-white/10 text-gray-300 hover:bg-white/15"
                        }`}
                      >
                        {city} ({jobs.length})
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step B: Pick Team & Schedule */}
            {selectedState && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4"
              >
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Step 2: Team & Schedule
                </h2>

                {/* Lead Tech */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Lead Tech *
                  </label>
                  <select
                    value={leadTechId}
                    onChange={(e) => setLeadTechId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-brand-light"
                  >
                    <option value="">Select a tech...</option>
                    {techs.map((t) => (
                      <option key={t.userId} value={t.userId}>
                        {t.displayName || t.name || t.email} ({t.role === "lead_tech" ? "Lead" : "Assistant"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assistant Tech */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Assistant Tech (optional)
                  </label>
                  <select
                    value={assistantTechId}
                    onChange={(e) => setAssistantTechId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-brand-light"
                  >
                    <option value="">None</option>
                    {techs
                      .filter((t) => t.userId !== leadTechId)
                      .map((t) => (
                        <option key={t.userId} value={t.userId}>
                          {t.displayName || t.name || t.email} ({t.role === "lead_tech" ? "Lead" : "Assistant"})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-gray-400 text-sm flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setGeneratedRoute(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-brand-light"
                  />
                </div>

                {/* Max Per Day */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Max Jobs Per Day: {maxPerDay}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maxPerDay}
                    onChange={(e) => {
                      setMaxPerDay(Number(e.target.value));
                      setGeneratedRoute(null);
                    }}
                    className="w-full accent-brand-light"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={generateRoute}
                  disabled={!canGenerate}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    canGenerate
                      ? "bg-brand-light text-black hover:opacity-90"
                      : "bg-white/10 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Route className="w-4 h-4" />
                  Generate Route Preview
                </button>
              </motion.div>
            )}
          </div>

          {/* Right column - Route preview */}
          <div>
            {generatedRoute && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4"
              >
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Route Preview
                </h2>
                <p className="text-gray-400 text-sm">
                  {selectedJobs.length} jobs over {generatedRoute.length} days
                  (Sundays skipped)
                </p>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {generatedRoute.map((day, idx) => (
                    <div
                      key={day.date}
                      className="rounded-lg bg-white/5 border border-white/10 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium text-sm">
                          Day {idx + 1} - {formatDate(day.date)}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {day.jobs.length} jobs
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {dayCitySummary(day.jobs)}
                      </p>
                      <div className="space-y-1">
                        {day.jobs.map((job, jIdx) => (
                          <div
                            key={job._id}
                            className="flex items-start gap-2 text-xs"
                          >
                            <span className="text-brand-light font-mono w-4 text-right flex-shrink-0">
                              {jIdx + 1}.
                            </span>
                            <div className="text-gray-300 min-w-0">
                              <span className="font-medium">
                                #{job.storeNumber}
                              </span>{" "}
                              <ChevronRight className="w-3 h-3 inline text-gray-600" />{" "}
                              <span className="text-gray-400">
                                {job.address}, {job.city} {job.zip}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assign button */}
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Assign All {selectedJobs.length} Jobs
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Empty state for right column */}
            {!generatedRoute && selectedState && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center">
                <Route className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Pick your team, set the schedule, then hit &quot;Generate
                  Route Preview&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
