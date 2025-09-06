# Personal Blog Website

A modern, responsive personal blog website built with Next.js 15, React 19, and TypeScript, following the provided PRD specifications.

## Features

- ✅ **Modern Tech Stack**: Next.js 15, React 19, TypeScript
- ✅ **Responsive Design**: Desktop sidebar navigation, mobile sheet menu
- ✅ **Dark Mode**: Light, Dark, and System theme options
- ✅ **ShadCN/UI Components**: Consistent design system
- ✅ **Database**: SQLite with Prisma ORM
- ✅ **Authentication**: NextAuth.js for admin routes
- ✅ **Markdown Support**: Rich content with syntax highlighting
- ✅ **Blog Features**: Posts, categories, tags, view counts
- ✅ **Admin Panel**: Create and edit posts with markdown editor

## Pages

- `/blog` - Main blog listing with responsive grid
- `/blog/[slug]` - Individual post with markdown rendering
- `/about` - Personal information and experience
- `/admin/write` - Create new blog posts (authenticated)
- `/admin/edit/[slug]` - Edit existing posts (authenticated)
- `/auth/signin` - Admin login page

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up the database:
   ```bash
   npx prisma db push
   pnpm run seed
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

- **Email**: admin@example.com
- **Password**: admin123

## Database

The application uses SQLite with the following main models:
- **User**: Admin authentication
- **Post**: Blog posts with title, content, slug, etc.
- **Category**: Post categories
- **Tag**: Post tags (many-to-many with posts)

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS + ShadCN/UI
- **Database**: SQLite + Prisma
- **Authentication**: NextAuth.js
- **Markdown**: react-markdown with syntax highlighting

## Project Structure

```
src/
├── app/
│   ├── blog/           # Blog pages
│   ├── admin/          # Admin pages (protected)
│   ├── api/            # API routes
│   └── auth/           # Authentication pages
├── components/         # Reusable components
│   └── ui/             # ShadCN/UI components
└── lib/                # Utilities and configurations
```