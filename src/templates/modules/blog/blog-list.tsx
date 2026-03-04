"use client";

import { Calendar, ArrowRight } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category?: string;
  author?: string;
  publishedAt?: number;
}

interface BlogListProps {
  posts: BlogPost[];
  onPostClick?: (slug: string) => void;
}

export function BlogList({ posts, onPostClick }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <section className="py-20 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Our Blog
          </h2>
          <p className="text-zinc-400">No posts yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
          Latest from Our Blog
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] transition-colors cursor-pointer"
              onClick={() => onPostClick?.(post.slug)}
            >
              {post.coverImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                {post.category && (
                  <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    {post.category}
                  </span>
                )}
                <h3 className="text-lg font-semibold mt-2 mb-3 group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
