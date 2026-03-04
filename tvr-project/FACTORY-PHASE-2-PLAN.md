# Factory Template Phase 2 - Lead to Live Site

## The Full Flow (What We're Building)

```
Lead fills out form on Media4U site
    |
    v
Lead appears in Admin > Leads
    |  (already works)
    v
Admin clicks "Convert to Client Site" -> picks plan + industry
    |  (already works - convertLeadToFactory mutation)
    v
Client Org created with features enabled
    |  (already works)
    v
Admin customizes: Content Editor + Skin Picker + Modules
    |  (partially works - needs wiring to template)
    v
Client site goes LIVE at /s/[slug] or custom domain  <-- MISSING
    |
    v
Visitors see the client's real site with their content  <-- MISSING
    |
    v
Blog posts, bookings, reviews flow through modules  <-- MISSING (pages)
```

---

## What Already Works
- Lead capture and management
- Lead-to-client conversion (picks plan, creates org, enables features)
- Admin factory dashboard (list orgs, create orgs, manage plans)
- Feature gating system (FeatureGate, GatedSection, backend hasFeature)
- Content Editor + Skin Picker in admin (saves to templateContent table)
- All module components built (blog, reviews, booking, gallery, etc.)
- All module CRUD built in Convex (queries + mutations)
- Industry skins (pool-service, landscaping, HVAC, plumbing)
- Template preview at /preview/pool-service

## What's Missing (8 Chunks)

---

### Chunk 9: Public Client Site Route
**The most critical missing piece.** Create the route that serves a client's live site.

**Files to create:**
- `src/app/s/[slug]/page.tsx` - Main client site page
  - Fetches org by slug from Convex
  - Fetches enabled features for the org
  - Fetches templateContent for the org
  - Wraps template in FeatureProvider with real feature data
  - Renders the industry template with the org's content
- `src/app/s/[slug]/layout.tsx` - Layout wrapper (no admin nav, clean site)

**How it works:**
- URL: `yourdomain.com/s/orangecrest-pools`
- Fetches clientOrg by slug
- Gets enabled features
- Gets template content from templateContent table
- Merges content with skin defaults
- Renders template with FeatureProvider wrapping it

**Result:** A real, working client site at `/s/[slug]`.

---

### Chunk 10: Template Reads from Convex
**Wire the pool-service template to pull content from the database instead of hardcoded content.ts.**

**Files to modify:**
- `src/templates/pool-service/pool-layout.tsx` - Accept orgId prop, pass content from Convex
- `src/templates/pool-service/hero.tsx` - Use dynamic content
- `src/templates/pool-service/services.tsx` - Use dynamic content
- `src/templates/pool-service/about.tsx` - Use dynamic content
- `src/templates/pool-service/faq.tsx` - Use dynamic content
- `src/templates/pool-service/contact.tsx` - Use dynamic content
- `src/templates/pool-service/reviews.tsx` - Use dynamic reviews from templateReviews
- `src/templates/pool-service/gallery.tsx` - Use dynamic images from templateGalleryItems

**Pattern:** Each component gets content passed down as props. If no Convex content exists, fall back to skin defaults, then to hardcoded content.ts defaults.

**Result:** Admin edits in Content Editor actually show up on the live client site.

---

### Chunk 11: Module Page Routes (Blog, Booking, Reviews)
**Growth/Enterprise modules need their own pages on the client site.**

**Files to create:**
- `src/app/s/[slug]/blog/page.tsx` - Blog listing (uses BlogList + BlogSidebar)
- `src/app/s/[slug]/blog/[postSlug]/page.tsx` - Single blog post (uses BlogPostView)
- `src/app/s/[slug]/booking/page.tsx` - Booking page (uses BookingForm)
- `src/app/s/[slug]/reviews/page.tsx` - Full reviews page (uses ReviewWall + ReviewSubmit)
- `src/app/s/[slug]/gallery/page.tsx` - Full gallery page (uses GalleryPage)

**Each page:**
- Fetches org by slug
- Checks feature is enabled (redirects to main page if not)
- Renders the module component with real data from Convex

**Navigation:** Update the template header to link to these pages when features are enabled.

**Result:** Growth clients get /blog, /booking, /reviews, /gallery pages.

---

### Chunk 12: Custom Domain Middleware
**Route client custom domains to their /s/[slug] site.**

**Files to modify:**
- `src/middleware.ts` - Add factory domain routing
- `convex/factory.ts` - Add `getOrgByDomain` query

