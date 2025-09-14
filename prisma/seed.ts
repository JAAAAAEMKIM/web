import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const prisma = new PrismaClient()

interface ParsedPost {
  title: string
  category: string
  date: string
  content: string
  tags: string[]
  postId: string
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseDate(dateStr: string): Date {
  // Format: "2021-04-05 00:18:25"
  return new Date(dateStr)
}

async function copyImagesAndUpdatePaths(postDir: string, postId: string, contentElement: Element): Promise<void> {
  const imgDir = path.join(postDir, 'img')
  const publicImagesDir = path.join(process.cwd(), 'public', 'images')
  
  // Create post-specific directory in public/images
  const postImagesDir = path.join(publicImagesDir, postId)
  
  if (fs.existsSync(imgDir)) {
    // Ensure the post images directory exists
    fs.mkdirSync(postImagesDir, { recursive: true })
    
    // Copy all images from img directory
    const imageFiles = fs.readdirSync(imgDir).filter(file => 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    )
    
    for (const imageFile of imageFiles) {
      const sourcePath = path.join(imgDir, imageFile)
      const destPath = path.join(postImagesDir, imageFile)
      fs.copyFileSync(sourcePath, destPath)
      console.log(`  Copied image: ${imageFile}`)
    }
    
    // Update image paths in the HTML content
    const images = contentElement.querySelectorAll('img')
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src && src.startsWith('./img/')) {
        // Extract filename from the original path
        const filename = path.basename(src)
        // Update to new public path
        img.setAttribute('src', `/images/${postId}/${filename}`)
      }
    })
  }
}

async function parseHtmlPost(postDir: string): Promise<ParsedPost | null> {
  const files = fs.readdirSync(postDir)
  const htmlFile = files.find(f => f.endsWith('.html'))
  
  if (!htmlFile) {
    console.log(`No HTML file found in ${postDir}`)
    return null
  }

  const filePath = path.join(postDir, htmlFile)
  const htmlContent = fs.readFileSync(filePath, 'utf-8')
  
  const dom = new JSDOM(htmlContent)
  const document = dom.window.document
  
  // Extract title
  const titleElement = document.querySelector('.title-article')
  if (!titleElement) {
    console.log(`No title found in ${htmlFile}`)
    return null
  }
  const title = titleElement.textContent?.trim() || ''
  
  // Extract category and date from .box-info
  const categoryElement = document.querySelector('.box-info .category')
  const dateElement = document.querySelector('.box-info .date')
  const category = categoryElement?.textContent?.trim() || 'Uncategorized'
  const dateStr = dateElement?.textContent?.trim() || ''
  
  // Extract content from .contents_style
  const contentElement = document.querySelector('.contents_style')
  if (!contentElement) {
    console.log(`No content found in ${htmlFile}`)
    return null
  }
  
  const postId = path.basename(postDir)
  
  // Copy images and update paths, then preserve HTML content
  await copyImagesAndUpdatePaths(postDir, postId, contentElement)
  
  // Keep HTML content instead of converting to markdown
  const content = contentElement.innerHTML
  
  // Extract tags
  const tagsElement = document.querySelector('.tags')
  const tagsText = tagsElement?.textContent?.trim() || ''
  const tags = tagsText
    .replace(/^#/, '')
    .split('#')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  return {
    title,
    category,
    date: dateStr,
    content,
    tags,
    postId
  }
}

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      username: 'admin',
      passwordHash: hashedPassword,
    },
  })

  console.log('Admin user created')

  // Parse all posts from blue-tang-1-1 directory
  const blueTangDir = path.join(process.cwd(), 'blue-tang-1-1')
  if (!fs.existsSync(blueTangDir)) {
    console.error('blue-tang-1-1 directory not found!')
    return
  }

  const postDirs = fs.readdirSync(blueTangDir)
    .filter(item => {
      const fullPath = path.join(blueTangDir, item)
      return fs.statSync(fullPath).isDirectory() && !isNaN(Number(item))
    })
    .sort((a, b) => Number(a) - Number(b))

  console.log(`Found ${postDirs.length} post directories`)

  const categoriesMap = new Map<string, any>()
  const tagsMap = new Map<string, any>()
  const posts: ParsedPost[] = []

  // Parse all posts
  for (const postDir of postDirs) {
    const fullPath = path.join(blueTangDir, postDir)
    try {
      const parsedPost = await parseHtmlPost(fullPath)
      if (parsedPost) {
        posts.push(parsedPost)
        console.log(`Parsed post: ${parsedPost.title}`)
      }
    } catch (error) {
      console.error(`Error parsing post in ${postDir}:`, error)
    }
  }

  console.log(`Successfully parsed ${posts.length} posts`)

  // Create categories
  for (const post of posts) {
    if (!categoriesMap.has(post.category)) {
      const category = await prisma.category.upsert({
        where: { name: post.category },
        update: {},
        create: { name: post.category },
      })
      categoriesMap.set(post.category, category)
      console.log(`Created category: ${post.category}`)
    }
  }

  // Create tags
  const allTags = new Set<string>()
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag))
  })

  for (const tagName of allTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
    tagsMap.set(tagName, tag)
    console.log(`Created tag: ${tagName}`)
  }

  // Create posts
  for (const parsedPost of posts) {
    const category = categoriesMap.get(parsedPost.category)
    const slug = createSlug(parsedPost.title)
    const createdAt = parseDate(parsedPost.date)

    const post = await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        id: parseInt(parsedPost.postId),
        title: parsedPost.title,
        slug,
        content: parsedPost.content,
        isPublished: true,
        categoryId: category.id,
        views: 0,
        createdAt,
        updatedAt: createdAt,
      },
    })

    // Create post-tag relationships
    for (const tagName of parsedPost.tags) {
      const tag = tagsMap.get(tagName)
      if (tag) {
        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId: tag.id,
          },
        })
      }
    }

    console.log(`Created post: ${parsedPost.title}`)
  }

  console.log('Database migration completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })