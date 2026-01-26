import type { Metadata } from 'next'
import { api } from '@convex/_generated/api'
import { preloadQuery } from 'convex/nextjs'
import { ConvexHttpClient } from 'convex/browser'
import { BlogDetailClient } from './BlogDetailClient'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await convex.query(api.blog.getBlogPostBySlug, { slug })

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const description = post.excerpt?.slice(0, 155) || post.content.slice(0, 155)

  return {
    title: `${post.title} | Media4U Blog`,
    description,
    keywords: [post.category, 'VR', 'technology', 'digital solutions'],
    alternates: {
      canonical: `https://media4u.fun/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `https://media4u.fun/blog/${slug}`,
      publishedTime: new Date(post.date).toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  }
}

export async function generateStaticParams() {
  const posts = await convex.query(api.blog.getAllPosts, { publishedOnly: true })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    convex.query(api.blog.getBlogPostBySlug, { slug }),
    convex.query(api.blog.getAllPosts, { publishedOnly: true }),
  ])

  if (!post) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Section className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">We couldn&apos;t find the blog post you&apos;re looking for.</p>
          <Link href="/blog">
            <Button variant="primary">Back to Blog</Button>
          </Link>
        </Section>
      </div>
    )
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = allPosts
    ? allPosts
        .filter((p) => p.category === post.category && p.slug !== post.slug)
        .slice(0, 3)
    : []

  // Get previous and next posts by date
  const sortedPosts = allPosts ? [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
  const currentIndex = sortedPosts.findIndex((p) => p.slug === post.slug)
  const previousPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null

  return (
    <>
      {/* Breadcrumbs Schema */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: 'https://media4u.fun' },
          { name: 'Blog', url: 'https://media4u.fun/blog' },
          { name: post.title, url: `https://media4u.fun/blog/${post.slug}` },
        ]}
      />

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt || post.content.slice(0, 200),
            datePublished: new Date(post.date).toISOString(),
            author: {
              '@type': 'Organization',
              name: 'Media4U',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Media4U',
              logo: {
                '@type': 'ImageObject',
                url: 'https://media4u.fun/media4u-logo.png',
              },
            },
            articleSection: post.category,
          }),
        }}
      />

      <BlogDetailClient
        post={post}
        relatedPosts={relatedPosts}
        previousPost={previousPost}
        nextPost={nextPost}
      />
    </>
  )
}
