import type { IndustrySkin } from "./index";

export const hvacSkin: IndustrySkin = {
  key: "hvac",
  name: "HVAC",
  primaryColor: "orange-500",
  secondaryColor: "amber-600",
  gradientFrom: "from-orange-500",
  gradientTo: "to-amber-600",
  heroIcon: "Flame",
  serviceIcons: ["Flame", "Snowflake", "Wind", "Thermometer", "Wrench", "Shield"],
  defaultBusinessName: "ComfortZone HVAC",
  defaultTagline: "Your Comfort, Our Priority",
  defaultServices: [
    { title: "AC Repair", description: "Fast, reliable air conditioning repair to keep you cool when it matters most.", icon: "Snowflake" },
    { title: "Heating Repair", description: "Furnace and heat pump diagnostics and repair to keep your home warm.", icon: "Flame" },
    { title: "System Installation", description: "New HVAC systems sized and installed perfectly for your home.", icon: "Wind" },
    { title: "Maintenance Plans", description: "Preventive maintenance that extends equipment life and lowers energy bills.", icon: "Thermometer" },
    { title: "Duct Work", description: "Duct cleaning, repair, and installation for optimal airflow.", icon: "Wrench" },
    { title: "Indoor Air Quality", description: "Air purifiers, humidifiers, and filtration for healthier indoor air.", icon: "Shield" },
  ],
  defaultProcess: [
    { step: 1, title: "Diagnose", description: "Our technicians identify the problem with thorough testing." },
    { step: 2, title: "Quote", description: "Transparent pricing with options before any work begins." },
    { step: 3, title: "Repair", description: "Certified techs fix it right the first time with quality parts." },
    { step: 4, title: "Verify", description: "We test everything and ensure your comfort before we leave." },
  ],
  defaultFaqs: [
    { question: "Do you offer emergency service?", answer: "Yes! We offer 24/7 emergency HVAC service with no extra after-hours fees." },
    { question: "How often should I change my filter?", answer: "Every 1-3 months depending on filter type, pets, and allergies. We can set up reminders." },
    { question: "What brands do you service?", answer: "We service all major brands including Carrier, Trane, Lennox, Rheem, and more." },
  ],
  heroBackground: "gradient",
};
