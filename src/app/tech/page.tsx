"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@/components/AuthContext";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Navigation,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Route,
  Car,
  Ticket,
  ClipboardPaste,
  X,
} from "lucide-react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  unassigned: { label: "Unassigned", color: "text-amber-400", bg: "bg-amber-500/15 border border-amber-500/30" },
  assigned: { label: "Ready", color: "text-cyan-400", bg: "bg-cyan-500/15 border border-cyan-500/30" },
  in_progress: { label: "In Progress", color: "text-orange-400", bg: "bg-orange-500/15 border border-orange-500/30" },
  waiting_pickup: { label: "Waiting Pickup", color: "text-purple-400", bg: "bg-purple-500/15 border border-purple-500/30" },
  completed: { label: "Done", color: "text-emerald-400", bg: "bg-emerald-500/15 border border-emerald-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/15 border border-red-500/30" },
};

// Route directions renderer - draws the driving route between stops
function RouteDirections({
  stops,
  onRouteInfo,
}: {
  stops: Array<{ lat: number; lng: number }>;
  onRouteInfo: (info: { totalDistance: string; totalDuration: string; legDurations: string[] }) => void;
}) {
  const map = useMap();
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map || stops.length < 2) return;

    const directionsService = new google.maps.DirectionsService();

    if (!rendererRef.current) {
      rendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#06b6d4",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });
    } else {
      rendererRef.current.setMap(map);
    }

    const origin = stops[0];
    const destination = stops[stops.length - 1];
    const waypoints = stops.slice(1, -1).map((s) => ({
      location: new google.maps.LatLng(s.lat, s.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK" && result) {
          rendererRef.current?.setDirections(result);
          const route = result.routes[0];
          if (route) {
            let totalDistMeters = 0;
            let totalDurSeconds = 0;
            const legDurations: string[] = [];
            route.legs.forEach((leg) => {
              totalDistMeters += leg.distance?.value ?? 0;
              totalDurSeconds += leg.duration?.value ?? 0;
              legDurations.push(leg.duration?.text ?? "");
            });
            const totalMiles = (totalDistMeters / 1609.34).toFixed(1);
            const totalHours = Math.floor(totalDurSeconds / 3600);
            const totalMins = Math.round((totalDurSeconds % 3600) / 60);
            const totalDuration = totalHours > 0
              ? `${totalHours}h ${totalMins}m`
              : `${totalMins}m`;
            onRouteInfo({
              totalDistance: `${totalMiles} mi`,
              totalDuration,
              legDurations,
            });
          }
        }
      }
    );

    return () => {
      rendererRef.current?.setMap(null);
    };
  }, [map, stops, onRouteInfo]);

  return null;
}

