"use client";

import { type ReactElement, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, MessageCircle, FileQuestion, ChevronDown, ExternalLink, Send, CheckCircle, Loader2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/components/AuthContext";

const FAQ_ITEMS = [
  {
    question: "How long does it take to complete my project?",
    answer: "Project timelines vary based on complexity. Starter packages typically take 1-2 weeks, while Professional packages take 3-4 weeks. We'll provide a detailed timeline after your initial consultation.",
  },
  {
    question: "Can I request changes after the project is completed?",
    answer: "Yes! All packages include a revision period. Starter packages include 2 rounds of revisions, and Professional packages include 3 rounds. Additional changes can be requested at our standard hourly rate.",
  },
  {
    question: "How do I access my VR experience?",
    answer: "Your VR experience will be hosted on our platform and accessible via a unique URL. You'll receive login credentials and instructions via email once your project is complete.",
  },
  {
    question: "What if I need to upgrade my package?",
    answer: "You can upgrade your package at any time during development. We'll calculate the price difference and apply any payments you've already made to the upgraded package.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer refunds within 7 days of purchase if no work has been started. Once development begins, refunds are evaluated on a case-by-case basis. Please review our full refund policy in your order confirmation email.",
  },
  {
    question: "How do I track my project progress?",
    answer: "You'll receive regular updates via email and can check your project status in the dashboard. For VR projects, we provide preview links as development progresses.",
  },
];

export default function PortalSupportPage(): ReactElement {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const sendSupportRequest = useAction(api.support.sendSupportRequest);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both subject and message");
      return;
    }

    if (!user?.email || !user?.name) {
      setError("Unable to get your account info. Please refresh and try again.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await sendSupportRequest({
        userName: user.name,
        userEmail: user.email,
        subject: subject.trim(),
        message: message.trim(),
      });
      setIsSent(true);
      setSubject("");
      setMessage("");
      // Reset success message after 5 seconds
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      console.error("Failed to send support request:", err);
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">
          Help & <span className="text-gradient-cyber">Support</span>
        </h1>
        <p className="text-gray-400">
          Get answers to common questions or reach out for personalized help.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Contact Options */}
        <motion.a
          href="mailto:support@media4u.fun"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-elevated rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
            <Mail className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
          <p className="text-gray-400 text-sm mb-3">
            Get help via email. We typically respond within 24 hours.
          </p>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
            support@media4u.fun
            <ExternalLink className="w-4 h-4" />
          </div>
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
          <p className="text-gray-400 text-sm mb-3">
            Chat with our support team in real-time.
          </p>
          <button
            disabled
            className="text-gray-500 text-sm font-medium cursor-not-allowed"
          >
            Coming Soon
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <div className="w-12 h-12 rounded-full bg-magenta-500/20 flex items-center justify-center mb-4">
            <FileQuestion className="w-6 h-6 text-magenta-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Knowledge Base</h3>
          <p className="text-gray-400 text-sm mb-3">
            Browse our documentation and guides.
          </p>
          <button
            disabled
            className="text-gray-500 text-sm font-medium cursor-not-allowed"
          >
            Coming Soon
          </button>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-elevated rounded-2xl p-6 mb-8"
      >
        <h2 className="text-2xl font-display font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-lg overflow-hidden bg-white/5"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-white pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openFaqIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-elevated rounded-2xl p-6"
      >
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Still Need Help?
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Send us a message and we&apos;ll get back to you as soon as possible.
        </p>

        {isSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-300 text-sm">
              Your message has been sent! We&apos;ll get back to you soon.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="subject" className="block text-sm text-gray-400 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="What do you need help with?"
              disabled={isSending}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm text-gray-400 mb-2">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
              placeholder="Describe your issue or question in detail..."
              disabled={isSending}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSending || !subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
