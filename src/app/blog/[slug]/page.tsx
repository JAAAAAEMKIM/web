import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { MainLayout } from "@/components/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { Eye, Calendar, Edit } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await db.post.findUnique({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  // Try to increment view count, but don't fail if it can't
  try {
    await db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
    return { ...post, views: post.views + 1 }
  } catch (error) {
    console.warn('Could not increment view count:', error)
    return post
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <MainLayout>
      <article className="max-w-4xl mx-auto">
        {/* Hero Image */}
        {post.heroImageURL && (
          <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
            <Image
              src={post.heroImageURL}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Post Metadata */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{post.views} views</span>
            </div>
            
            <Badge variant="outline">
              {post.category.name}
            </Badge>
          </div>

          {/* Admin Edit Button - TODO: Add authentication check */}
          <div className="flex justify-end mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/edit/${post.slug}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((postTag) => (
                <Badge key={postTag.tag.name} variant="secondary">
                  {postTag.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-8" />

        {/* Comments Section - Placeholder for Giscus */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>Comments will be integrated here using Giscus (GitHub-based comments)</p>
            <p className="text-sm mt-2">Sign in with GitHub to leave a comment</p>
          </div>
        </div>
      </article>
    </MainLayout>
  )
}

// Dynamic rendering - pages will be generated on-demand
export const dynamic = 'force-dynamic'