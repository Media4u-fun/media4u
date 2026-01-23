import { motion } from "motion/react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const baseClasses = "bg-white/5 rounded animate-pulse";

  const variants = {
    text: "h-4 w-full",
    card: "h-64 w-full rounded-2xl",
    avatar: "h-12 w-12 rounded-full",
  };

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    />
  );
}

export function BlogPostSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] p-6"
    >
      <Skeleton variant="card" className="mb-4" />
      <Skeleton className="h-6 mb-3" />
      <Skeleton className="h-4 mb-3 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </motion.div>
  );
}

export function ProjectSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]"
    >
      <Skeleton variant="card" className="mb-0" />
      <div className="p-6">
        <Skeleton className="h-6 mb-3" />
        <Skeleton className="h-4 mb-2 w-3/4" />
      </div>
    </motion.div>
  );
}
