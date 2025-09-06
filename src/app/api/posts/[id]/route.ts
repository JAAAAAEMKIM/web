import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if the id is numeric (for ID-based lookup) or string (for slug-based lookup)
    const idOrSlug = id
    const isNumeric = /^\d+$/.test(idOrSlug)
    
    const post = await db.post.findUnique({
      where: isNumeric ? 
        { id: parseInt(idOrSlug) } : 
        { slug: idOrSlug },
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
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content, heroImageURL, categoryId, tags, isPublished } = body

    if (!title || !slug || !content || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { id } = await params
    const postId = parseInt(id)
    
    // Find the existing post
    const existingPost = await db.post.findUnique({
      where: { id: postId },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if slug already exists (only if it's different from current)
    if (slug !== existingPost.slug) {
      const slugExists = await db.post.findUnique({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // Update the post
    const post = await db.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        content,
        heroImageURL,
        categoryId: parseInt(categoryId),
        isPublished,
      },
    })

    // Delete existing post-tag relationships
    await db.postTag.deleteMany({
      where: { postId: post.id },
    })

    // Handle new tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await db.tag.findUnique({
          where: { name: tagName },
        })

        if (!tag) {
          tag = await db.tag.create({
            data: { name: tagName },
          })
        }

        // Create post-tag relationship
        await db.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id,
          },
        })
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}