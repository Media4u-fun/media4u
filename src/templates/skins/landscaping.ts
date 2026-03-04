import type { IndustrySkin } from "./index";

export const landscapingSkin: IndustrySkin = {
  key: "landscaping",
  name: "Landscaping",
  primaryColor: "green-500",
  secondaryColor: "emerald-600",
  gradientFrom: "from-green-500",
  gradientTo: "to-emerald-600",
  heroIcon: "TreePine",
  serviceIcons: ["TreePine", "Scissors", "Flower2", "Droplets", "Sun", "Shovel"],
  defaultBusinessName: "Green Horizon Landscaping",
  defaultTagline: "Beautiful Outdoor Spaces, Expertly Crafted",
  defaultServices: [
    { title: "Lawn Maintenance", description: "Mowing, edging, trimming, and fertilizing for a lush, green lawn year-round.", icon: "Scissors" },
    { title: "Landscape Design", description: "Custom designs that transform your outdoor space into a personal retreat.", icon: "Flower2" },
    { title: "Irrigation Systems", description: "Smart sprinkler installation and repair to keep your landscape perfectly watered.", icon: "Droplets" },
    { title: "Tree Service", description: "Pruning, trimming, removal, and stump grinding by certified arborists.", icon: "TreePine" },
    { title: "Hardscaping", description: "Patios, walkways, retaining walls, and outdoor living spaces built to last.", icon: "Sun" },
    { title: "Seasonal Cleanup", description: "Spring and fall cleanups, leaf removal, and garden bed preparation.", icon: "Shovel" },
  ],
  defaultProcess: [
    { step: 1, title: "Consult", description: "We walk your property and discuss your vision and budget." },
    { step: 2, title: "Design", description: "Our team creates a custom plan with 3D renderings." },
    { step: 3, title: "Build", description: "Skilled crews bring the design to life with quality materials." },
    { step: 4, title: "Maintain", description: "Regular care keeps your landscape looking its best." },
  ],
  defaultFaqs: [
    { question: "How often do you mow?", answer: "Weekly mowing is standard during growing season. We adjust frequency based on season and grass type." },
    { question: "Do you offer free estimates?", answer: "Yes! We provide free on-site consultations and detailed written estimates for all services." },
    { question: "Are you licensed and insured?", answer: "Fully licensed, bonded, and insured with certified professionals on every crew." },
  ],
  heroBackground: "gradient",
};
