import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, statSync } from 'fs'
import { join, extname } from 'path'
import { JSDOM } from 'jsdom'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Load the ID to slug mapping
const idToSlugMapping = JSON.parse(readFileSync('id-to-slug.json', 'utf-8'))

interface ParsedPost {
  id: number
  title: string
  content: string
  excerpt?: string
  category: string
  tags: string[]
  createdAt: Date
  heroImageURL?: string
}

function parseDate(dateStr: string): Date {
  // Format: "2021-04-04 18:38:26"
  const [datePart, timePart] = dateStr.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second] = timePart.split(':').map(Number)
  
  return new Date(year, month - 1, day, hour, minute, second)
}

function generateExcerpt(content: string): string {
  // Remove HTML tags and get first 155 characters
  const textContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .trim()
  
  return textContent.length > 155 
    ? textContent.substring(0, 155).trim() + '...'
    : textContent
}

function processImages(postId: number, content: string): { processedContent: string, heroImageURL?: string } {
  const imgDir = join('blue-tang-1-1', postId.toString(), 'img')
  const publicImgDir = join('public', 'images', 'posts', postId.toString())
  
  if (!existsSync(imgDir)) {
    return { processedContent: content }
  }
  
  // Create public directory for images
  if (!existsSync(publicImgDir)) {
    mkdirSync(publicImgDir, { recursive: true })
  }
  
  // Get all images in the img directory
  const imageFiles = readdirSync(imgDir).filter(file => {
    const ext = extname(file).toLowerCase()
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)
  })
  
  let heroImageURL: string | undefined
  let processedContent = content
  
  if (imageFiles.length > 0) {
    // Process each image
    imageFiles.forEach(file => {
      const srcPath = join(imgDir, file)
      const destPath = join(publicImgDir, file)
      
      // Copy image to public directory
      copyFileSync(srcPath, destPath)
      console.log(`Copied image: ${srcPath} -> ${destPath}`)
    })
    
    // Determine hero image
    if (imageFiles.length === 1) {
      // Single image becomes hero
      heroImageURL = `/images/posts/${postId}/${imageFiles[0]}`
    } else {
      // Multiple images: try to find hero based on patterns
      const heroCandidate = imageFiles.find(file => 
        file.includes('hero') || 
        file.includes('main') || 
        file.includes('cover') ||
        file.includes('thumb')
      ) || imageFiles[0] // Fallback to first image
      
      heroImageURL = `/images/posts/${postId}/${heroCandidate}`
    }
    
    // Replace image sources in content
    processedContent = content.replace(/src="\.\/img\/([^"]+)"/g, (match, filename) => {
      return `src="/images/posts/${postId}/${filename}"`
    })
  }
  
  return { processedContent, heroImageURL }
}

