# SEO Migration Guide: Tistory to Next.js

This guide provides the complete implementation for transferring SEO authority from your Tistory blog (`blue-tang.tistory.com`) to your new Next.js site (`jaaaaaemkim.com`) without duplicate content penalties.

## Part 1: Next.js PostSeo Component ✅

### Implementation

The `PostSeo` component has been created at `/src/components/post-seo.tsx` and integrated into your blog post pages.

### Features

- **Canonical URLs**: Points to your new domain for all blog posts
- **Open Graph**: Complete social media sharing support
- **Twitter Cards**: Optimized for Twitter sharing
- **SEO Meta Tags**: Title, description, and structured data
- **Article Metadata**: Publication and modification dates

### Usage Example

Your blog post page (`/src/app/blog/[slug]/page.tsx`) now automatically generates proper SEO metadata:

```tsx
// The generateMetadata function automatically creates:
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug, false)

  return generatePostMetadata({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    imageUrl: post.heroImageURL,
    publishedTime: post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  })
}
```

### Generated Output Example

For a post at `https://jaaaaaemkim.com/blog/basecamp-week-2`, the component generates:

```html
<title>베이스캠프 2주차 :: 도리</title>
<meta name="description" content="베이스캠프 2주차 미션: 기획..." />
<link rel="canonical" href="https://jaaaaaemkim.com/blog/basecamp-week-2" />
<meta property="og:title" content="베이스캠프 2주차" />
<meta property="og:url" content="https://jaaaaaemkim.com/blog/basecamp-week-2" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<!-- Plus additional meta tags... -->
```

## Part 2: Tistory Canonical Script ✅

### Implementation Steps

1. **Access Tistory Admin Panel**:
   - Go to your Tistory admin dashboard
   - Navigate to "Blog Management" → "Skin" → "HTML 편집"

2. **Locate the `<head>` Section**:
   - Find the `<head>` opening tag in your HTML
   - Add the script from `/tistory-canonical-script.html` right after the opening `<head>` tag

3. **Configure URL Mappings**:
   - Update the `tistoryToNextUrlMap` object with your post mappings
   - Format: `'TISTORY_POST_ID': 'new-post-slug'`

### URL Mapping Configuration

Based on your Tistory post structure, create mappings like this:

```javascript
var tistoryToNextUrlMap = {
    '7': 'basecamp-week-2',           // /7 → /blog/basecamp-week-2
    '8': 'another-post-slug',         // /8 → /blog/another-post-slug
    '9': 'development-thoughts',      // /9 → /blog/development-thoughts
    // Add all your posts...
};
```

### How to Find Your Mappings

1. **Tistory Post ID**: The number in your Tistory URL (e.g., `/7` in `blue-tang.tistory.com/7`)
2. **New Slug**: The slug in your Next.js URL (e.g., `basecamp-week-2` in `jaaaaaemkim.com/blog/basecamp-week-2`)

### Script Behavior

- **Smart Detection**: Only runs on individual post pages (numeric URLs like `/7`)
- **Canonical Injection**: Dynamically adds `<link rel="canonical">` tags
- **Conflict Resolution**: Removes existing canonical tags before adding new ones
- **Error Handling**: Logs unmapped posts for easy identification

## Testing & Validation

### 1. Test Next.js Metadata

Visit any blog post on your new site and check the page source:

```bash
curl -s https://jaaaaaemkim.com/blog/your-post-slug | grep -E "(canonical|og:|twitter:)"
```

### 2. Test Tistory Canonical Tags

Visit a mapped post on your Tistory blog and inspect the `<head>`:

1. Open browser developer tools (F12)
2. Check the Elements tab for `<link rel="canonical">`
3. Verify it points to your new domain

### 3. Google Search Console

Monitor both domains in Google Search Console to track:
- Index status changes
- Search appearance for both sites
- Any crawling errors

## Migration Timeline Recommendations

### Phase 1: Preparation (Week 1)
- ✅ Implement Next.js PostSeo component
- ✅ Deploy Tistory canonical script
- Set up Google Search Console for new domain
- Submit new sitemap

### Phase 2: Transition (Weeks 2-4)
- Monitor both sites in Search Console
- Track canonical tag implementation
- Update internal links to point to new domain
- Update social media profiles

### Phase 3: Completion (Weeks 5-8)
- Consider 301 redirects if Tistory supports them
- Monitor SEO authority transfer
- Update backlinks where possible
- Remove Tistory canonical script once migration is complete

## Troubleshooting

### Common Issues

1. **Canonical tags not appearing on Tistory**:
   - Check browser console for JavaScript errors
   - Verify the script is in the correct `<head>` location
   - Ensure URL mapping format is correct

2. **Next.js metadata not generating**:
   - Check that posts have required fields (title, slug)
   - Verify database queries are working
   - Check server logs for errors

3. **Google showing duplicate content**:
   - Wait 2-4 weeks for Google to process canonical tags
   - Submit both sitemaps to Search Console
   - Use "Fetch as Google" to test indexing

### Debug Tools

- **Browser DevTools**: Inspect `<head>` elements
- **Google Search Console**: Monitor indexing status
- **SEO testing tools**: Use tools like SEOQuake or Screaming Frog

## Additional SEO Considerations

1. **Update structured data** on your Next.js site to match Tistory
2. **Implement proper internal linking** between posts
3. **Set up proper 404 handling** for unmapped URLs
4. **Consider implementing redirects** if you have high-authority backlinks

---

**Important**: This canonicalization approach signals to search engines that your new Next.js site is the authoritative source for your content, helping transfer SEO authority while both sites coexist during the migration period.