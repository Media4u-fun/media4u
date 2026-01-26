"use client";

import { type ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Website Package",
  professional: "Professional Website Package",
  webcare: "Web Care Monthly",
};

export function CheckoutSuccessContent(): ReactElement {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const order = useQuery(
    api.stripe.getOrderBySessionId,
    sessionId ? { stripeSessionId: sessionId } : "skip"
  );

  if (!mounted) {
    return <div className="mesh-bg min-h-screen" />;
  }

  return (
    <div className="mesh-bg min-h-screen">
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
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
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Thank You for Your{" "}
            <span className="text-gradient-cyber">Purchase!</span>
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Your order has been confirmed. We&apos;re excited to start working with you!
          </p>

          {/* Order Details */}
          {order && (
            <Card className="text-left mb-8">
              <h2 className="text-xl font-display font-semibold mb-4">
                Order Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Product</span>
                  <span className="text-white">
                    {PRODUCT_NAMES[order.productType] ?? order.productType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">
                    ${(order.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{order.customerEmail}</span>
                </div>
              </div>
            </Card>
          )}

          {/* What's Next */}
          <Card className="text-left mb-8">
            <h2 className="text-xl font-display font-semibold mb-4">
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-0.5">1.</span>
                <span>
                  You&apos;ll receive a confirmation email with your order details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-0.5">2.</span>
                <span>
                  Our team will review your project and reach out within 1-2
                  business days
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-0.5">3.</span>
                <span>
                  We&apos;ll schedule a kickoff call to discuss your project in detail
                </span>
              </li>
            </ul>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portal">
              <Button variant="primary" size="lg">
                Go to Client Portal
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
