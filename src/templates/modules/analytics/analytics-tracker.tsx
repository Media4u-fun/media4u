"use client";

import { useEffect } from "react";

interface AnalyticsTrackerProps {
  orgId: string;
  pageUrl: string;
  onPageView?: (data: { orgId: string; pageUrl: string; timestamp: number; referrer: string }) => void;
}

// Basic client-side page view tracker.
// Fires once per mount with page URL, timestamp, and referrer.
export function AnalyticsTracker({ orgId, pageUrl, onPageView }: AnalyticsTrackerProps) {
  useEffect(() => {
    onPageView?.({
      orgId,
      pageUrl,
      timestamp: Date.now(),
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
  }, [orgId, pageUrl, onPageView]);

  // This component renders nothing - it just tracks
  return null;
}
