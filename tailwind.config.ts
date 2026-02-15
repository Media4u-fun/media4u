import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#03030a",
          900: "#0a0a12",
          800: "#0f0f1a",
          700: "#161624",
          600: "#1e1e2f",
        },
        brand: {
          light: "#00A5E0",
          DEFAULT: "#0077B6",
          dark: "#005A8C",
        },
        tvr: {
          light: "#8c85ff",
          DEFAULT: "#673de6",
          dark: "#5025d1",
          deeper: "#2f1c6a",
          bg: "#1F1346",
        },
        surface: {
          primary: "rgba(255, 255, 255, 0.03)",
          elevated: "rgba(255, 255, 255, 0.06)",
          border: "rgba(255, 255, 255, 0.08)",
        },
      },
      fontFamily: {
        display: ["var(--font-clash)", "system-ui", "sans-serif"],
        body: ["var(--font-cabinet)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "cyber-mesh": `
          radial-gradient(at 40% 20%, rgba(0, 165, 224, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(0, 119, 182, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(0, 90, 140, 0.08) 0px, transparent 50%),
          radial-gradient(at 80% 100%, rgba(0, 165, 224, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(0, 119, 182, 0.08) 0px, transparent 50%)
        `,
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "fade-in-up": "fade-in-up 0.6s ease forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        "scale-in": "scale-in 0.3s ease forwards",
        "slide-in-right": "slide-in-right 0.4s ease forwards",
        "morph": "morph 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" },
        },
      },
      boxShadow: {
        "glow-brand-light": "0 0 40px rgba(0, 165, 224, 0.3)",
        "glow-brand": "0 0 40px rgba(0, 119, 182, 0.3)",
        "glow-brand-dark": "0 0 40px rgba(0, 90, 140, 0.3)",
        "inner-glow": "inset 0 0 60px rgba(0, 119, 182, 0.05)",
      },
    },
  },
  plugins: [typography],
};

export default config;
