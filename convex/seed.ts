import { mutation } from "./_generated/server";

// This migration file contains the hardcoded data from the frontend
// It can be run once to populate the database with initial content

const BLOG_POSTS_DATA = [
  {
    title: "The Future of Virtual Reality in Business",
    slug: "future-vr-business",
    excerpt: "Discover how VR technology is revolutionizing industries from healthcare to real estate, creating immersive experiences that drive engagement and results.",
    content: "VR is transforming how businesses operate... [Full content would go here]",
    category: "VR Technology",
    date: "Jan 15, 2024",
    readTime: "8 min read",
    gradient: "from-cyan-500 via-blue-500 to-purple-600",
    featured: true,
  },
  {
    title: "Web Design Trends to Watch in 2024",
    slug: "web-design-trends-2024",
    excerpt: "From glassmorphism to AI-powered personalization, explore the cutting-edge design trends shaping the digital landscape.",
    content: "The web design landscape continues to evolve... [Full content would go here]",
    category: "Web Design",
    date: "Jan 10, 2024",
    readTime: "5 min read",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    featured: false,
  },
  {
    title: "Understanding the Metaverse Opportunity",
    slug: "understanding-metaverse",
    excerpt: "A comprehensive guide to navigating the metaverse ecosystem and positioning your brand for the next digital frontier.",
    content: "The metaverse represents a paradigm shift... [Full content would go here]",
    category: "Multiverse",
    date: "Jan 5, 2024",
    readTime: "6 min read",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    featured: false,
  },
  {
    title: "How to Choose the Right VR Platform",
    slug: "choosing-vr-platform",
    excerpt: "Compare the leading VR platforms and learn which solution best fits your business needs and budget.",
    content: "Selecting the right VR platform is crucial... [Full content would go here]",
    category: "Technology",
    date: "Dec 28, 2023",
    readTime: "7 min read",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    featured: false,
  },
  {
    title: "Building an Immersive Art Gallery",
    slug: "immersive-art-gallery",
    excerpt: "How we transformed a traditional gallery space into a stunning virtual experience that attracted visitors worldwide.",
    content: "Our latest case study demonstrates... [Full content would go here]",
    category: "Case Study",
    date: "Dec 20, 2023",
    readTime: "4 min read",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    featured: false,
  },
];

const PORTFOLIO_PROJECTS_DATA = [
  {
    title: "Virtual Conference Hall",
    slug: "virtual-conference-hall",
    category: "vr",
    description: "Immersive 3D conference space designed for global businesses to host seamless virtual events with full interactivity.",
    fullDescription: "A complete virtual event platform with multiple rooms, networking spaces, and presentation stages.",
    gradient: "from-cyan-500 via-blue-600 to-purple-600",
    featured: true,
    technologies: ["Three.js", "WebGL", "Node.js"],
    testimonial: "The best virtual conference experience we've ever had.",
    results: ["50% increase in attendee engagement", "200+ participants from 30 countries"],
  },
  {
    title: "E-Commerce Website Redesign",
    slug: "ecommerce-redesign",
    category: "web",
    description: "Modern, high-converting e-commerce platform with stunning animations and smooth user experience.",
    fullDescription: "Complete redesign with improved conversion rates and user engagement.",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    featured: true,
    technologies: ["Next.js", "React", "Tailwind CSS"],
    testimonial: "Sales increased by 150% after the redesign.",
    results: ["150% increase in sales", "3-second page load time"],
  },
  {
    title: "Metaverse Brand Experience",
    slug: "metaverse-brand",
    category: "multiverse",
    description: "Custom branded metaverse space for luxury brand with unique shopping and networking experiences.",
    fullDescription: "A fully immersive metaverse experience for brand activation.",
    gradient: "from-emerald-500 via-teal-500 to-blue-500",
    featured: true,
    technologies: ["Unreal Engine", "Blockchain", "Web3"],
    testimonial: "This opened a whole new audience for our brand.",
    results: ["10K+ metaverse visitors monthly", "Pioneered Web3 retail"],
  },
  {
    title: "Real Estate Virtual Tours",
    slug: "real-estate-tours",
    category: "vr",
    description: "360-degree virtual property tours allowing buyers to explore homes from anywhere in the world.",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    featured: false,
    technologies: ["Three.js", "React", "AWS"],
    testimonial: "Virtual tours cut our showing time in half.",
    results: ["50% reduction in showings needed", "30% faster sales cycle"],
  },
  {
    title: "AI-Powered Design Tool",
    slug: "ai-design-tool",
    category: "web",
    description: "Web platform using AI to help users create professional graphics and marketing materials instantly.",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    featured: false,
    technologies: ["Python", "TensorFlow", "React"],
    testimonial: "Design has never been easier for our non-designers.",
    results: ["100K+ users in 6 months", "4.8-star app rating"],
  },
  {
    title: "Virtual Trade Show Booth",
    slug: "trade-show-booth",
    category: "multiverse",
    description: "Interactive virtual booth for tech conference with live presentations, product demos, and networking.",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    featured: false,
    technologies: ["Gather.town", "WebGL", "React"],
    testimonial: "Our best booth performance at any virtual event.",
    results: ["500+ booth visits", "200+ qualified leads"],
  },
];

export const seedBlogPosts = mutation({
  handler: async (ctx) => {
    const posts = [];

    for (const post of BLOG_POSTS_DATA) {
      const id = await ctx.db.insert("blogPosts", {
        ...post,
        published: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      posts.push(id);
    }

    return { success: true, count: posts.length };
  },
});

export const seedPortfolioProjects = mutation({
  handler: async (ctx) => {
    const projects = [];

    for (const project of PORTFOLIO_PROJECTS_DATA) {
      const id = await ctx.db.insert("portfolioProjects", {
        ...project,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      projects.push(id);
    }

    return { success: true, count: projects.length };
  },
});

export const seedAll = mutation({
  handler: async (ctx) => {
    // Note: Admin users are now created via Better Auth signup
    // After signup, promote to admin via Convex dashboard by setting role="admin"

    // Seed blog posts
    let blogCount = 0;
    for (const post of BLOG_POSTS_DATA) {
      await ctx.db.insert("blogPosts", {
        ...post,
        published: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      blogCount++;
    }

    // Seed portfolio projects
    let projectCount = 0;
    for (const project of PORTFOLIO_PROJECTS_DATA) {
      await ctx.db.insert("portfolioProjects", {
        ...project,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      projectCount++;
    }

    return {
      success: true,
      blogPosts: blogCount,
      portfolioProjects: projectCount,
    };
  },
});