// Tech route map component
function TechRouteMap({
  routeItems,
  onRouteInfo,
}: {
  routeItems: Array<{
    job: {
      _id: Id<"jobs">;
      address: string;
      city: string;
      state: string;
      zip: string;
      storeNumber: string;
      status: string;
      latitude?: number;
      longitude?: number;
    };
    assignment: { routeOrder: number };
  }>;
  onRouteInfo: (info: { totalDistance: string; totalDuration: string; legDurations: string[] }) => void;
}) {
  const map = useMap();

  const jobsWithCoords = routeItems.filter(
    (item) => item.job.latitude && item.job.longitude
  );

  useEffect(() => {
    if (!map || jobsWithCoords.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    jobsWithCoords.forEach((item) => {
      bounds.extend({ lat: item.job.latitude!, lng: item.job.longitude! });
    });
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, jobsWithCoords]);

  const stops = jobsWithCoords.map((item) => ({
    lat: item.job.latitude!,
    lng: item.job.longitude!,
  }));

  const getPinColor = (status: string) => {
    if (status === "completed") return "#22c55e";
    if (status === "in_progress") return "#f97316";
    if (status === "waiting_pickup") return "#a855f7";
    return "#06b6d4";
  };

  return (
    <>
      {jobsWithCoords.map((item, index) => (
        <AdvancedMarker
          key={item.job._id}
          position={{ lat: item.job.latitude!, lng: item.job.longitude! }}
        >
          <div
            className="flex items-center justify-center rounded-full border-2 border-white shadow-lg"
            style={{
              backgroundColor: getPinColor(item.job.status),
              width: 32,
              height: 32,
            }}
          >
            <span className="text-white text-xs font-bold">{index + 1}</span>
          </div>
        </AdvancedMarker>
      ))}
      {stops.length >= 2 && (
        <RouteDirections stops={stops} onRouteInfo={onRouteInfo} />
      )}
    </>
  );
}

export default function TechMyRoute() {
  const { user } = useAuth();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedJob, setExpandedJob] = useState<Id<"jobs"> | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    totalDistance: string;
    totalDuration: string;
    legDurations: string[];
  } | null>(null);

  const handleRouteInfo = useCallback(
    (info: { totalDistance: string; totalDuration: string; legDurations: string[] }) => {
      setRouteInfo(info);
    },
    []
  );

  const route = useQuery(
    api.assignments.getTechRoute,
    user?.id
      ? { techId: user.id, date: selectedDate }
      : "skip"
  );

  const updateStatus = useMutation(api.jobs.updateJobStatus);
  const updateTicketFields = useMutation(api.jobs.updateTicketFields);
  const reportLocation = useMutation(api.techLocations.reportLocation);
  const removeLocation = useMutation(api.techLocations.removeLocation);

  // Paste ticket modal state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteJobId, setPasteJobId] = useState<Id<"jobs"> | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [parsedFields, setParsedFields] = useState<{
    serviceTicketNumber: string;
    description: string;
    specialInstructions: string;
    startTime: string;
  } | null>(null);

  // GPS tracking ref
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackingJobIdRef = useRef<Id<"jobs"> | null>(null);

  const parseTicket = (text: string) => {
    const ticketMatch = text.match(/[Ss]-\d+/);
    const timeMatch = text.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/);
    const specialMatch = text.match(/(?:special\s*(?:instructions?)?|instructions?)\s*[:]\s*(.+)/i);
    const descMatch = text.match(/(?:description|scope|work)\s*[:]\s*(.+)/i);

    setParsedFields({
      serviceTicketNumber: ticketMatch?.[0] ?? "",
      startTime: timeMatch?.[0] ?? "",
      specialInstructions: specialMatch?.[1]?.trim() ?? "",
      description: descMatch?.[1]?.trim() ?? "",
    });
  };

  const saveParsedTicket = async () => {
    if (!pasteJobId || !parsedFields) return;
    try {
      await updateTicketFields({
        id: pasteJobId,
        ...(parsedFields.serviceTicketNumber && { serviceTicketNumber: parsedFields.serviceTicketNumber }),
        ...(parsedFields.description && { description: parsedFields.description }),
        ...(parsedFields.specialInstructions && { specialInstructions: parsedFields.specialInstructions }),
        ...(parsedFields.startTime && { startTime: parsedFields.startTime }),
      });
      toast.success("Ticket info saved!");
      setShowPasteModal(false);
      setPasteText("");
      setParsedFields(null);
      setPasteJobId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  // Start GPS tracking for a job
  const startTracking = (jobId: Id<"jobs">) => {
    if (!user?.id) return;
    trackingJobIdRef.current = jobId;

    const sendLocation = () => {
      if (!trackingJobIdRef.current) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          reportLocation({
            techId: user!.id,
            techName: user!.name,
            jobId: trackingJobIdRef.current!,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Silently fail - GPS might not be available
        },
        { enableHighAccuracy: true }
      );
    };

    sendLocation();
    gpsIntervalRef.current = setInterval(sendLocation, 30000);
  };

  // Stop GPS tracking
  const stopTracking = () => {
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
    trackingJobIdRef.current = null;
    if (user?.id) {
      removeLocation({ techId: user.id });
    }
  };

  useEffect(() => {
    return () => {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
      }
    };
  }, []);

  const handleStatusChange = async (jobId: Id<"jobs">, status: string) => {
    try {
      await updateStatus({
        id: jobId,
        status: status as "in_progress" | "waiting_pickup" | "completed",
      });

      if (status === "in_progress") {
        startTracking(jobId);
        toast.success("Job started - GPS tracking active!");
      } else if (status === "waiting_pickup" || status === "completed") {
        stopTracking();
        toast.success("Status updated!");
      } else {
        toast.success("Status updated!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const goToDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0]);
    setRouteInfo(null);
  };

  const isToday = selectedDate === today;
  const dateLabel = isToday
    ? "Today"
    : new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Type the route items for the map component
  const typedRoute = route as Array<{
    job: {
      _id: Id<"jobs">;
      address: string;
      city: string;
      state: string;
      zip: string;
      storeNumber: string;
      status: string;
      latitude?: number;
      longitude?: number;
      jobType?: string;
      notes?: string;
      serviceTicketNumber?: string;
      startTime?: string;
      description?: string;
      specialInstructions?: string;
    };
    assignment: { routeOrder: number };
    role: "lead" | "assistant";
    assistantTechName?: string;
    leadTechName?: string;
  }> | undefined;

  return (
    <div className="max-w-lg mx-auto">
      {/* Date Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => goToDate(-1)}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition"
        >
          Prev
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">{dateLabel}</h1>
          <p className="text-xs text-slate-500">{selectedDate}</p>
        </div>
        <button
          onClick={() => goToDate(1)}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition"
        >
          Next
        </button>
      </div>

      {!isToday && (
        <button
          onClick={() => setSelectedDate(today)}
          className="w-full mb-4 px-3 py-2 text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition"
        >
          Go to Today
        </button>
      )}

      {/* Route Summary */}
      {typedRoute && typedRoute.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <p className="text-2xl font-bold text-white">{typedRoute.length}</p>
            <p className="text-xs text-slate-400">Jobs</p>
          </div>
          <div className="flex-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {typedRoute.filter((r) => r.job.status === "completed").length}
            </p>
            <p className="text-xs text-emerald-400/70">Done</p>
          </div>
          <div className="flex-1 bg-orange-500/10 rounded-xl border border-orange-500/20 p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {typedRoute.filter((r) => r.job.status === "in_progress").length}
            </p>
            <p className="text-xs text-orange-400/70">Active</p>
          </div>
        </div>
      )}

      {/* Route Map */}
      {typedRoute && typedRoute.length > 0 && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="mb-4 space-y-3">
          <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 280 }}>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                defaultZoom={10}
                defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
                mapId="tech-route-map"
                gestureHandling="greedy"
                disableDefaultUI={true}
                zoomControl={true}
              >
                <TechRouteMap
                  routeItems={typedRoute}
                  onRouteInfo={handleRouteInfo}
                />
              </GoogleMap>
            </APIProvider>
          </div>

          {/* Drive info + Navigate Full Route */}
          <div className="flex items-center gap-2">
            {routeInfo && (
              <div className="flex items-center gap-3 flex-1 bg-white/5 rounded-xl border border-white/10 px-3 py-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <Car className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-slate-300">{routeInfo.totalDistance}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-slate-300">{routeInfo.totalDuration} drive</span>
                </div>
              </div>
            )}
            <a
              href={(() => {
                const jobsWithCoords = typedRoute.filter(
                  (item) => item.job.latitude && item.job.longitude
                );
                if (jobsWithCoords.length === 0) return "#";
                if (jobsWithCoords.length === 1) {
                  const j = jobsWithCoords[0].job;
                  return `https://www.google.com/maps/dir/?api=1&destination=${j.latitude},${j.longitude}`;
                }
                const first = jobsWithCoords[0].job;
                const last = jobsWithCoords[jobsWithCoords.length - 1].job;
                const waypoints = jobsWithCoords
                  .slice(1, -1)
                  .map((item) => `${item.job.latitude},${item.job.longitude}`)
                  .join("|");
                return `https://www.google.com/maps/dir/?api=1&origin=${first.latitude},${first.longitude}&destination=${last.latitude},${last.longitude}&waypoints=${waypoints}&travelmode=driving`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition shrink-0"
            >
              <Route className="w-4 h-4" />
              Navigate Route
            </a>
          </div>
        </div>
      )}

      {/* Job Cards */}
      {typedRoute === undefined ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      ) : typedRoute.length === 0 ? (
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-slate-300 mb-1">No jobs scheduled</h2>
          <p className="text-sm text-slate-500">
            {isToday
              ? "You have no jobs assigned for today."
              : `No jobs on ${dateLabel}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {typedRoute.map((item, index) => {
            const { job, role } = item;
            const config = statusConfig[job.status] ?? statusConfig.assigned;
            const isExpanded = expandedJob === job._id;

            return (
              <div
                key={job._id}
                className={`rounded-xl border overflow-hidden transition-colors ${
                  job.status === "completed"
                    ? "bg-white/[0.02] border-white/5 opacity-60"
                    : job.status === "in_progress"
                    ? "bg-orange-500/5 border-orange-500/20"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <button
                  onClick={() => setExpandedJob(isExpanded ? null : job._id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        job.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : job.status === "in_progress"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-cyan-500/20 text-cyan-400"
                      }`}>
                        {job.status === "completed" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {routeInfo?.legDurations?.[index - 1] && index > 0 && (
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {routeInfo.legDurations[index - 1]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-slate-500">
                          #{job.storeNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {role === "assistant" && (
                          <span className="px-1.5 py-0.5 bg-white/10 text-slate-400 rounded text-xs border border-white/10">
                            Helper
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white truncate">
                        {job.address}
                      </p>
                      <p className="text-xs text-slate-400">
                        {job.city}, {job.state} {job.zip}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-600 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                    {/* Service Ticket Info */}
                    {(job.serviceTicketNumber || job.startTime || job.description || job.specialInstructions) && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1">
                          <Ticket className="w-3 h-3" />
                          Service Ticket
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {job.serviceTicketNumber && (
                            <div>
                              <p className="text-xs text-cyan-500/70">Ticket #</p>
                              <p className="text-cyan-300 font-mono font-medium">{job.serviceTicketNumber}</p>
                            </div>
                          )}
                          {job.startTime && (
                            <div>
                              <p className="text-xs text-cyan-500/70">Start Time</p>
                              <p className="text-cyan-300 font-medium">{job.startTime}</p>
                            </div>
                          )}
                        </div>
                        {job.description && (
                          <div>
                            <p className="text-xs text-cyan-500/70">Description</p>
                            <p className="text-sm text-slate-300">{job.description}</p>
                          </div>
                        )}
                        {job.specialInstructions && (
                          <div>
                            <p className="text-xs text-cyan-500/70">Special Instructions</p>
                            <p className="text-sm text-slate-300 font-medium">{job.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paste Ticket Button */}
                    <button
                      onClick={() => {
                        setPasteJobId(job._id);
                        setPasteText("");
                        setParsedFields(null);
                        setShowPasteModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition"
                    >
                      <ClipboardPaste className="w-4 h-4" />
                      Paste Ticket
                    </button>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {job.jobType && (
                        <div>
                          <p className="text-xs text-slate-500">Type</p>
                          <p className="text-slate-300">{job.jobType}</p>
                        </div>
                      )}
                      {item.assistantTechName && (
                        <div>
                          <p className="text-xs text-slate-500">Helper</p>
                          <p className="text-slate-300">{item.assistantTechName}</p>
                        </div>
                      )}
                      {role === "assistant" && item.leadTechName && (
                        <div>
                          <p className="text-xs text-slate-500">Lead</p>
                          <p className="text-slate-300">{item.leadTechName}</p>
                        </div>
                      )}
                    </div>

                    {job.notes && (
                      <div className="bg-white/5 rounded-xl border border-white/10 p-3">
                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                          {job.notes}
                        </p>
                      </div>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${job.address}, ${job.city}, ${job.state} ${job.zip}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition justify-center"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex gap-2">
                      {job.status === "assigned" && (
                        <button
                          onClick={() => handleStatusChange(job._id, "in_progress")}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl text-sm font-medium hover:bg-orange-500/25 transition"
                        >
                          <Clock className="w-4 h-4" />
                          Start Job
                        </button>
                      )}
                      {job.status === "in_progress" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(job._id, "waiting_pickup")}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/25 transition"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Waiting Pickup
                          </button>
                          <button
                            onClick={() => handleStatusChange(job._id, "completed")}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </button>
                        </>
                      )}
                      {job.status === "waiting_pickup" && (
                        <button
                          onClick={() => handleStatusChange(job._id, "completed")}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </button>
                      )}
                      {job.status === "completed" && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paste Ticket Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Paste Ticket</h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!parsedFields ? (
              <>
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 mb-3">
                  <p className="text-xs text-cyan-400">
                    Paste the ticket email text below and we will pull out the key info.
                  </p>
                </div>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste ticket email text here..."
                  rows={6}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 mb-3 resize-none font-mono"
                />
                <button
                  onClick={() => parseTicket(pasteText)}
                  disabled={!pasteText.trim()}
                  className="w-full px-4 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Parse Ticket
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-400 mb-3">
                  Review and edit the parsed fields, then save.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Ticket #</label>
                    <input
                      type="text"
                      value={parsedFields.serviceTicketNumber}
                      onChange={(e) =>
                        setParsedFields({ ...parsedFields, serviceTicketNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                    <input
                      type="text"
                      value={parsedFields.startTime}
                      onChange={(e) =>
                        setParsedFields({ ...parsedFields, startTime: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Description</label>
                    <input
                      type="text"
                      value={parsedFields.description}
                      onChange={(e) =>
                        setParsedFields({ ...parsedFields, description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Special Instructions</label>
                    <input
                      type="text"
                      value={parsedFields.specialInstructions}
                      onChange={(e) =>
                        setParsedFields({ ...parsedFields, specialInstructions: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setParsedFields(null)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={saveParsedTicket}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
