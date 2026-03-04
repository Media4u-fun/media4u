"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterSignupProps {
  onSubscribe: (email: string, name?: string) => Promise<void>;
  heading?: string;
  description?: string;
}

export function NewsletterSignup({
  onSubscribe,
  heading = "Stay in the Loop",
  description = "Get tips, updates, and exclusive offers delivered to your inbox.",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      await onSubscribe(email);
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
        <p className="text-sm text-zinc-300">You are subscribed!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.05] to-blue-600/[0.05] p-8">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold">{heading}</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">{description}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.06] rounded-full text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
        >
          {submitting ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
