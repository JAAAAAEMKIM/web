import { Post, Category, Tag } from '@prisma/client'

interface BlogPostJsonLdProps {
  post: Post & {
    category: Category
    tags: { tag: Tag }[]
  }
  url: string
}

export function generateBlogPostJsonLd({ post, url }: BlogPostJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.heroImageURL || undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: '도리[Dori]',
      url: 'https://jaaaaaemkim.com/about',
    },
    publisher: {
      '@type': 'Person',
      name: '도리[Dori]',
      url: 'https://jaaaaaemkim.com/about',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags.map((t) => t.tag.name).join(', '),
    articleSection: post.category.name,
  }

  // Sanitize to prevent XSS attacks (official Next.js recommendation)
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}
