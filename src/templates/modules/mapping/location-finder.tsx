"use client";

import { useState } from "react";
import { Search, MapPin, CheckCircle, XCircle } from "lucide-react";

interface LocationFinderProps {
  servicedZipCodes: string[];
  businessName: string;
  onSearch?: (zipCode: string) => void;
}

// "Do you service my area?" widget.
// Customer enters zip code, we check against the servicedZipCodes list.
// In production, this can also call LeadRoute API for radius-based checks.
export function LocationFinder({
  servicedZipCodes,
  businessName,
  onSearch,
}: LocationFinderProps) {
  const [zipCode, setZipCode] = useState("");
  const [result, setResult] = useState<"found" | "not_found" | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = zipCode.trim();
    if (!clean) return;

    onSearch?.(clean);
    setResult(servicedZipCodes.includes(clean) ? "found" : "not_found");
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold">Check Your Area</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Enter your zip code to see if {businessName} services your area.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter zip code"
          value={zipCode}
          onChange={(e) => {
            setZipCode(e.target.value);
            setResult(null);
          }}
          maxLength={10}
          className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.06] rounded-full text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {result === "found" && (
        <div className="flex items-center gap-2 mt-4 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Great news! We service your area.</span>
        </div>
      )}

      {result === "not_found" && (
        <div className="flex items-center gap-2 mt-4 text-amber-400">
          <XCircle className="w-5 h-5" />
          <span className="text-sm">
            We don&apos;t currently service that area, but contact us - we may be expanding soon!
          </span>
        </div>
      )}
    </div>
  );
}
