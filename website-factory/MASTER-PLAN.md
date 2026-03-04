# Media4U Website Factory - Master Plan

## What This Is

A system that lets you sell websites in tiers (Starter, Pro, Enterprise) where every client site ships with ALL features pre-installed, but only the ones they're paying for actually turn on. Upgrades happen instantly from your admin dashboard or automatically when they pay through Stripe. No redeploying, no custom code per client.

---

## Your Current Modules (Already Built)

These features already exist across your projects. We just need to standardize and wire them into the factory system.

| Module | Source Project | Status |
|--------|---------------|--------|
| Core Pages (home/about/services/contact) | Client Starter Template | Ready |
| Gallery | 12+ projects | Ready |
| Blog (Tiptap editor) | Media4U, At-Ease, Lows | Ready |
| Admin Dashboard | Media4U | Ready |
| Stripe Payments | Media4U, LeadRoute | Ready |
| Booking/Appointments | At-Ease Pest | Ready |
| Mapping/GPS/Routing | LeadRoute | Ready |
| Reviews/Testimonials | At-Ease Pest | Ready |
| Email System (Resend) | Media4U, Pet Grooming | Ready |
| PDF/Excel Export | Think Tank | Ready |
| Community Portal | Media4U | Ready |
| Quote Widget | Media4U (quoteRequests) | Ready |
| Newsletter System | Media4U | Ready |
| Client Portal | Media4U | Ready |
| Integration Vault | Media4U (projects table) | Ready |

---

## Plan Tiers

### Starter - $79/month
What the client gets:
- Core pages (home, about, services, contact)
- Gallery
- Contact form
- Basic SEO (sitemap, robots.txt)
- Mobile responsive
- 1 admin user

### Growth (Pro) - $149/month
Everything in Starter plus:
- Blog system
- Booking/appointments
- Reviews/testimonials
- Quote widget
- Newsletter system
- Email notifications (Resend)
- Google Analytics integration
- 3 admin users

### Enterprise - $299/month
Everything in Growth plus:
- Mapping/GPS (LeadRoute)
- Client portal
- Integration vault (custom API keys)
- PDF/Excel export
- Community portal
- Advanced scheduling/routing
- Custom domain
- Priority support
- Unlimited admin users

### Add-ons (any plan)
- Mapping module - $49/month
- Blog system - $29/month
- Booking system - $29/month
- Newsletter system - $19/month
- Community portal - $39/month

(Add-ons let someone on Starter buy just one feature without upgrading to the next tier.)

---

## What Gets Built

### Chunk 1: Database Foundation
**New Convex tables and helpers**

1. **`clientOrgs` table** - represents each client's site/organization
   - name, domain, plan (starter/growth/enterprise)
   - stripeCustomerId, stripeSubscriptionId
   - status (active/suspended/cancelled)
   - createdAt, updatedAt

