/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Star, Globe, ExternalLink, Instagram, Youtube, Send, CheckCircle, Loader2, Heart } from "lucide-react";

export default function CommunityPage() {
  const members = useQuery(api.community.getApprovedMembers);

  return (
    <div className="mesh-bg min-h-screen pt-24">
      {/* Hero Section */}
      <Section className="pt-12 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-brand-light">
            Curated Creators
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-white">
            VR
            <br />
            <span className="text-white">
              Community
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A curated showcase of trusted creators building meaningful spaces in the virtual world.
            These are the people shaping the future of virtual worlds.
          </p>
        </motion.div>
      </Section>

      {/* Community Grid */}
      <Section className="pb-32">
        {!members || members.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Coming Soon</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Our community is growing. Check back soon to explore amazing VR worlds
              created by talented builders across virtual worlds.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, idx) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <CommunityCard member={member} />
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* Request Invite Section */}
      <Section className="pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light/10 via-brand-dark/10 to-brand-dark/10" />
          <div className="absolute inset-0 glass" />
          <div className="absolute inset-0 rounded-3xl border border-white/10" />

          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
                Want to Join the Community?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Request an invite to showcase your VR world in our curated community.
                We review each request personally.
              </p>
            </div>
            <InviteRequestForm />
          </div>
        </motion.div>
      </Section>

      {/* CTA Section */}
      <Section className="pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-white">
            Want to Build a Virtual World?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Whether you&apos;re dreaming of a virtual storefront or an immersive experience - we can help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors"
            >
              Start Your Project
            </Link>
            <Link
              href="/vr"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-brand/40 text-zinc-300 text-sm font-medium hover:border-brand-light hover:text-white transition-colors"
            >
              Explore VR Services
            </Link>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}

// Invite Request Form
function InviteRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const requestInvite = useMutation(api.community.requestInvite);
  const notifyAdmin = useAction(api.community.notifyAdminInviteRequest);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestInvite({
        name: name.trim(),
        email: email.trim(),
        message: message.trim() || undefined,
      });

      // Send admin notification (don't wait for it)
      notifyAdmin({
        name: name.trim(),
        email: email.trim(),
        message: message.trim() || undefined,
      }).catch(console.error);

      setIsSubmitted(true);
    } catch (err: any) {
      // Extract the actual error message from Convex errors
      const errorMessage = err.data?.message || err.message || "Something went wrong. Please try again.";
      // Clean up Convex error format if needed
      const cleanMessage = errorMessage.includes("Uncaught Error:")
        ? errorMessage.split("Uncaught Error:")[1]?.trim()
        : errorMessage;
      setError(cleanMessage || "Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Request Received!</h3>
        <p className="text-gray-400">
          We&apos;ll review your request and get back to you soon.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
          required
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
          required
        />
      </div>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your VR world (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Request Invite
          </>
        )}
      </button>
    </form>
  );
}

// Helper: get liked IDs from localStorage
function getLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem("community-likes");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

// Helper: save liked IDs to localStorage
function saveLikedIds(ids: Set<string>) {
  try {
    localStorage.setItem("community-likes", JSON.stringify([...ids]));
  } catch {
    // localStorage not available
  }
}

// Community Member Card
function CommunityCard({ member }: { member: any }) {
  const mainImage = member.images?.[0];
  const [isLiked, setIsLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState<number>(member.likes || 0);
  const likeMember = useMutation(api.community.likeMember);
  const unlikeMember = useMutation(api.community.unlikeMember);

  // Check localStorage on mount
  useEffect(() => {
    const liked = getLikedIds();
    setIsLiked(liked.has(member._id));
  }, [member._id]);

  // Sync server likes when member data changes
  useEffect(() => {
    setOptimisticLikes(member.likes || 0);
  }, [member.likes]);

  const handleLike = useCallback(async () => {
    const liked = getLikedIds();

    if (isLiked) {
      // Unlike
      setIsLiked(false);
      setOptimisticLikes((prev) => Math.max(prev - 1, 0));
      liked.delete(member._id);
      saveLikedIds(liked);
      try {
        await unlikeMember({ id: member._id });
      } catch {
        // Revert on error
        setIsLiked(true);
        setOptimisticLikes((prev) => prev + 1);
        liked.add(member._id);
        saveLikedIds(liked);
      }
    } else {
      // Like
      setIsLiked(true);
      setOptimisticLikes((prev) => prev + 1);
      liked.add(member._id);
      saveLikedIds(liked);
      try {
        await likeMember({ id: member._id });
      } catch {
        // Revert on error
        setIsLiked(false);
        setOptimisticLikes((prev) => Math.max(prev - 1, 0));
        liked.delete(member._id);
        saveLikedIds(liked);
      }
    }
  }, [isLiked, member._id, likeMember, unlikeMember]);

  return (
    <div className="group relative glass-elevated rounded-2xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300 h-full flex flex-col">
      {/* Featured Badge */}
      {member.featured && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1 border border-yellow-500/30 backdrop-blur-sm">
          <Star className="w-3 h-3" /> Featured
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={member.worldName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-light/20 to-brand-dark/20 flex items-center justify-center">
            <Globe className="w-16 h-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-white">{member.worldName}</h3>
            <p className="text-sm text-brand-light mb-3">by {member.name}</p>
          </div>
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 ml-3 shrink-0 group/like"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isLiked ? "liked" : "not-liked"}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-500 group-hover/like:text-red-400"
                  }`}
                />
              </motion.div>
            </AnimatePresence>
            {optimisticLikes > 0 && (
              <span className={`text-sm font-medium ${isLiked ? "text-red-400" : "text-gray-500"}`}>
                {optimisticLikes}
              </span>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-grow">{member.description}</p>

        {/* Links */}
        <div className="flex items-center gap-3 flex-wrap mt-auto">
          {member.multiverseUrl && (
            <a
              href={member.multiverseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light/10 text-brand-light text-sm font-medium hover:bg-brand-light/20 transition-colors border border-brand-light/30"
            >
              <Globe className="w-4 h-4" />
              Explore
            </a>
          )}
          {member.websiteUrl && (
            <a
              href={member.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-colors border border-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              Website
            </a>
          )}
        </div>

        {/* Social Links */}
        {member.socialLinks && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            {member.socialLinks.instagram && (
              <a
                href={member.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-pink-400 hover:bg-brand-dark/10 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {member.socialLinks.youtube && (
              <a
                href={member.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {member.socialLinks.tiktok && (
              <a
                href={member.socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            )}
            {member.socialLinks.twitter && (
              <a
                href={member.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
