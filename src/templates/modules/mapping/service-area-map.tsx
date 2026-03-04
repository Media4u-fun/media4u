"use client";

import { MapPin } from "lucide-react";

interface ServiceArea {
  name: string;
  zipCodes?: string[];
  description?: string;
}

interface ServiceAreaMapProps {
  businessName: string;
  areas: ServiceArea[];
  centerAddress?: string;
}

// Service area display component.
// In production, this integrates with LeadRoute API for interactive maps.
// For now, it renders a styled list of service areas with a placeholder map.
export function ServiceAreaMap({
  businessName,
  areas,
  centerAddress,
}: ServiceAreaMapProps) {
  return (
    <section id="service-area" className="py-20 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
          Our Service Area
        </h2>
        <p className="text-zinc-400 text-center mb-12">
          {businessName} proudly serves the following areas.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map placeholder - will integrate with LeadRoute */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden aspect-[4/3] flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-sm text-zinc-400">
                Interactive map powered by LeadRoute
              </p>
              {centerAddress && (
                <p className="text-xs text-zinc-500 mt-2">
                  Centered on: {centerAddress}
                </p>
              )}
            </div>
          </div>

          {/* Service areas list */}
          <div className="space-y-4">
            {areas.map((area) => (
              <div
                key={area.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold">{area.name}</h3>
                </div>
                {area.description && (
                  <p className="text-sm text-zinc-400 ml-11">
                    {area.description}
                  </p>
                )}
                {area.zipCodes && area.zipCodes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-11 mt-2">
                    {area.zipCodes.map((zip) => (
                      <span
                        key={zip}
                        className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-zinc-500"
                      >
                        {zip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