2. **`orgFeatures` table** - feature flags per org
   - orgId (links to clientOrgs)
   - featureKey (e.g., "mapping", "blog", "booking")
   - enabled (boolean)
   - source: "plan" or "addon" (so you know why it's on)
   - addedAt

3. **`featureRegistry` table** - master list of all available features
   - key (e.g., "mapping")
   - name (e.g., "GPS Mapping & Routing")
   - description
   - requiredPlan (null = addon only, "growth" = included in Growth+)
   - addonPrice (monthly price if bought as addon, in cents)
   - stripePriceId (for addon billing)
   - category (e.g., "content", "operations", "communication")

4. **`planPresets` table** - what each plan includes
   - plan (starter/growth/enterprise)
   - features (array of feature keys that auto-enable)

5. **Helper functions**
   - `requireFeature(ctx, orgId, "mapping")` - backend gate (like your existing `requireAdmin`)
   - `getOrgFeatures(orgId)` - returns all enabled features for an org
   - `applyPlanPreset(orgId, plan)` - enables all features for a plan

### Chunk 2: Admin Dashboard - Feature Management
**Your admin panel for controlling client features**

1. **Client Orgs list page** - see all client sites
2. **Client detail page** with:
   - Plan dropdown (Starter / Growth / Enterprise)
   - Feature toggles checklist
   - Add-on management
   - Usage stats (if applicable)
3. **Feature Registry page** - manage available features and pricing
4. Changing a plan auto-applies the preset (enables/disables features)

### Chunk 3: Frontend Feature Gate
**Hook and components for showing/hiding features in client sites**

1. **`useFeature("mapping")` hook** - returns true/false based on org entitlements
2. **`<FeatureGate feature="mapping">` component** - wraps UI that should only show when enabled
3. **`<LockedFeature feature="mapping">` component** - shows "Upgrade to unlock" preview with upsell button
4. **Lazy loading** - heavy modules (maps, charts) only load when enabled so cheap plans stay fast

### Chunk 4: Backend Feature Gate
**API-level protection so nobody can hack around the UI**

1. **`requireFeature(ctx, orgId, featureKey)` middleware** - throws error if feature is off
2. Apply to all module-specific Convex functions (mapping queries, blog mutations, etc.)
3. **Data isolation** - queries only return data if the org has the feature enabled

### Chunk 5: Stripe Integration
**Auto-activate features when clients pay**

1. **Stripe Products** - one product per plan + one per add-on
2. **Webhook handler** for:
   - `checkout.session.completed` - new subscription, apply plan preset
   - `customer.subscription.updated` - plan change, re-apply preset
   - `customer.subscription.deleted` - suspend features
   - `invoice.payment_failed` - flag account
3. **Upgrade flow** - client clicks "Upgrade" in their portal, goes to Stripe Checkout, comes back with features live

### Chunk 6: Client-Facing Dashboard
**Let clients see their plan and usage**

1. **Plan overview page** - "You're on Growth"
2. **Feature list** - what's included, what's locked
3. **Usage meters** (if applicable) - "80 of 100 form submissions used"
4. **Upgrade button** - takes them to Stripe Checkout for next tier
5. **Add-on buttons** - buy individual features
6. **7-day trial button** - try a locked feature free for a week

### Chunk 7: Template Standardization
**Make the client-starter-template the universal base**

1. Update client-starter-template to include all module integration points
2. Every module has a standard folder structure:
   - `/modules/[name]/components/`
   - `/modules/[name]/api/` (Convex functions)
   - `/modules/[name]/config.ts` (feature registry entry)
3. New client site deployment = clone template + create org record + apply plan
4. Document the "new client" checklist

---

## Build Order

| Chunk | What | Depends On | Estimated Effort |
|-------|------|-----------|-----------------|
| 1 | Database Foundation | Nothing | Small - just tables and helpers |
| 2 | Admin Dashboard | Chunk 1 | Medium - new admin pages |
| 3 | Frontend Feature Gate | Chunk 1 | Small - hook and 2 components |
| 4 | Backend Feature Gate | Chunk 1 | Medium - update existing functions |
| 5 | Stripe Integration | Chunks 1-4 | Medium - webhook handlers |
| 6 | Client Dashboard | Chunks 1, 3, 5 | Medium - new portal pages |
| 7 | Template Standardization | Chunks 1-6 | Large - organize all modules |

---

## What This Does NOT Change

- TVR stays as-is (separate concern, only touched when you ask)
- Existing client sites keep working (this is additive)
- Your current admin dashboard stays - we add to it, not replace it
- LeadRoute stays its own project - we reference its modules but don't merge codebases

---

## How It Looks When It's Done

**You get a new client:**
1. Clone the starter template
2. Run a setup script that creates their org in Convex
3. Pick their plan in your admin dashboard
4. Features auto-enable
5. Deploy to Vercel
6. Client logs in, sees their plan, uses their features

**Client wants to upgrade:**
1. They click "Upgrade" in their portal
2. Stripe Checkout handles payment
3. Webhook fires, plan updates, features turn on
4. Client refreshes - new features are live
5. You did zero work

**You build a new module (e.g., "AI Chat"):**
1. Create `/modules/ai-chat/` with components + API + config
2. Add it to the feature registry
3. Set which plans include it
4. Every existing and future client site already has it available
5. Flip it on for whoever pays

---

## Pricing Page Changes

Your current Media4U services page needs to become a clear pricing page:
- 3 tier cards (Starter / Growth / Enterprise)
- Feature comparison table
- Add-on section
- "Start Free Trial" or "Get Started" CTA per tier
- FAQ section

---

## Notes

- All prices are suggestions - you set whatever you want
- Add-on prices can be adjusted per client if needed
- Trial periods are optional but recommended for conversion
- This system works for ANY type of client site (pest control, doors, pools, barbershops, etc.)
