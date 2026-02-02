"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";
import { useMutation, useAction } from "convex/react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || null;

  const verifyToken = useMutation(api.passwordReset.verifyResetToken);
  const resetPassword = useAction(api.passwordReset.resetPassword);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setError("No reset token provided");
        setVerifying(false);
        return;
      }

      try {
        const result = await verifyToken({ token });
        if (result.valid) {
          setTokenValid(true);
        } else {
          setError(result.error || "Invalid reset token");
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setError("Failed to verify reset token");
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token, verifyToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({ token: token!, newPassword: password });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-gray-400">Verifying reset link...</p>
        </motion.div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md px-6"
        >
          <div className="glass-elevated rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-display font-bold mb-4 text-white">
              Invalid Reset Link
            </h1>

            <p className="text-gray-400 mb-8">
              {error || "This password reset link is invalid or has expired."}
            </p>

            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button variant="primary" size="lg" className="w-full">
                  Request New Link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md px-6"
        >
          <div className="glass-elevated rounded-3xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <h1 className="text-3xl font-display font-bold mb-4 text-white">
              Password Reset!
            </h1>

            <p className="text-gray-400 mb-8">
              Your password has been successfully reset. You can now login with your new password.
            </p>

            <p className="text-gray-500 text-sm">
              Redirecting to login page...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-6"
      >
        <div className="glass-elevated rounded-3xl p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-display font-bold mb-2 text-white">
              Reset Password
            </h1>
            <p className="text-gray-400">Enter your new password below</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all disabled:opacity-50"
                placeholder="••••••••"
                autoFocus
                required
                minLength={8}
              />
              <p className="mt-2 text-xs text-gray-500">Minimum 8 characters</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all disabled:opacity-50"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 text-center text-gray-400 text-sm"
          >
            Remember your password?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
