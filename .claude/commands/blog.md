# Blog Post Creator

You are helping create a blog post for Media4U (https://media4u.fun). Follow this exact workflow:

## Step 1: Ask for the Concept

Ask the user: "What topic do you want to blog about?" Wait for their response.

## Step 2: Brainstorm Together

Based on their topic, propose:
- A catchy title
- 3-4 section ideas
- A suggested tone/angle

Ask if they want to adjust anything before you write it. Keep it conversational.

## Step 3: Write and Post

Once the user approves the direction, write the full blog post and create it using the Convex MCP tool.

### Convex Details (DO NOT look these up - they are provided here)

**Deployment selector:** Use `mcp__convex__status` with projectDir `C:\Users\devla\OneDrive\Desktop\claud\media4u` to get the prod deployment selector, then run the function below.

**Function:** `cli.js:createBlogPostCLI`

**Required args (JSON string):**
```json
{
  "adminKey": "dev-key-12345",
  "title": "string - the blog post title",
  "slug": "string - url-friendly version of title (lowercase, hyphens, no special chars)",
  "excerpt": "string - 1-2 sentence summary for preview cards",
  "content": "string - full HTML content of the post",
  "category": "string - one of: Technology, Web Development, VR, Business, Design",
  "date": "string - today's date in YYYY-MM-DD format",
  "readTime": "string - estimated read time like '4 min read'",
  "gradient": "string - tailwind gradient classes for the card",
  "featured": false,
  "published": false
}
```

**Gradient options (pick one that fits the topic):**
- Technology: `"from-violet-600 to-blue-600"`
- Web Development: `"from-blue-600 to-cyan-600"`
- VR: `"from-purple-600 to-pink-600"`
- Business: `"from-emerald-600 to-teal-600"`
- Design: `"from-orange-500 to-red-600"`

**Content format:** HTML with `<h2>`, `<p>`, `<ul>`, `<li>`, `<strong>`, `<code>`, `<a>` tags. No `<h1>` (the title is shown separately). Always end with a CTA linking to `/contact`.

**Writing rules:**
- NEVER use em dashes (-) - use regular hyphens
- Keep it conversational and accessible (the audience is small business owners, not developers)
- Use "we" voice for Media4U
- Include practical examples where possible
- Aim for 4-6 sections
- Estimate read time based on ~200 words per minute

## Step 4: Confirm

After posting, tell the user:
- The post was created as a **draft** (not published)
- They need to add a photo via the admin panel
- They can publish it when ready from the admin panel

**IMPORTANT:** Always create as `published: false` so the user can review and add an image first.
