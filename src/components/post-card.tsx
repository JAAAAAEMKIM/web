import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, MessageCircle } from "lucide-react"

interface PostCardProps {
  post: {
    id: number
    slug: string
    title: string
    content: string
    heroImageURL?: string | null
    views: number
    createdAt: Date
    excerpt: string
    category: {
      name: string
    }
    tags: {
      tag: {
        name: string
      }
    }[]
  }
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
}

export function PostCard({ post }: PostCardProps) {
  const decodedExcerpt = decodeHtmlEntities(post.excerpt)

  const topTags = post.tags.slice(0, 3)
  
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[300px]">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          {post.heroImageURL ? (
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={post.heroImageURL}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-muted-foreground">No image</div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {decodedExcerpt}
          </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.views}</span>
                </div>
              </div>
        </CardContent>
        
        {topTags.length > 0 && <CardFooter className="mt-auto">
          <div className="w-full space-y-4">
            <Separator />
            <div className="inline-flex flex-wrap gap-1 overflow-hidden">
              {topTags.map((postTag) => (
                <Badge key={postTag.tag.name} variant="secondary" className="text-xs">
                  {postTag.tag.name}
                </Badge>
              ))}
            </div>
          </div> 
        </CardFooter>}
      </Link>
    </Card>
  )
}