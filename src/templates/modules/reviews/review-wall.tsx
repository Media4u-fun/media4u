"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Review {
  _id: string;
  customerName: string;
  customerLocation?: string;
  rating: number;
  text: string;
  serviceType?: string;
  submittedAt: number;
}

interface ReviewWallProps {
  reviews: Review[];
  serviceTypes?: string[];
}

export function ReviewWall({ reviews, serviceTypes = [] }: ReviewWallProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? reviews.filter((r) => r.serviceType === filter)
    : reviews;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section id="reviews" className="py-20 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(avgRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-600"
                }`}
              />
            ))}
            <span className="text-sm text-zinc-400 ml-2">
              {avgRating.toFixed(1)} average from {reviews.length} reviews
            </span>
          </div>
        </div>

        {/* Filter by service type */}
        {serviceTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                !filter
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/[0.05] text-zinc-400 border border-white/[0.06] hover:text-white"
              }`}
            >
              All
            </button>
            {serviceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  filter === type
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/[0.05] text-zinc-400 border border-white/[0.06] hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                &quot;{review.text}&quot;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {review.customerName}
                  </p>
                  {review.customerLocation && (
                    <p className="text-xs text-zinc-500">
                      {review.customerLocation}
                    </p>
                  )}
                </div>
                {review.serviceType && (
                  <span className="text-xs text-zinc-500 bg-white/[0.05] px-2 py-1 rounded-full">
                    {review.serviceType}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
