/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { api } from '@convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { PortfolioDetailClient } from './PortfolioDetailClient'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!convex) return { title: 'Project Not Found' }
  const project = await convex.query(api.portfolio.getProjectBySlug, { slug })

  if (!project) {
    return { title: 'Project Not Found' }
  }

  const description = project.description.slice(0, 155)
  const keywords = [project.category, 'web design', 'digital solutions', 'portfolio']

  return {
    title: `${project.title} | Media4U Portfolio`,
    description,
    keywords,
    alternates: {
      canonical: `https://media4u.fun/portfolio/${slug}`,
    },
    openGraph: {
      title: project.title,
      description,
      type: 'article',
      url: `https://media4u.fun/portfolio/${slug}`,
      images: project.images && project.images.length > 0 ? [
        {
          url: project.images[0],
          alt: `${project.title} - ${project.category}`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: project.images && project.images.length > 0 ? [project.images[0]] : [],
    },
  }
}

export async function generateStaticParams() {
  if (!convex) return []
  const projects = await convex.query(api.portfolio.getAllProjects)

  return projects.map((project: any) => ({
    slug: project.slug,
  }))
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = convex ? await convex.query(api.portfolio.getProjectBySlug, { slug }) : null

  if (!project) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Section className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-400 mb-8">We couldn&apos;t find the project you&apos;re looking for.</p>
          <Link href="/portfolio">
            <Button variant="primary">Back to Portfolio</Button>
          </Link>
        </Section>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumbs Schema */}
      <Breadcrumbs
        items={[
          { name: 'Home', url: 'https://media4u.fun' },
          { name: 'Portfolio', url: 'https://media4u.fun/portfolio' },
          { name: project.title, url: `https://media4u.fun/portfolio/${project.slug}` },
        ]}
      />

      {/* CreativeWork Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description: project.fullDescription || project.description,
            category: project.category,
            creator: {
              '@type': 'Organization',
              name: 'Media4U',
            },
            dateCreated: new Date(project.createdAt).toISOString(),
            image: project.images && project.images.length > 0 ? project.images[0] : undefined,
          }),
        }}
      />

      <PortfolioDetailClient project={project} />
    </>
  )
}
