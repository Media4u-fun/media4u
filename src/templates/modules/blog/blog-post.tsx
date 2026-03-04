"use client";

import { ArrowLeft, Calendar, User } from "lucide-react";

interface BlogPostData {
  title: string;
  content: string;
  coverImage?: string;
  category?: string;
  author?: string;
  publishedAt?: number;
  tags?: string[];
}

interface BlogPostViewProps {
  post: BlogPostData;
  onBack?: () => void;
}

export function BlogPostView({ post, onBack }: BlogPostViewProps) {
  return (
    <article className="py-20 px-6 md:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </button>
        )}

        {post.category && (
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
            {post.category}
          </span>
        )}

        <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-8">
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {post.author}
            </span>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-zinc max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/[0.06]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-full bg-white/[0.05] text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
