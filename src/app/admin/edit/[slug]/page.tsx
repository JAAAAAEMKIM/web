"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Post {
  id: number
  title: string
  slug: string
  content: string
  heroImageURL?: string | null
  isPublished: boolean
  categoryId: number
  tags: { tag: { name: string } }[]
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function EditPostPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [heroImageURL, setHeroImageURL] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tags, setTags] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      fetchPost()
      fetchCategories()
    }
  }, [resolvedParams])

  const fetchPost = async () => {
    if (!resolvedParams) return
    try {
      const response = await fetch(`/api/posts/${resolvedParams.slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        setTitle(data.title)
        setSlug(data.slug)
        setContent(data.content)
        setHeroImageURL(data.heroImageURL || "")
        setCategoryId(data.categoryId.toString())
        setTags(data.tags.map((t: any) => t.tag.name).join(", "))
        setIsPublished(data.isPublished)
      } else if (response.status === 404) {
        notFound()
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (publish: boolean) => {
    if (!post) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          heroImageURL: heroImageURL || null,
          categoryId: parseInt(categoryId),
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          isPublished: publish,
        }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        router.push(`/blog/${updatedPost.slug}`)
      } else {
        alert('Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('An error occurred while updating the post')
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </MainLayout>
    )
  }

  if (!post) {
    return notFound()
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
            <CardDescription>
              Update your blog post with markdown support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-slug"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={heroImageURL}
                onChange={(e) => setHeroImageURL(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, nextjs, typescript (comma-separated)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content in markdown..."
                className="min-h-[400px] font-mono"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              onClick={() => handleSubmit(false)}
              variant="outline"
              disabled={isLoading || !title || !content || !categoryId}
            >
              {isLoading ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !title || !content || !categoryId}
            >
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  )
}