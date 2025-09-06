# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm run seed` - Seed database with initial data (admin user + sample posts)
- `npx prisma db push` - Apply schema changes to SQLite database
- `npx prisma generate` - Regenerate Prisma client after schema changes
- `npx prisma studio` - Open database GUI
- Use `pnpm` instead of `npm` for all package management

## Deployment

### Direct Deployment (Production)

The application is configured for direct deployment without Docker. Use the provided deployment script:

- `./deploy-ec2.sh` - Full deployment script for EC2 or similar servers
- Requires Node.js 18+, pnpm, and optionally PM2 for process management
- Automatically handles database initialization, dependency installation, and application building
- Supports both PM2 process management and direct execution

## Architecture Overview

This is a Next.js 15 personal blog built with TypeScript, using App Router architecture. The application follows a clear separation between public blog content and authenticated admin functionality.

### Core Technology Stack
- **Next.js 15** with App Router for SSR/SSG
- **React 19** with TypeScript for type safety
- **SQLite + Prisma ORM** for data persistence with query logging enabled
- **NextAuth.js** with credentials provider for admin authentication
- **ShadCN/UI + Tailwind CSS** for consistent design system
- **react-markdown** with syntax highlighting for content rendering

### Database Schema & Relationships
The database uses a blog-centric design:
- **User**: NextAuth-compatible user model for admin authentication
- **Post**: Core content with slug-based routing, view tracking, and publication state
- **Category**: One-to-many relationship with posts
- **Tag**: Many-to-many relationship with posts via PostTag junction table
- **Account/Session/VerificationToken**: NextAuth standard models

### Authentication Architecture
- **Public routes**: `/blog/*`, `/about` - no authentication required
- **Protected routes**: `/admin/*` - requires authentication via middleware
- **Authentication**: Uses NextAuth.js with credentials provider and bcrypt password hashing
- **Session management**: JWT-based sessions with custom callbacks for user data
- **Admin credentials**: admin@example.com / admin123 (seeded data)

### Content Management Flow
1. **Admin creates/edits posts** via `/admin/write` and `/admin/edit/[slug]` pages
2. **Content is stored as markdown** in database with metadata (title, slug, category, tags)
3. **Posts are rendered** on `/blog/[slug]` with markdown processing and syntax highlighting
4. **View tracking** automatically increments on post access

### Component Architecture
- **MainLayout**: Wraps pages with responsive navigation (desktop sidebar, mobile sheet)
- **PostCard**: Reusable blog post preview component with hero image, excerpt, tags
- **UI Components**: Located in `src/components/ui/` - all from ShadCN/UI library
- **Theme System**: Dark/Light/System modes via next-themes with Tailwind CSS variables

### API Routes Structure
- **`/api/auth/[...nextauth]`**: NextAuth.js authentication endpoints
- **`/api/posts`**: POST for creating posts, requires authentication
- **`/api/posts/[id]`**: GET/PUT for fetching/updating posts (supports both ID and slug lookup)
- **`/api/categories`**: GET/POST for category management

### Key Configuration Files
- **`/src/lib/auth.ts`**: NextAuth configuration with Prisma adapter
- **`/src/lib/db.ts`**: Prisma client singleton with query logging
- **`/src/middleware.ts`**: Route protection for admin pages
- **`/prisma/schema.prisma`**: Database schema with blog and NextAuth models
- **`/prisma/seed.ts`**: Database seeding script with admin user and sample content

### Known Issues to Address
- **Next.js 15 compatibility**: Dynamic route params must be awaited before use (see console errors)
- **Missing avatar image**: `/avatar.jpg` returns 404, referenced in navigation and about page
- **Image optimization**: Uses `remotePatterns` for external images (Unsplash)

### Environment Variables Required

**Development (.env or .env.local):**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Production (.env.production):**
```env
DATABASE_URL="file:./data/prod.db"
NEXTAUTH_SECRET="your-secure-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Database Operations
Always run `npx prisma db push` after schema changes, then `npx prisma generate` to update the client. The database includes query logging for debugging. Use `pnpm run seed` to reset with fresh sample data.