/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ReactElement } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card, CardIcon } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Home, Globe, Star, Coins, ExternalLink, Instagram, Youtube, Send, CheckCircle, Loader2, Sparkles, Users, MapPin, Play, X, ChevronLeft, ChevronRight, Heart, MessageCircle } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";

const FEATURES = [
  { label: "Interactive Elements", icon: "touch" },
  { label: "Multi-User Support", icon: "users" },
  { label: "Cross-Platform", icon: "devices" },
] as const;

const USE_CASES = [
  {
    title: "Virtual Events",
    description: "Host conferences, concerts, and gatherings in immersive 3D spaces that transcend physical limitations.",
    icon: "event",
    glow: "cyan" as const,
  },
  {
    title: "Virtual Showrooms",
    description: "Showcase products in interactive environments where customers can explore and engage from anywhere.",
    icon: "showroom",
    glow: "magenta" as const,
  },
  {
    title: "Education & Training",
    description: "Create hands-on learning experiences with realistic simulations and interactive tutorials.",
    icon: "education",
    glow: "purple" as const,
  },
  {
    title: "Entertainment",
    description: "Build gaming worlds, interactive narratives, and social experiences that captivate audiences.",
    icon: "entertainment",
    glow: "cyan" as const,
  },
  {
    title: "Art & Galleries",
    description: "Transform digital art into walkable exhibitions with immersive viewing experiences.",
    icon: "gallery",
    glow: "magenta" as const,
  },
  {
    title: "Virtual Hubs",
    description: "Design interconnected virtual spaces that serve as gateways to endless digital experiences.",
    icon: "hub",
    glow: "purple" as const,
  },
];

function FeatureIcon({ type }: { type: string }): ReactElement | null {
  const icons: Record<string, ReactElement> = {
    touch: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    devices: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    event: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
    showroom: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    education: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    entertainment: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    gallery: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    hub: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
      </svg>
    ),
  };

  return icons[type] || null;
}

function VRHeadsetVisual() {
  const [particles, setParticles] = useState<Array<{ top: string; left: string }> | null>(null);

  // Generate particle positions only on client after hydration
  useEffect(() => {
    setParticles(
      [...Array(6)].map(() => ({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
      }))
    );
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-light/20 via-brand-dark/20 to-brand-dark/20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Morphing gradient shape */}
      <motion.div
        className="absolute inset-8 animate-morph bg-gradient-to-br from-brand-light via-brand to-brand-dark"
        style={{
          filter: "blur(1px)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner dark core */}
      <motion.div
        className="absolute inset-16 rounded-full bg-[#03030a]/80 backdrop-blur-xl border border-white/10"
        animate={{
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* VR Headset Icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          className="w-24 h-24 md:w-32 md:h-32 text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={0.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      </motion.div>

      {/* Floating particles - only render if positions are generated */}
      {particles && particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-brand-light/60"
          style={{
            top: particle.top,
            left: particle.left,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
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

// Like button component for member cards
function LikeButton({ memberId, likes }: { memberId: string; likes: number }) {
  const [isLiked, setIsLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(likes);
  const likeMember = useMutation(api.community.likeMember);
  const unlikeMember = useMutation(api.community.unlikeMember);

  useEffect(() => {
    setIsLiked(getLikedIds().has(memberId));
  }, [memberId]);

  useEffect(() => {
    setOptimisticLikes(likes);
  }, [likes]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const liked = getLikedIds();

    if (isLiked) {
      setIsLiked(false);
      setOptimisticLikes((prev) => Math.max(prev - 1, 0));
      liked.delete(memberId);
      saveLikedIds(liked);
      try {
        await unlikeMember({ id: memberId as any });
      } catch {
        setIsLiked(true);
        setOptimisticLikes((prev) => prev + 1);
        liked.add(memberId);
        saveLikedIds(liked);
      }
    } else {
      setIsLiked(true);
      setOptimisticLikes((prev) => prev + 1);
      liked.add(memberId);
      saveLikedIds(liked);
      try {
        await likeMember({ id: memberId as any });
      } catch {
        setIsLiked(false);
        setOptimisticLikes((prev) => Math.max(prev - 1, 0));
        liked.delete(memberId);
        saveLikedIds(liked);
      }
    }
  }, [isLiked, memberId, likeMember, unlikeMember]);

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-1.5 group/like"
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
  );
}

// Comment count display for creator cards
function CardCommentCount({ memberId }: { memberId: Id<"communityMembers"> }) {
  const count = useQuery(api.communityComments.getApprovedCommentCount, { memberId });
  if (!count) return null;
  return (
    <div className="flex items-center gap-1.5 text-gray-500">
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm font-medium">{count}</span>
    </div>
  );
}

// Comment section for community member modal
function CommentSection({ memberId }: { memberId: Id<"communityMembers"> }) {
  const comments = useQuery(api.communityComments.getApprovedComments, { memberId });
  const submitComment = useMutation(api.communityComments.submitComment);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await submitComment({ memberId, authorName: name, content });
      setName("");
      setContent("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-brand-light" />
        Comments {comments && comments.length > 0 && <span className="text-sm text-gray-400">({comments.length})</span>}
      </h3>

      {/* Existing comments */}
      {comments && comments.length > 0 && (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment._id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-brand-light">{comment.authorName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {comments && comments.length === 0 && (
        <p className="text-sm text-gray-500 mb-6">No comments yet. Be the first!</p>
      )}

      {/* Submit form */}
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-400">Thanks! Your comment is pending approval.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50 transition-colors"
          />
          <textarea
            placeholder="Leave a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50 transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-light/20 text-brand-light text-sm font-medium hover:bg-brand-light/30 transition-colors border border-brand-light/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function VRPageClient() {
  const experiences = useQuery(api.vr.getAllExperiences);
  const communityMembers = useQuery(api.community.getApprovedMembers);
  const communityStats = useQuery(api.community.getCommunityStats);
  const [filterType, setFilterType] = useState<"all" | "property" | "destination">("all");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredExperiences = experiences
    ? experiences.filter((exp) => filterType === "all" || exp.type === filterType)
    : [];

  return (
    <div className="mesh-bg min-h-screen pt-24">
      {/* Hero Section with Invite Request */}
      <Section className="pt-12 md:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-brand-light/10 border border-brand-light/30">
              <Sparkles className="w-4 h-4 text-brand-light" />
              <span className="text-sm font-medium text-brand-light">Invite-Only Community</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
              Join the VR Community
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Hey! I&apos;m MrHarmony, and welcome to the VR Community - a growing space where creators come together to share, inspire, and build the future of virtual worlds.
            </p>
            <p className="text-gray-400 mb-6">
              Right now, this is your home base - a place to get featured, connect with fellow creators, and show off what you&apos;ve built. But this is just the beginning. We&apos;re building toward a full platform where you&apos;ll be able to log in, create your own spaces, sell your properties, showcase your artwork, and more.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Personally reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-light"></div>
                <span>Free to join</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">
                <span className="text-brand-light font-medium">What you&apos;ll need:</span> A screenshot of your world, your world link, and a brief description. Optional: a video tour link.
              </p>
            </div>
          </motion.div>

          {/* Right: Invite Request Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InviteRequestForm />
          </motion.div>
        </div>
      </Section>

      {/* Community Stats Banner */}
      {communityStats && (communityStats.totalWorlds > 0 || communityStats.totalCreators > 0) && (
        <Section className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-brand-light" />
                <span className="text-3xl font-display font-bold text-white">{communityStats.totalWorlds}</span>
              </div>
              <p className="text-sm text-gray-400">Virtual Worlds</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-brand-light" />
                <span className="text-3xl font-display font-bold text-white">{communityStats.totalCreators}</span>
              </div>
              <p className="text-sm text-gray-400">Creators</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-3xl font-display font-bold text-white">{communityStats.featuredCount}</span>
              </div>
              <p className="text-sm text-gray-400">Featured</p>
            </div>
            {communityStats.totalLikes > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                  <span className="text-3xl font-display font-bold text-white">{communityStats.totalLikes}</span>
                </div>
                <p className="text-sm text-gray-400">Likes</p>
              </div>
            )}
          </motion.div>
        </Section>
      )}

      {/* Community Members Section - MOVED UP */}
      {communityMembers && communityMembers.length > 0 && (
        <Section>
          <SectionHeader
            tag="Our Community"
            title="Meet Our "
            highlight="Creators"
            description="The people behind the worlds you love. Get to know the creators, explore their builds, and become part of something bigger."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityMembers.map((member: any, idx: number) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div
                  className="group relative glass-elevated rounded-2xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300 cursor-pointer h-full flex flex-col"
                  onClick={() => { setSelectedMember(member); setCurrentImageIndex(0); }}
                >
                  {/* Featured Badge */}
                  {member.featured && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1 border border-yellow-500/30 backdrop-blur-sm">
                      <Star className="w-3 h-3" /> Featured
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {member.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.images[0]}
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
                      <div className="ml-3 shrink-0 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <CardCommentCount memberId={member._id} />
                        <LikeButton memberId={member._id} likes={member.likes || 0} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-grow">{member.description}</p>

                    {/* Links */}
                    <div className="flex items-center gap-3 flex-wrap mt-auto" onClick={(e) => e.stopPropagation()}>
                      {member.videoUrl && (
                        <a
                          href={member.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-dark/20 text-brand-light text-sm font-medium hover:bg-brand-dark/30 transition-colors border border-brand-dark/30"
                        >
                          <Play className="w-4 h-4" />
                          Video Tour
                        </a>
                      )}
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
                    {member.socialLinks && (member.socialLinks.instagram || member.socialLinks.youtube || member.socialLinks.tiktok) && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
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
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Experiences Section */}
      {experiences && experiences.length > 0 && (
        <Section>
          <SectionHeader
            tag="Explore"
            title="Featured VR "
            highlight="Experiences"
            description="Discover our curated collection of virtual properties and destinations."
          />

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {["all", "property", "destination"].map((type) => (
              <motion.button
                key={type}
                onClick={() => setFilterType(type as "all" | "property" | "destination")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-medium transition-all border ${
                  filterType === type
                    ? "bg-brand-light/20 text-brand-light border-brand-light/50"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-brand-light/30"
                }`}
              >
                {type === "all" ? "All" : type === "property" ? "Properties" : "Destinations"}
              </motion.button>
            ))}
          </div>

          {/* Experiences Grid */}
          {filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map((experience: any, idx: any) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Link href={`/vr/${experience.slug}`}>
                    <Card
                      glow="cyan"
                      className="h-full overflow-hidden hover:translate-y-[-8px] transition-all cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden rounded-lg mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={experience.thumbnailImage}
                          alt={experience.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {experience.categories.slice(0, 2).map((cat: any) => (
                            <span
                              key={cat}
                              className="text-xs px-2 py-1 rounded-full bg-brand-light/20 text-brand-light border border-brand-light/30"
                            >
                              {cat}
                            </span>
                          ))}
                          {experience.categories.length > 2 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-400">
                              +{experience.categories.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2">{experience.title}</h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {experience.description}
                        </p>

                        {/* Type Badge & Price */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 flex items-center gap-1">
                            {experience.type === "property" ? (
                              <><Home className="w-3 h-3" /> Property</>
                            ) : (
                              <><Globe className="w-3 h-3" /> Destination</>
                            )}
                          </span>
                          {experience.featured && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        {experience.price !== undefined && experience.price > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-brand-light flex items-center gap-1">
                              <Coins className="w-4 h-4" /> {experience.price.toLocaleString()} Meta Coins
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <Button variant="ghost" size="sm" className="w-full">
                          View Experience →
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No experiences found. Stay tuned!</p>
            </div>
          )}
        </Section>
      )}

      {/* VR Overview Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
              Where Creators Come Together
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              This community is for anyone building in virtual worlds - whether you&apos;re designing properties, creating art, hosting events, or just getting started. Right now you can get featured and connect with other creators. Soon, you&apos;ll have your own profile, a marketplace to sell your work, and tools to grow your audience.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-4">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-full glass border border-white/10 hover:border-brand-light/30 transition-colors"
                >
                  <span className="text-brand-light">
                    <FeatureIcon type={feature.icon} />
                  </span>
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* VR Visual Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VRHeadsetVisual />
          </motion.div>
        </div>
      </Section>

      {/* Use Cases Grid */}
      <Section>
        <SectionHeader
          tag="Applications"
          title="Endless "
          highlight="Possibilities"
          description="Discover how VR technology can transform your industry and create meaningful connections."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card glow={useCase.glow} className="h-full">
                <CardIcon>
                  <FeatureIcon type={useCase.icon} />
                </CardIcon>
                <h3 className="text-xl font-display font-semibold mb-3 text-white">
                  {useCase.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-light/10 via-brand-dark/10 to-brand-dark/10" />
          <div className="absolute inset-0 glass" />

          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl border border-white/10" />

          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">
              Be Part of What&apos;s Next
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              This community is growing into a full platform where you can create, sell, and share your virtual creations. Get in early and help shape what it becomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="secondary" size="lg">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Member Detail Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a12] rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Gallery */}
            <div className="relative h-64 md:h-96 overflow-hidden">
              {selectedMember.images && selectedMember.images.length > 0 ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedMember.images[currentImageIndex]}
                    alt={selectedMember.worldName}
                    className="w-full h-full object-cover"
                  />
                  {/* Image Navigation */}
                  {selectedMember.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev === 0 ? selectedMember.images.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev === selectedMember.images.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      {/* Image Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {selectedMember.images.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(idx);
                            }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentImageIndex ? "bg-brand-light" : "bg-white/50 hover:bg-white/70"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-light/20 to-brand-dark/20 flex items-center justify-center">
                  <Globe className="w-24 h-24 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
                    {selectedMember.worldName}
                  </h2>
                  <p className="text-brand-light">by {selectedMember.name}</p>
                </div>
                {selectedMember.featured && (
                  <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium flex items-center gap-1 border border-yellow-500/30">
                    <Star className="w-4 h-4" /> Featured
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedMember.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {selectedMember.videoUrl && (
                  <a
                    href={selectedMember.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-dark/20 text-brand-light font-medium hover:bg-brand-dark/30 transition-colors border border-brand-dark/30"
                  >
                    <Play className="w-5 h-5" />
                    Video Tour
                  </a>
                )}
                {selectedMember.multiverseUrl && (
                  <a
                    href={selectedMember.multiverseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light font-medium hover:bg-brand-light/30 transition-colors border border-brand-light/30"
                  >
                    <Globe className="w-5 h-5" />
                    Explore World
                  </a>
                )}
                {selectedMember.websiteUrl && (
                  <a
                    href={selectedMember.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-colors border border-white/10"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Website
                  </a>
                )}
              </div>

              {/* Social Links */}
              {selectedMember.socialLinks && (selectedMember.socialLinks.instagram || selectedMember.socialLinks.youtube || selectedMember.socialLinks.tiktok) && (
                <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                  <span className="text-sm text-gray-400">Follow:</span>
                  {selectedMember.socialLinks.instagram && (
                    <a
                      href={selectedMember.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-pink-400 hover:bg-brand-dark/10 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {selectedMember.socialLinks.youtube && (
                    <a
                      href={selectedMember.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {selectedMember.socialLinks.tiktok && (
                    <a
                      href={selectedMember.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}

              {/* Comments */}
              <CommentSection memberId={selectedMember._id} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Invite Request Form Component
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

      // Send admin notification
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
      <div className="glass-elevated rounded-2xl p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Request Received!</h3>
          <p className="text-gray-400">
            Thanks for your interest! I&apos;ll review your request and get back to you soon with an invite.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="glass-elevated rounded-2xl p-8">
      <h3 className="text-xl font-semibold text-white mb-2">Request an Invite</h3>
      <p className="text-gray-400 text-sm mb-6">
        Tell me a bit about yourself and your VR world. I&apos;ll send you an invite to submit your showcase.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Tell me about your VR world or project..."
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
          className="w-full py-3 rounded-lg bg-brand-light text-white font-semibold hover:bg-brand transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
}
