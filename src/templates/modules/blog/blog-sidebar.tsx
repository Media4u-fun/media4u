"use client";

import { Folder, Clock } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  publishedAt?: number;
}

interface BlogSidebarProps {
  posts: BlogPost[];
  categories: string[];
  activeCategory?: string;
  onCategoryClick?: (category: string | undefined) => void;
  onPostClick?: (slug: string) => void;
}

export function BlogSidebar({
  posts,
  categories,
  activeCategory,
  onCategoryClick,
  onPostClick,
}: BlogSidebarProps) {
  const recentPosts = posts.slice(0, 5);

  return (
    <aside className="space-y-8">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Folder className="w-4 h-4" /> Categories
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onCategoryClick?.(undefined)}
                className={`text-sm transition-colors ${
                  !activeCategory
                    ? "text-cyan-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All Posts
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onCategoryClick?.(cat)}
                  className={`text-sm transition-colors ${
                    activeCategory === cat
                      ? "text-cyan-400"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Posts
          </h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post._id}>
                <button
                  onClick={() => onPostClick?.(post.slug)}
                  className="text-sm text-zinc-300 hover:text-cyan-400 transition-colors text-left"
                >
                  {post.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
