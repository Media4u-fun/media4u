"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { useState, useMemo } from "react";
import { marked } from "marked";

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
  const { scrollYProgress } = useScroll();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Parse markdown content to HTML
  const htmlContent = useMemo(() => {
    return marked(post.content, { breaks: true, gfm: true });
  }, [post.content]);

  // Parallax effects
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#03030a] relative overflow-hidden">
      {/* Dramatic atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className={`absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-bl ${post.gradient} opacity-[0.08] blur-[150px]`} />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-cyan-500/10 to-transparent blur-[120px]" />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Reading progress bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r ${post.gradient} z-50 origin-left`}
        style={{ scaleX: scrollYProgress }}
      />

      {/* Floating back button */}
      <div className="fixed top-8 left-8 z-40">
        <Link href="/blog">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-white/30 transition-all text-white"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>
        </Link>
      </div>

      {/* Floating share button */}
      <div className="fixed top-8 right-8 z-40">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="group flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-cyan-500/50 transition-all text-white"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </motion.button>
      </div>

      {/* Massive hero section with parallax */}
      <div className="relative min-h-screen flex items-end pb-32 pt-40">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            {/* Main content - spans 8 columns */}
            <motion.div
              style={{ y: titleY, opacity: titleOpacity }}
              className="lg:col-span-8 space-y-8"
            >
              {/* Category with decorative line */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className={`h-[3px] w-24 bg-gradient-to-r ${post.gradient}`} />
                <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">
                  {post.category}
                </span>
              </motion.div>

              {/* Massive headline - true editorial scale */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.85] tracking-tighter"
              >
                {post.title}
              </motion.h1>

              {/* Excerpt with dramatic styling */}
              {post.excerpt && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl lg:text-3xl text-gray-400 leading-relaxed font-light max-w-4xl"
                >
                  {post.excerpt}
                </motion.p>
              )}
            </motion.div>

            {/* Sidebar meta - spans 4 columns */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-4 space-y-8"
            >
              {/* Decorative number */}
              <div className="text-[200px] lg:text-[280px] font-black leading-none text-white/5 select-none">
                01
              </div>

              {/* Meta info cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-400">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span className="text-base">{post.date}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-base">{post.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative gradient divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Article content with sidebar layout */}
      <div className="relative">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-24">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Main article content - 8 columns */}
            <motion.article
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8"
            >
              {/* Drop cap styling + Comprehensive prose */}
              <div
                className="
                  prose prose-xl prose-invert max-w-none

                  /* Drop cap removed - was applying to every paragraph */

                  /* Headings with dramatic styling */
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
                  prose-h1:text-6xl prose-h1:mb-12 prose-h1:mt-20
                  prose-h2:text-5xl prose-h2:mb-8 prose-h2:mt-16
                  prose-h2:border-l-4 prose-h2:border-cyan-500 prose-h2:pl-8
                  prose-h3:text-3xl prose-h3:mb-6 prose-h3:mt-12

                  /* Paragraphs with generous spacing */
                  prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-xl

                  /* Links with underline animation */
                  prose-a:text-cyan-400 prose-a:no-underline prose-a:font-semibold
                  prose-a:border-b-2 prose-a:border-cyan-400/30
                  hover:prose-a:border-cyan-400 prose-a:transition-all

                  /* Lists with custom bullets */
                  prose-ul:text-gray-300 prose-ul:mb-8 prose-ul:space-y-3
                  prose-ol:text-gray-300 prose-ol:mb-8 prose-ol:space-y-3
                  prose-li:text-gray-300 prose-li:leading-[1.8] prose-li:text-xl
                  prose-li:marker:text-cyan-400 prose-li:marker:font-bold

                  /* Strong and emphasis */
                  prose-strong:text-white prose-strong:font-bold
                  prose-em:text-gray-200 prose-em:not-italic prose-em:font-light

                  /* Inline code */
                  prose-code:text-cyan-300 prose-code:bg-cyan-500/10
                  prose-code:px-3 prose-code:py-1 prose-code:rounded-lg
                  prose-code:text-base prose-code:font-mono prose-code:border
                  prose-code:border-cyan-500/20 prose-code:font-normal
                  prose-code:before:content-[''] prose-code:after:content-['']

                  /* Code blocks with dramatic styling */
                  prose-pre:bg-gradient-to-br prose-pre:from-[#0a0a12] prose-pre:to-[#0f0f1a]
                  prose-pre:border-2 prose-pre:border-cyan-500/20
                  prose-pre:rounded-2xl prose-pre:p-8 prose-pre:overflow-x-auto
                  prose-pre:shadow-[0_0_80px_rgba(0,212,255,0.1)]
                  prose-pre:my-12 prose-pre:text-base

                  /* Blockquotes with editorial styling */
                  prose-blockquote:border-l-8 prose-blockquote:border-cyan-500
                  prose-blockquote:pl-12 prose-blockquote:pr-8 prose-blockquote:py-8
                  prose-blockquote:italic prose-blockquote:text-2xl
                  prose-blockquote:text-gray-300 prose-blockquote:my-16
                  prose-blockquote:bg-gradient-to-r prose-blockquote:from-cyan-500/5
                  prose-blockquote:to-transparent
                  prose-blockquote:rounded-r-2xl
                  prose-blockquote:font-light
                  prose-blockquote:leading-relaxed

                  /* Images with captions */
                  prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-16
                  prose-img:border-2 prose-img:border-white/10

                  /* Horizontal rules as decorative breaks */
                  prose-hr:border-0 prose-hr:h-px prose-hr:my-20
                  prose-hr:bg-gradient-to-r prose-hr:from-transparent
                  prose-hr:via-white/20 prose-hr:to-transparent

                  /* Tables */
                  prose-table:border-2 prose-table:border-white/10 prose-table:rounded-xl
                  prose-table:overflow-hidden prose-table:my-12
                  prose-thead:bg-gradient-to-r prose-thead:from-cyan-500/10 prose-thead:to-purple-500/10
                  prose-th:text-white prose-th:font-black prose-th:p-6 prose-th:text-left
                  prose-td:border-white/5 prose-td:p-6
                  prose-tr:border-b prose-tr:border-white/5
                "
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Article footer */}
              <div className="mt-24 pt-12 border-t border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${post.gradient} bg-opacity-10 border-2 border-white/10`}>
                    <span className="text-white font-bold text-sm uppercase tracking-widest">
                      #{post.category}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm space-y-1 text-right">
                    <div>Published {post.date}</div>
                    <div>{post.readTime}</div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Sticky sidebar - 4 columns */}
            <motion.aside
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 space-y-8"
            >
              {/* Table of contents placeholder */}
              <div className="sticky top-32 space-y-8">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                    In This Article
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors">
                      Introduction
                    </div>
                    <div className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors">
                      Main Concepts
                    </div>
                    <div className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors">
                      Conclusion
                    </div>
                  </div>
                </div>

                {/* Decorative stats */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                    <div className="text-5xl font-black text-cyan-400 mb-2">
                      {post.readTime.split(' ')[0]}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">
                      Minute Read
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>

      {/* Related articles - dramatic grid */}
      {relatedPosts.length > 0 && (
        <Section className="py-32 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-20 tracking-tight">
                Continue<br />Reading
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((related, idx) => (
                  <motion.article
                    key={related._id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="group"
                  >
                    <Link href={`/blog/${related.slug}`}>
                      {/* Dramatic gradient card */}
                      <div className={`relative h-64 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br ${related.gradient}`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#03030a] via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />

                        {/* Decorative number */}
                        <div className="absolute top-6 right-6 text-8xl font-black text-white/10">
                          {(idx + 1).toString().padStart(2, '0')}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                          {related.category}
                        </span>

                        <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                          {related.title}
                        </h3>

                        <p className="text-gray-400 leading-relaxed line-clamp-2">
                          {related.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{related.date}</span>
                          <span>•</span>
                          <span>{related.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>
      )}

      {/* Navigation - dramatic prev/next */}
      {(previousPost || nextPost) && (
        <Section className="py-24 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {previousPost ? (
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={`/blog/${previousPost.slug}`}>
                    <div className="p-10 rounded-2xl border-2 border-white/10 hover:border-cyan-500/50 transition-all bg-gradient-to-br from-white/[0.02] to-transparent hover:from-cyan-500/5">
                      <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </div>
                      <h3 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight mb-4">
                        {previousPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{previousPost.date}</p>
                    </div>
                  </Link>
                </motion.div>
              ) : <div />}

              {nextPost ? (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link href={`/blog/${nextPost.slug}`}>
                    <div className="p-10 rounded-2xl border-2 border-white/10 hover:border-purple-500/50 transition-all bg-gradient-to-bl from-white/[0.02] to-transparent hover:from-purple-500/5 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <h3 className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors leading-tight mb-4">
                        {nextPost.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{nextPost.date}</p>
                    </div>
                  </Link>
                </motion.div>
              ) : <div />}
            </div>
          </div>
        </Section>
      )}

      {/* Newsletter CTA - immersive */}
      <Section className="py-32 border-t border-white/5 relative overflow-hidden">
        {/* Dramatic background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-cyan-500/5" />
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]`} />

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative text-center max-w-4xl mx-auto"
        >
          <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${post.gradient} bg-opacity-20 border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-12`}>
            Stay Updated
          </div>

          <h2 className="text-6xl lg:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter">
            Never Miss<br />an Update
          </h2>

          <p className="text-xl lg:text-2xl text-gray-400 mb-16 leading-relaxed font-light max-w-2xl mx-auto">
            Get insights on VR, design, and innovation delivered to your inbox
          </p>

          <Link href="/blog">
            <Button variant="primary" size="lg" className="group px-12 py-6 text-lg font-bold">
              <span>Explore More Articles</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </Section>
    </div>
  );
}