**How it works:**
1. Request comes in for `orangecrestpools.com`
2. Middleware checks: is this hostname in our clientOrgs domains?
3. If yes, rewrite to `/s/[slug]` (same pattern as TVR routing)
4. Client sees their site on their own domain

**Caching:** Store a domain-to-slug map that refreshes periodically so we don't hit Convex on every request.

**Result:** Client's custom domain shows their factory site.

---

### Chunk 13: Admin Content Editor - Full Coverage
**Expand the content editor to manage ALL sections, not just hero/business/about.**

**Files to modify:**
- `src/app/admin/factory/[orgId]/content-editor.tsx` - Add sections for:
  - Services (add/edit/remove/reorder service cards)
  - FAQs (add/edit/remove FAQ items)
  - Process steps (edit step titles and descriptions)
  - Quote form (customize service types, pool types)
  - Contact info (phone, email, address, hours)

**New admin components:**
- `src/app/admin/factory/[orgId]/gallery-manager.tsx` - Upload/manage gallery images (uses templateGalleryItems)
- `src/app/admin/factory/[orgId]/blog-manager.tsx` - Create/edit/publish blog posts (uses templateBlogPosts)
- `src/app/admin/factory/[orgId]/reviews-manager.tsx` - Moderate reviews (approve/reject from templateReviews)
- `src/app/admin/factory/[orgId]/bookings-manager.tsx` - View/manage bookings (confirm/cancel from templateBookings)

**Result:** Full admin control over every piece of content on the client's site.

---

### Chunk 14: Client Onboarding Wizard
**After converting a lead to a client org, guide the admin through setup.**

**Files to create:**
- `src/app/admin/factory/[orgId]/setup/page.tsx` - Step-by-step wizard:
  1. Pick industry skin (auto-fills defaults)
  2. Edit business info (name, phone, email, address)
  3. Customize hero text
  4. Add services
  5. Upload gallery photos
  6. Review and publish

**Files to modify:**
- `src/app/admin/factory/[orgId]/page.tsx` - Show "Complete Setup" banner if site not yet published
- `convex/schema.ts` - Add `publishedAt` field to clientOrgs
- `convex/factory.ts` - Add `publishSite` mutation

**Result:** New client setup is fast and guided. No guessing what to do next.

---

### Chunk 15: Stripe Checkout for Factory Clients
**Automate the payment flow for new factory clients.**

**Files to create:**
- `src/app/factory/pricing/page.tsx` - Public pricing page showing Starter/Growth/Enterprise
- `src/app/factory/signup/page.tsx` - Client self-signup (picks plan, enters business info)

**Files to modify:**
- `src/app/api/stripe/create-factory-checkout/route.ts` - Already exists, verify it works
- `convex/factory.ts` - Stripe webhook handlers already exist, verify flow

**Flow:**
1. Client picks plan on pricing page
2. Clicks "Get Started" -> Stripe Checkout
3. Payment succeeds -> webhook creates clientOrg + enables features
4. Client redirected to their new site or admin setup

**Result:** Clients can self-serve sign up and pay without you manually creating orgs.

---

### Chunk 16: Admin Factory List Enhancements
**Small improvements to the factory admin dashboard.**

**Files to modify:**
- `src/app/admin/factory/page.tsx` - Add:
  - Feature count badge per org card
  - "Published" / "Draft" status indicator
  - Quick link to the live client site (/s/[slug])
  - Subscriber count, booking count, review count per org
- `convex/factory.ts` - Add `getOrgStats` query (counts for each module)

**Result:** At a glance, you see which clients are live, which need work, and how active each site is.

---

## Priority Order

| Priority | Chunk | Why |
|----------|-------|-----|
| 1 | Chunk 9 - Public site route | Nothing works without this |
| 2 | Chunk 10 - Template reads Convex | Content editor is useless without this |
| 3 | Chunk 11 - Module page routes | Growth features need pages |
| 4 | Chunk 13 - Full content editor | Admin needs to manage all content |
| 5 | Chunk 12 - Custom domain routing | Clients need their own domain |
| 6 | Chunk 14 - Onboarding wizard | Makes setup faster |
| 7 | Chunk 16 - Admin enhancements | Quality of life |
| 8 | Chunk 15 - Stripe self-signup | Nice to have, can manually create for now |

## Suggested Session Plan
- **Session 1:** Chunks 9 + 10 (public route + content wiring) - this makes sites WORK
- **Session 2:** Chunks 11 + 13 (module pages + full editor) - this makes sites COMPLETE
- **Session 3:** Chunks 12 + 14 (domains + onboarding) - this makes setup EASY
- **Session 4:** Chunks 15 + 16 (Stripe + admin polish) - this makes it SCALABLE
