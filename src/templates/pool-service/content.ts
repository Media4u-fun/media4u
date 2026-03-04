// Default placeholder content for pool service template
// Each factory client can override these values with their own data

export const defaultPoolContent = {
  business: {
    name: "Orangecrest Pools",
    tagline: "Crystal Clear Service, Every Time",
    phone: "(951) 555-0123",
    email: "info@orangecrestpools.com",
    address: "Riverside, CA",
    yearsInBusiness: 15,
    poolsServiced: 2500,
    fiveStarReviews: 350,
    satisfaction: 99,
  },

  hero: {
    headline: "Your Pool, Perfected.",
    subheadline:
      "Professional pool care that keeps your backyard paradise sparkling clean and swim-ready all year round.",
    ctaPrimary: "Get a Free Quote",
    ctaSecondary: "Our Services",
  },

  services: [
    {
      title: "Weekly Cleaning",
      description:
        "Skimming, vacuuming, brushing walls, and chemical balancing to keep your pool pristine every week.",
      icon: "Droplets" as const,
    },
    {
      title: "Equipment Repair",
      description:
        "Pumps, filters, heaters, and automation systems - we diagnose and fix it all fast.",
      icon: "Wrench" as const,
    },
    {
      title: "Equipment Install",
      description:
        "New pumps, salt systems, LED lighting, and automation upgrades installed by certified technicians.",
      icon: "Cpu" as const,
    },
    {
      title: "Resurfacing",
      description:
        "Pebble, plaster, and quartz finishes that restore your pool's beauty and extend its life.",
      icon: "Paintbrush" as const,
    },
    {
      title: "Water Chemistry",
      description:
        "Precise chemical balancing, green-to-clean treatments, and salt system calibration.",
      icon: "Thermometer" as const,
    },
    {
      title: "Seasonal Care",
      description:
        "Opening, closing, and winterization services to protect your investment through every season.",
      icon: "Shield" as const,
    },
  ],

  process: [
    {
      step: 1,
      title: "Inspect",
      description: "We assess your pool, equipment, and water chemistry to understand exactly what it needs.",
    },
    {
      step: 2,
      title: "Plan",
      description: "A custom service plan tailored to your pool type, usage, and budget - no cookie-cutter solutions.",
    },
    {
      step: 3,
      title: "Service",
      description: "Our certified technicians execute the plan with premium products and professional-grade equipment.",
    },
    {
      step: 4,
      title: "Maintain",
      description: "Ongoing care, monitoring, and adjustments keep your pool perfect all year long.",
    },
  ],

  reviews: [
    {
      name: "Sarah M.",
      location: "Riverside, CA",
      rating: 5,
      text: "They transformed our green nightmare into a crystal clear oasis in just one day. Best pool service we have ever used!",
    },
    {
      name: "James T.",
      location: "Corona, CA",
      rating: 5,
      text: "Reliable, professional, and always on time. Our pool has never looked better since switching to Orangecrest Pools.",
    },
    {
      name: "Linda K.",
      location: "Moreno Valley, CA",
      rating: 5,
      text: "The weekly service is worth every penny. They catch small issues before they become expensive problems.",
    },
    {
      name: "David R.",
      location: "Temecula, CA",
      rating: 5,
      text: "Had our pool resurfaced and a new pump installed. The team was professional and the results are stunning.",
    },
  ],

  faqs: [
    {
      question: "How often should I have my pool serviced?",
      answer:
        "We recommend weekly service for most residential pools. This keeps water chemistry balanced, equipment running smoothly, and prevents algae buildup before it starts.",
    },
    {
      question: "Do you service salt water pools?",
      answer:
        "Absolutely! We service all pool types including salt water, chlorine, mineral, and hybrid systems. Our technicians are certified in salt cell maintenance and calibration.",
    },
    {
      question: "What areas do you serve?",
      answer:
        "We proudly serve Riverside, Corona, Moreno Valley, Temecula, Murrieta, Lake Elsinore, and surrounding Inland Empire communities.",
    },
    {
      question: "How quickly can you start service?",
      answer:
        "Most new customers are set up within 48 hours of their initial consultation. Emergency services like green pool cleanups can often be scheduled same-day.",
    },
    {
      question: "Do you offer one-time cleanups or just monthly plans?",
      answer:
        "We offer both! One-time cleanups are great for move-in or move-out situations, party prep, or seasonal openings. Monthly plans provide the best value for ongoing care.",
    },
    {
      question: "Are you licensed and insured?",
      answer:
        "Yes. We are fully licensed, bonded, and insured. All our technicians are CPO (Certified Pool Operator) certified.",
    },
  ],

  quoteForm: {
    serviceTypes: [
      "Weekly Cleaning",
      "One-Time Cleanup",
      "Equipment Repair",
      "Equipment Install",
      "Resurfacing",
      "Water Chemistry",
      "Other",
    ],
    poolTypes: [
      "In-Ground - Chlorine",
      "In-Ground - Salt Water",
      "Above Ground",
      "Spa / Hot Tub",
      "Commercial",
    ],
  },

  about: {
    story:
      "Founded by a lifelong pool enthusiast who believes every family deserves a backyard paradise they can enjoy without the hassle. We combine old-school customer service with modern pool technology to deliver results that speak for themselves.",
    mission:
      "To keep every pool in the Inland Empire crystal clear, safe, and swim-ready - so our clients can focus on making memories, not maintaining equipment.",
  },
};

export type PoolContent = typeof defaultPoolContent;
