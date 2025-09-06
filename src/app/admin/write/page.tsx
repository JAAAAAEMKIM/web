"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WritePostPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [heroImageURL, setHeroImageURL] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tags, setTags] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    // Auto-generate slug from title
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setSlug(generatedSlug)
  }, [title])

  useEffect(() => {
    // Fetch categories
    fetchCategories()
  }, [])

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
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
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
        const post = await response.json()
        router.push(`/blog/${post.slug}`)
      } else {
        alert('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('An error occurred while creating the post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Write New Post</CardTitle>
            <CardDescription>
              Create a new blog post with markdown support
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
                  placeholder="auto-generated-from-title"
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