function parsePost(postId: number): ParsedPost | null {
  const postDir = join('blue-tang-1-1', postId.toString())
  
  if (!existsSync(postDir)) {
    console.log(`Post directory not found: ${postDir}`)
    return null
  }
  
  // Find HTML file
  const files = readdirSync(postDir)
  const htmlFile = files.find(file => file.endsWith('.html'))
  
  if (!htmlFile) {
    console.log(`No HTML file found in: ${postDir}`)
    return null
  }
  
  const htmlPath = join(postDir, htmlFile)
  const htmlContent = readFileSync(htmlPath, 'utf-8')
  
  const dom = new JSDOM(htmlContent)
  const document = dom.window.document
  
  // Extract metadata
  const titleElement = document.querySelector('h2.title-article') || document.querySelector('title')
  const categoryElement = document.querySelector('p.category')
  const dateElement = document.querySelector('p.date')
  const tagsElement = document.querySelector('.tags')
  const contentElement = document.querySelector('.contents_style')
  
  if (!titleElement || !categoryElement || !dateElement || !contentElement) {
    console.log(`Missing required elements in: ${htmlPath}`)
    return null
  }
  
  const title = titleElement.textContent?.trim() || ''
  const category = categoryElement.textContent?.trim() || 'Uncategorized'
  const dateStr = dateElement.textContent?.trim() || ''
  const tagsText = tagsElement?.textContent?.trim() || ''
  const content = contentElement.innerHTML || ''
  
  // Parse tags
  const tags = tagsText
    .replace(/^#/, '') // Remove leading #
    .split('#')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Limit to 10 tags
  
  // Process images
  const { processedContent, heroImageURL } = processImages(postId, content)
  
  return {
    id: postId,
    title,
    content: processedContent,
    excerpt: generateExcerpt(processedContent),
    category,
    tags,
    createdAt: parseDate(dateStr),
    heroImageURL
  }
}

async function ensureCategory(name: string): Promise<number> {
  let category = await prisma.category.findUnique({
    where: { name }
  })
  
  if (!category) {
    category = await prisma.category.create({
      data: { name }
    })
    console.log(`Created category: ${name}`)
  }
  
  return category.id
}

async function ensureTag(name: string): Promise<number> {
  let tag = await prisma.tag.findUnique({
    where: { name }
  })
  
  if (!tag) {
    tag = await prisma.tag.create({
      data: { name }
    })
    console.log(`Created tag: ${name}`)
  }
  
  return tag.id
}

async function main() {
  console.log('Starting Tistory migration...')
  
  // Get all post IDs from the mapping
  const postIds = Object.keys(idToSlugMapping).map(Number).sort((a, b) => a - b)
  
  console.log(`Found ${postIds.length} posts to migrate`)
  
  let migratedCount = 0
  let skippedCount = 0
  
  for (const postId of postIds) {
    try {
      console.log(`\nProcessing post ${postId}...`)
      
      const parsedPost = parsePost(postId)
      if (!parsedPost) {
        console.log(`Skipping post ${postId} - parsing failed`)
        skippedCount++
        continue
      }
      
      // Get slug from mapping
      const slug = idToSlugMapping[postId.toString()]
      if (!slug) {
        console.log(`Skipping post ${postId} - no slug mapping`)
        skippedCount++
        continue
      }
      
      // Ensure category exists
      const categoryId = await ensureCategory(parsedPost.category)
      
      // Create post with upsert to handle duplicates
      const post = await prisma.post.upsert({
        where: { id: parsedPost.id },
        update: {
          slug,
          title: parsedPost.title,
          content: parsedPost.content,
          excerpt: parsedPost.excerpt,
          heroImageURL: parsedPost.heroImageURL,
          isPublished: true,
          createdAt: parsedPost.createdAt,
          categoryId
        },
        create: {
          id: parsedPost.id,
          slug,
          title: parsedPost.title,
          content: parsedPost.content,
          excerpt: parsedPost.excerpt,
          heroImageURL: parsedPost.heroImageURL,
          isPublished: true,
          createdAt: parsedPost.createdAt,
          categoryId
        }
      })
      
      // Create tags and relationships
      if (parsedPost.tags.length > 0) {
        // Remove existing post-tag relationships
        await prisma.postTag.deleteMany({
          where: { postId: post.id }
        })
        
        const tagPromises = parsedPost.tags.map(tagName => ensureTag(tagName))
        const tagIds = await Promise.all(tagPromises)
        
        const postTagData = tagIds.map(tagId => ({
          postId: post.id,
          tagId
        }))
        
        await prisma.postTag.createMany({
          data: postTagData
        })
      }
      
      console.log(`✅ Migrated post ${postId}: "${parsedPost.title}" -> /${slug}`)
      migratedCount++
      
    } catch (error) {
      console.error(`❌ Error migrating post ${postId}:`, error)
      skippedCount++
    }
  }
  
  console.log(`\nMigration completed!`)
  console.log(`✅ Migrated: ${migratedCount} posts`)
  console.log(`⏭️  Skipped: ${skippedCount} posts`)
  
  // Generate stats
  const stats = await prisma.post.groupBy({
    by: ['categoryId'],
    _count: true
  })
  
  console.log(`\nPost distribution by category:`)
  for (const stat of stats) {
    const category = await prisma.category.findUnique({ where: { id: stat.categoryId } })
    console.log(`- ${category?.name}: ${stat._count} posts`)
  }
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })