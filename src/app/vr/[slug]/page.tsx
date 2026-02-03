/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { api } from '@convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { VRDetailClient } from './VRDetailClient'
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
  if (!convex) return { title: 'VR Experience Not Found' }
  const experience = await convex.query(api.vr.getExperienceBySlug, { slug })

  if (!experience) {
    return {
      title: 'VR Experience Not Found',
    }
  }

  const description = experience.description.slice(0, 155)
  const keywords = [
    ...experience.categories,
    'VR',
    'virtual reality',
    'metaverse',
    experience.type === 'property' ? 'VR property' : 'VR destination',
  ]

  return {
    title: `${experience.title} - VR ${experience.type} | Media4U`,
    description,
    keywords,
    alternates: {
      canonical: `https://media4u.fun/vr/${slug}`,
    },
    openGraph: {
      title: experience.title,
      description,
      type: 'website',
      url: `https://media4u.fun/vr/${slug}`,
      images: [
        {
          url: experience.thumbnailImage,
          alt: `${experience.title} - VR ${experience.type}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: experience.title,
      description,
      images: [experience.thumbnailImage],
    },
  }
}

export async function generateStaticParams() {
  if (!convex) return []
  const experiences = await convex.query(api.vr.getAllExperiences)

  return experiences.map((exp: any) => ({
    slug: exp.slug,
  }))
}

export default async function VRDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const experience = convex ? await convex.query(api.vr.getExperienceBySlug, { slug }) : null

  if (!experience) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Section className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Experience Not Found</h1>
          <p className="text-gray-400 mb-8">We couldn&apos;t find the experience you&apos;re looking for.</p>
          <Link href="/vr">
            <Button variant="primary">Back to VR Experiences</Button>
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
          { name: 'VR Experiences', url: 'https://media4u.fun/vr' },
          { name: experience.title, url: `https://media4u.fun/vr/${experience.slug}` },
        ]}
      />

      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: experience.title,
            description: experience.fullDescription || experience.description,
            image: experience.thumbnailImage,
            category: experience.categories.join(', '),
            offers: {
              '@type': 'Offer',
              price: experience.price || 0,
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `https://media4u.fun/vr/${experience.slug}`,
            },
            brand: {
              '@type': 'Brand',
              name: 'Media4U',
            },
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'VR Type',
                value: experience.type,
              },
            ],
          }),
        }}
      />

      <VRDetailClient experience={experience} />
    </>
  )
}
