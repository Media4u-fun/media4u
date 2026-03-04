"use client";

import { Navigation } from "lucide-react";

interface RouteStop {
  name: string;
  address: string;
  estimatedTime?: string;
}

interface RouteDisplayProps {
  routeName: string;
  stops: RouteStop[];
  totalDistance?: string;
  totalTime?: string;
}

// Visual display of a service route.
// In production, integrates with LeadRoute for real route optimization.
export function RouteDisplay({
  routeName,
  stops,
  totalDistance,
  totalTime,
}: RouteDisplayProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">{routeName}</h3>
        </div>
        <div className="flex gap-4 text-xs text-zinc-500">
          {totalDistance && <span>{totalDistance}</span>}
          {totalTime && <span>{totalTime}</span>}
        </div>
      </div>

      <div className="space-y-0">
        {stops.map((stop, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                index === 0
                  ? "bg-green-400"
                  : index === stops.length - 1
                  ? "bg-red-400"
                  : "bg-cyan-400"
              }`} />
              {index < stops.length - 1 && (
                <div className="w-px h-full min-h-[2rem] bg-white/[0.06]" />
              )}
            </div>

            {/* Stop info */}
            <div className="pb-4">
              <p className="text-sm font-medium">{stop.name}</p>
              <p className="text-xs text-zinc-500">{stop.address}</p>
              {stop.estimatedTime && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  ETA: {stop.estimatedTime}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
