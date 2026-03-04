"use client";

import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";

interface ReviewSubmitProps {
  serviceTypes?: string[];
  onSubmit: (review: {
    customerName: string;
    customerLocation?: string;
    rating: number;
    text: string;
    serviceType?: string;
  }) => Promise<void>;
}

export function ReviewSubmit({ serviceTypes = [], onSubmit }: ReviewSubmitProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating || !text) return;

    setSubmitting(true);
    try {
      await onSubmit({
        customerName: name,
        customerLocation: location || undefined,
        rating,
        text,
        serviceType: serviceType || undefined,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Thank you for your review!</h3>
        <p className="text-sm text-zinc-400">
          Your review has been submitted and will appear after approval.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
      <h3 className="text-xl font-semibold mb-6">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="text"
            placeholder="City, State"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {serviceTypes.length > 0 && (
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">Select service type</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}

        {/* Star rating */}
        <div>
          <p className="text-sm text-zinc-400 mb-2">Your rating *</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    i <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Tell us about your experience *"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
        />

        <button
          type="submit"
          disabled={submitting || !name || !rating || !text}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
