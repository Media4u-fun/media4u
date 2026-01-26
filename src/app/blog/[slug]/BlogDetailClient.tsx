"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  gradient: string
  featured: boolean
  published: boolean
  createdAt: number
  updatedAt: number
}

interface BlogDetailClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
  previousPost: BlogPost | null
  nextPost: BlogPost | null
}

export function BlogDetailClient({ post, relatedPosts, previousPost, nextPost }: BlogDetailClientProps) {
  return (
    <div className="min-h-screen mesh-bg">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-10`} />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-sm font-semibold mb-6 uppercase tracking-wider">
              {post.category}
            </span>

            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm md:text-base">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <Section className="py-20">
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-400 text-lg leading-relaxed space-y-6 whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-12 border-t border-white/[0.06]">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="text-sm text-gray-500">
                Published on {post.date} • {post.readTime}
              </div>
              <div className="flex gap-3">
                <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm">
                  {post.category}
                </span>
              </div>
            </div>
          </div>
        </motion.article>
      </Section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Section className="py-20 border-t border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, idx) => (
                <motion.article
                  key={relatedPost._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,212,255,0.15)]"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${relatedPost.gradient}`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20">
                        {relatedPost.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {relatedPost.date} • {relatedPost.readTime}
                      </p>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </Section>
      )}

      {/* Navigation - Previous/Next Posts */}
      {(previousPost || nextPost) && (
        <Section className="py-16 border-t border-white/[0.06]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {previousPost ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/blog/${previousPost.slug}`} className="block">
                  <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">← Previous Article</p>
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {previousPost.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">{previousPost.date}</p>
                </Link>
              </motion.div>
            ) : (
              <div />
            )}
            {nextPost ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="group text-right md:text-right"
              >
                <Link href={`/blog/${nextPost.slug}`} className="block">
                  <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">Next Article →</p>
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {nextPost.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">{nextPost.date}</p>
                </Link>
              </motion.div>
            ) : (
              <div />
            )}
          </div>
        </Section>
      )}

      {/* CTA Section */}
      <Section className="py-20 border-t border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Stay Updated
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Get insights on VR, web design, and digital innovation delivered to your inbox.
          </p>
          <Link href="/blog">
            <Button variant="primary" size="lg">
              Read More Articles
            </Button>
          </Link>
        </motion.div>
      </Section>

      {/* Navigation */}
      <div className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/blog" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
