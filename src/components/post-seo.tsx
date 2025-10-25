import { Metadata } from 'next'
import slugToIdMapping from '../../slug-to-id.json'

interface PostSeoProps {
  title: string
  description: string
  slug: string
  imageUrl?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generatePostMetadata({
  title,
  description,
  slug,
  imageUrl,
  publishedTime,
  modifiedTime,
}: PostSeoProps): Metadata {
  // For beta phase: point canonical to original Tistory blog
  const tistoryId = slugToIdMapping[slug as keyof typeof slugToIdMapping]
  const canonicalUrl = tistoryId
    ? `https://blue-tang.tistory.com/${tistoryId}`
    : `https://jaaaaaemkim.com/blog/${slug}` // Fallback for new posts
  const siteName = '도리'

  return {
    title: `${title} :: ${siteName}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: 'article',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : undefined,
      publishedTime,
      modifiedTime,
      authors: ['도리[Dori]'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    other: {
      'article:author': '도리[Dori]',
    },
  }
}

export default PostSeoProps