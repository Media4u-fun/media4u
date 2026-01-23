"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  gradient: string;
  featured?: boolean;
}

// Fallback data in case Convex is not yet seeded
const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: "future-vr-business",
    title: "The Future of Virtual Reality in Business",
    excerpt: "Discover how VR technology is revolutionizing industries from healthcare to real estate, creating immersive experiences that drive engagement and results.",
    category: "VR Technology",
    date: "Jan 15, 2024",
    readTime: "8 min read",
    gradient: "from-cyan-500 via-blue-500 to-purple-600",
    featured: true,
  },
  {
    id: "web-design-trends-2024",
    title: "Web Design Trends to Watch in 2024",
    excerpt: "From glassmorphism to AI-powered personalization, explore the cutting-edge design trends shaping the digital landscape.",
    category: "Web Design",
    date: "Jan 10, 2024",
    readTime: "5 min read",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    id: "understanding-metaverse",
    title: "Understanding the Metaverse Opportunity",
    excerpt: "A comprehensive guide to navigating the metaverse ecosystem and positioning your brand for the next digital frontier.",
    category: "Multiverse",
    date: "Jan 5, 2024",
    readTime: "6 min read",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    id: "choosing-vr-platform",
    title: "How to Choose the Right VR Platform",
    excerpt: "Compare the leading VR platforms and learn which solution best fits your business needs and budget.",
    category: "Technology",
    date: "Dec 28, 2023",
    readTime: "7 min read",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
  },
  {
    id: "immersive-art-gallery",
    title: "Building an Immersive Art Gallery",
    excerpt: "How we transformed a traditional gallery space into a stunning virtual experience that attracted visitors worldwide.",
    category: "Case Study",
    date: "Dec 20, 2023",
    readTime: "4 min read",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
  },
];

function BlogCard({ post, index, featured = false }: { post: BlogPost; index: number; featured?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_60px_rgba(0,212,255,0.15)] ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div className={`relative ${featured ? "h-64 md:h-80" : "h-48"} overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-80`} />
        <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20">
            {post.category}
          </span>
        </div>
      </div>
      <div className={`p-6 ${featured ? "md:p-8" : ""}`}>
        <h3 className={`font-display font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors ${
          featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
        }`}>
          {post.title}
        </h3>
        <p className={`text-gray-400 mb-4 line-clamp-2 ${featured ? "md:line-clamp-3 text-base" : "text-sm"}`}>
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>
      </div>
      <div className="absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-300 group-hover:border-cyan-500/20 pointer-events-none" />
    </motion.article>
  );
}

function NewsletterSection() {
  const subscribe = useMutation(api.newsletter.subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter an email address" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await subscribe({ email });

      if (result.success) {
        setMessage({
          type: "success",
          text: result.newSubscription
            ? "Welcome! Check your email for a confirmation."
            : "Thank you for subscribing!",
        });
        setEmail("");
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to subscribe. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
      <div className="relative max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-gradient-cyber">Stay in the Loop</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Get the latest insights on VR, web design, and digital innovation delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 rounded-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all disabled:opacity-50"
              aria-label="Email address"
            />
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/50 text-red-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
          <p className="text-gray-500 text-sm mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

export default function BlogPage() {
  const [visiblePosts, setVisiblePosts] = useState(5);

  // Fetch blog posts from Convex
  const convexPosts = useQuery(api.blog.getAllPosts, { publishedOnly: true });

  // Use Convex posts if available, fallback to hardcoded data
  const BLOG_POSTS = (convexPosts && convexPosts.length > 0 ? convexPosts : FALLBACK_BLOG_POSTS) as BlogPost[];

  const featuredPost = BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.slice(1, visiblePosts);
  const hasMorePosts = visiblePosts < BLOG_POSTS.length;

  function handleLoadMore(): void {
    setVisiblePosts((prev) => prev + 4);
  }

  return (
    <div className="mesh-bg min-h-screen">
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            <span className="text-gradient-cyber">Latest Insights</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Explore our thoughts on VR technology, web design, and the future of digital experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <BlogCard post={featuredPost} index={0} featured />
          {regularPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index + 1} />
          ))}
        </div>

        {hasMorePosts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button variant="secondary" size="lg" onClick={handleLoadMore}>
              Load More Articles
            </Button>
          </motion.div>
        )}
      </Section>

      <NewsletterSection />
    </div>
  );
}
