# TVR Project - Master Plan

## What This Is
Adding Tri Virtual Roundtable (TVR) as a second site within the Media4U Next.js codebase.
Both sites share the same Convex backend, auth system, and admin dashboard.
TVR gets its own branding, pages, and content.

## Architecture: Route Groups

```
src/app/
  (media4u)/              <- All current Media4U pages moved here
    layout.tsx            <- Media4U root layout (blue theme, M4U header/footer)
    page.tsx              <- Media4U homepage
    services/
    portfolio/
    vr/
    blog/
    contact/
    about/
    start-project/
    checkout/
    community/
  (tvr)/                  <- All new TVR pages
    layout.tsx            <- TVR root layout (purple theme, TVR header/footer)
    page.tsx              <- TVR homepage
    about/
    hosts/
    podcast/
    blog/
    heart/
  admin/                  <- Shared admin (stays at root)
  portal/                 <- Shared client portal (stays at root)
  api/                    <- Shared API routes (stays at root)
  login/                  <- Shared auth pages (stays at root)
  signup/
  forgot-password/
  reset-password/
  layout.tsx              <- Base root layout (providers only, no branding)
  globals.css             <- Both themes defined here
```

## Domain Routing
Middleware detects hostname:
- trivirtualroundtable.net (Hostinger domain) -> serves (tvr) routes
- media4u.fun -> serves (media4u) routes
- localhost -> both accessible (default Media4U, /tvr prefix for testing)
- Deployment: Single Vercel project, both domains pointed to it
- Admin: Shared - accessible from both domains at /admin

## Work Chunks (designed for token-limited sessions)

### CHUNK 1 + 2: Foundation (COMBINED - simpler approach) [DONE]
STATUS: COMPLETE
- CHANGED APPROACH: Instead of moving Media4U files into route groups, TVR pages live under src/app/tvr/
- Middleware rewrites trivirtualroundtable.net requests to /tvr/* routes
- Media4U pages untouched - zero risk of breaking anything
- Added TVR color palette (purple theme) to tailwind.config.ts and globals.css
- Created TVR header: src/components/layout/tvr-header.tsx
- Created TVR footer: src/components/layout/tvr-footer.tsx
- Created TVR layout: src/app/tvr/layout.tsx
- Created TVR homepage: src/app/tvr/page.tsx (with hero, hosts preview, H.E.A.R.T. preview, live shows)
- Updated LayoutWrapper to show TVR header/footer on /tvr routes
- Updated middleware for TVR domain detection and rewriting
- Hidden QuickQuoteWidget on TVR pages
- Copied logo to public/tvr-logo.png
- Lint passes clean

### CHUNK 3: TVR Homepage [MEDIUM]
STATUS: NOT STARTED
- Build the TVR homepage with:
  - Hero section (podcast intro, hosts)
  - Latest episodes section
  - About snippet
  - H.E.A.R.T. section preview
  - Social links / platform links
  - CTA sections
- Files: 1 page file, maybe 2-3 component files

### CHUNK 4: TVR Core Pages [MEDIUM]
STATUS: NOT STARTED
- About page
- Hosts page (3 host profiles)
- Podcast page (Buzzsprout RSS integration or Spotify embed)
- H.E.A.R.T. page
- Files: 4 page files

### CHUNK 5: TVR Blog & Backend [MEDIUM]
STATUS: NOT STARTED
- Add `site` field to blogPosts schema (to filter M4U vs TVR posts)
- Create TVR blog listing page
- Update admin blog to support site selection
- Blog post detail page for TVR
- Files: 2-3 page files, 1-2 schema/convex edits

### CHUNK 6: Middleware & Domain Routing [SMALL]
STATUS: NOT STARTED
- Update middleware.ts for hostname detection
- Set up Vercel domains
- Test routing between sites
- Files: 1 middleware file, Vercel config

### CHUNK 7: TVR Special Features [MEDIUM]
STATUS: NOT STARTED
- Podcast RSS feed integration (auto-pull episodes from Buzzsprout)
- Embedded Spotify/YouTube players
- Patreon integration
- Newsletter for TVR
- Community features if desired
- Files: varies

## Decisions (CONFIRMED)
- [x] H.E.A.R.T. = Helping Every American Reconnect Together
- [x] Logo: tvr-project/assets/New Fresh Logo.png
- [x] Domain: trivirtualroundtable.net (own domain from Hostinger)
- [x] Admin: Shared with Media4U (same admin panel)

## Still Need
- [ ] Exact social media URLs for Facebook, Instagram, LinkedIn, Twitter
- [ ] TeePublic merch store URL
- [ ] Host photos - high-res images of MrHarmony, Iceman, Doc Maasi
- [ ] Any specific fonts for TVR? (or match current site)

## Research Files
- tvr-project/research/branding.md - colors, logo, theme mapping
- tvr-project/research/content.md - hosts, descriptions, social links, H.E.A.R.T. details

## Key Technical Notes
- MrHarmony (Media4U owner) is also a TVR host - this is the connection
- TVR podcast is on Buzzsprout with RSS at feeds.buzzsprout.com/2403171.rss
- Live Sunday shows happen in VR on Multiverse platform
- Current TVR site is basic Astro/Zyro template - big upgrade opportunity
