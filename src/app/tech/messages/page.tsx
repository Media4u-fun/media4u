"use client";

import { MessageSquare } from "lucide-react";

export default function TechMessages() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
        <MessageSquare className="w-12 h-12 text-cyan-500/50 mx-auto mb-3" />
        <h2 className="text-lg font-medium text-white mb-1">Messages</h2>
        <p className="text-sm text-slate-500">
          Coming soon - chat with your team and dispatch.
        </p>
      </div>
    </div>
  );
}
