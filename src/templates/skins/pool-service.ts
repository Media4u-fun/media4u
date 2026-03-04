import type { IndustrySkin } from "./index";

export const poolServiceSkin: IndustrySkin = {
  key: "pool-service",
  name: "Pool Service",
  primaryColor: "cyan-500",
  secondaryColor: "blue-600",
  gradientFrom: "from-cyan-500",
  gradientTo: "to-blue-600",
  heroIcon: "Waves",
  serviceIcons: ["Droplets", "Wrench", "Cpu", "Paintbrush", "Thermometer", "Shield"],
  defaultBusinessName: "Crystal Clear Pools",
  defaultTagline: "Professional Pool Care You Can Trust",
  defaultServices: [
    { title: "Weekly Cleaning", description: "Skimming, vacuuming, brushing, and chemical balancing to keep your pool pristine.", icon: "Droplets" },
    { title: "Equipment Repair", description: "Pumps, filters, heaters, and automation systems diagnosed and fixed fast.", icon: "Wrench" },
    { title: "Equipment Install", description: "New pumps, salt systems, LED lighting, and automation upgrades.", icon: "Cpu" },
    { title: "Resurfacing", description: "Pebble, plaster, and quartz finishes to restore your pool.", icon: "Paintbrush" },
    { title: "Water Chemistry", description: "Precise chemical balancing and green-to-clean treatments.", icon: "Thermometer" },
    { title: "Seasonal Care", description: "Opening, closing, and winterization services for every season.", icon: "Shield" },
  ],
  defaultProcess: [
    { step: 1, title: "Inspect", description: "We assess your pool, equipment, and water chemistry." },
    { step: 2, title: "Plan", description: "A custom service plan tailored to your pool and budget." },
    { step: 3, title: "Service", description: "Certified technicians execute with premium products." },
    { step: 4, title: "Maintain", description: "Ongoing care keeps your pool perfect year-round." },
  ],
  defaultFaqs: [
    { question: "How often should my pool be serviced?", answer: "We recommend weekly service for most residential pools to keep water balanced and prevent algae." },
    { question: "Do you service salt water pools?", answer: "Yes! We service all pool types including salt water, chlorine, mineral, and hybrid systems." },
    { question: "How quickly can you start?", answer: "Most new customers are set up within 48 hours. Emergency services can be same-day." },
  ],
  heroBackground: "gradient",
};
