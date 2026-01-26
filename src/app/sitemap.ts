import { MetadataRoute } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vrExperiences, blogPosts, portfolioProjects] = await Promise.all([
    convex.query(api.vr.getAllExperiences),
    convex.query(api.blog.getAllPosts, { publishedOnly: true }),
    convex.query(api.portfolio.getAllProjects),
  ])

  return [
    // Static pages with priority
    {
      url: 'https://media4u.fun',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://media4u.fun/vr',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://media4u.fun/services',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://media4u.fun/portfolio',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://media4u.fun/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://media4u.fun/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://media4u.fun/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://media4u.fun/start-project',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // VR experiences (HIGH PRIORITY for VR SEO)
    ...vrExperiences.map((exp) => ({
      url: `https://media4u.fun/vr/${exp.slug}`,
      lastModified: new Date(exp.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),

    // Blog posts
    ...blogPosts.map((post) => ({
      url: `https://media4u.fun/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),

    // Portfolio projects
    ...portfolioProjects.map((project) => ({
      url: `https://media4u.fun/portfolio/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
