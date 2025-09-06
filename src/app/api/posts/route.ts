import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
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

    // Check if slug already exists
    const existingPost = await db.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Create the post
    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        heroImageURL,
        categoryId: parseInt(categoryId),
        isPublished,
      },
    })

    // Handle tags
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
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}