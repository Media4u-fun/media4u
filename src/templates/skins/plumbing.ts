import type { IndustrySkin } from "./index";

export const plumbingSkin: IndustrySkin = {
  key: "plumbing",
  name: "Plumbing",
  primaryColor: "blue-500",
  secondaryColor: "indigo-600",
  gradientFrom: "from-blue-500",
  gradientTo: "to-indigo-600",
  heroIcon: "Wrench",
  serviceIcons: ["Wrench", "Droplets", "Flame", "ShowerHead", "PipelineIcon", "Shield"],
  defaultBusinessName: "ProFlow Plumbing",
  defaultTagline: "Fast, Reliable Plumbing Solutions",
  defaultServices: [
    { title: "Drain Cleaning", description: "Clogged drains cleared fast with professional hydro-jetting and snaking.", icon: "Droplets" },
    { title: "Leak Repair", description: "Expert leak detection and repair for pipes, faucets, and fixtures.", icon: "Wrench" },
    { title: "Water Heater", description: "Installation, repair, and maintenance for tank and tankless water heaters.", icon: "Flame" },
    { title: "Bathroom Remodel", description: "Full bathroom plumbing for remodels, from rough-in to fixtures.", icon: "ShowerHead" },
    { title: "Pipe Repair", description: "Burst pipe repair, repiping, and trenchless sewer line replacement.", icon: "Wrench" },
    { title: "Backflow Prevention", description: "Testing, repair, and installation to protect your water supply.", icon: "Shield" },
  ],
  defaultProcess: [
    { step: 1, title: "Call", description: "Reach us anytime - we answer and dispatch fast." },
    { step: 2, title: "Inspect", description: "Our plumber diagnoses the issue with camera inspection if needed." },
    { step: 3, title: "Fix", description: "Upfront pricing approved by you, then we get to work." },
    { step: 4, title: "Guarantee", description: "All work backed by our satisfaction guarantee." },
  ],
  defaultFaqs: [
    { question: "Do you offer emergency plumbing?", answer: "Yes! We provide 24/7 emergency plumbing with fast response times." },
    { question: "How much does a service call cost?", answer: "Our diagnostic fee is applied toward the cost of repair. No surprises." },
    { question: "Do you offer financing?", answer: "Yes, we offer flexible financing options for larger projects and installations." },
  ],
  heroBackground: "gradient",
};
