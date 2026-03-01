"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// ---------------------------------------------------------------------------
// Class-based Error Boundary (required by React for catching render errors)
// ---------------------------------------------------------------------------

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AdminErrorBoundary]", error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-2 max-w-md">
            This section encountered an error. Your data is safe - this is a display issue only.
          </p>
          {this.state.error && (
            <p className="text-xs text-gray-600 font-mono mb-6 max-w-md truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => this.handleReset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Reusable inline error state (for query failures / empty data)
// ---------------------------------------------------------------------------

export function ErrorState({
  message = "Failed to load data",
  onRetry,
  compact = false,
}: {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto flex items-center gap-1 text-xs hover:text-red-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-white font-semibold mb-1">{message}</p>
      <p className="text-gray-500 text-sm mb-5">Check your connection and try again.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Query state helper - handles loading / error / empty in one place
// ---------------------------------------------------------------------------

export function QueryState<T>({
  data,
  loading,
  error,
  empty,
  loadingRows = 4,
}: {
  data: T[] | undefined | null;
  loading: React.ReactNode;
  error?: React.ReactNode;
  empty: React.ReactNode;
  loadingRows?: number;
}) {
  if (data === undefined) return <>{loading ?? <LoadingSkeleton rows={loadingRows} />}</>;
  if (data === null) return <>{error ?? <ErrorState />}</>;
  if (data.length === 0) return <>{empty}</>;
  return null;
}
