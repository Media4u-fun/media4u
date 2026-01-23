"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { motion } from "motion/react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";

const SERVICES = [
  "VR Environments",
  "Web Design",
  "Multiverse Projects",
  "Creative Consulting",
  "Other",
] as const;

type ServiceOption = (typeof SERVICES)[number];

interface FormData {
  name: string;
  email: string;
  service: ServiceOption | "";
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  service?: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function ContactForm() {
  const submitContact = useMutation(api.contactSubmissions.submitContact);
  const sendEmail = useMutation(api.emails.sendContactFormEmail);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit contact form to database
      await submitContact({
        name: formData.name,
        email: formData.email,
        service: formData.service as string,
        message: formData.message,
      });

      // Send email notification
      await sendEmail({
        name: formData.name,
        email: formData.email,
        service: formData.service as string,
        message: formData.message,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", service: "", message: "" });
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit form. Please try again."
      );
    }
  }

  return (
    <div className="glass-elevated rounded-2xl p-6 md:p-8">
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">
            Message Sent!
          </h3>
          <p className="text-gray-400 mb-6">
            Thank you for reaching out. We&apos;ll get back to you within 24
            hours.
          </p>
          <Button
            variant="secondary"
            onClick={() => setIsSubmitted(false)}
          >
            Send Another Message
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400"
            >
              {submitError}
            </motion.div>
          )}
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.name
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-cyan-500/50"
              } text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20`}
              placeholder="Your name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-cyan-500/50"
              } text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Service Dropdown */}
          <div>
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Service
            </label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.service
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-cyan-500/50"
              } text-white outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 appearance-none cursor-pointer`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.5rem",
              }}
            >
              <option value="" className="bg-gray-900">
                Select a service
              </option>
              {SERVICES.map((service) => (
                <option key={service} value={service} className="bg-gray-900">
                  {service}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="mt-1 text-sm text-red-400">{errors.service}</p>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                errors.message
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-cyan-500/50"
              } text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 resize-none`}
              placeholder="Tell us about your project..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-400">{errors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
