# Media4U - Convex Backend Integration Setup Guide

This guide walks you through setting up and configuring your Convex backend for the Media4U project.

## ✅ What's Already Done

The following has been implemented:

### Backend (Convex)
- ✅ Convex schema (`convex/schema.ts`) with tables for:
  - Contact submissions
  - Newsletter subscribers
  - Blog posts
  - Portfolio projects

- ✅ Mutations & Queries:
  - `convex/contactSubmissions.ts` - Contact form CRUD
  - `convex/newsletter.ts` - Newsletter subscription management
  - `convex/blog.ts` - Blog post management
  - `convex/portfolio.ts` - Portfolio project management
  - `convex/emails.ts` - Email notifications with Resend

- ✅ Seed data (`convex/seed.ts`) - Ready to populate database with initial content

### Frontend Integration
- ✅ ConvexProvider setup in root layout
- ✅ Contact form integrated with Convex mutations + Resend emails
- ✅ Newsletter forms integrated with Convex mutations
- ✅ Blog page fetches from Convex (with fallback to hardcoded data)
- ✅ Portfolio page fetches from Convex (with fallback to hardcoded data)
- ✅ Toast notification system (Sonner) installed
- ✅ Skeleton loading components created

---

## 🚀 Setup Steps

### Step 1: Create Convex Account & Project

1. Go to https://www.convex.dev and sign up (free account)
2. Create a new project called "media4u"
3. Copy your deployment URL (format: `https://[project-name].convex.cloud`)

### Step 2: Update Environment Variables

Edit `.env.local` in your project root:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
CONVEX_DEPLOYMENT=dev:your-project-name

# Resend (Email service)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=hello@media4u.fun

# Admin
ADMIN_PASSWORD=your-secure-password

# WhatsApp (optional)
NEXT_PUBLIC_WHATSAPP_NUMBER=15551234567
```

**How to get each variable:**

- **NEXT_PUBLIC_CONVEX_URL**: From Convex dashboard → Project settings
- **CONVEX_DEPLOYMENT**: From Convex dashboard → Project settings
- **RESEND_API_KEY**:
  1. Sign up at https://resend.com (free tier available)
  2. Go to API Keys
  3. Create new API key
  4. Copy the full key starting with `re_`

### Step 3: Connect Convex Locally

In your project directory, run:

```bash
npm exec convex dev
```

**On Windows PowerShell, if you get execution policy errors:**
```bash
cmd /c npm exec convex dev
```

Or use Git Bash if available.

This will:
1. Prompt you to log in to Convex
2. Create `convex.json` with your deployment info
3. Start the Convex dev server
4. Generate `convex/_generated/api.ts` automatically

**Keep this terminal running** while developing!

### Step 4: Seed Initial Data

Once Convex dev is running, in another terminal:

```bash
# Run the migration to seed blog posts and portfolio projects
npm run seed
```

If `seed` script isn't defined, add to `package.json`:
```json
"scripts": {
  "seed": "npx convex run seed:seedAll"
}
```

Or manually seed via Convex dashboard:
1. Go to your Convex project dashboard
2. Navigate to "Functions" tab
3. Find `seed:seedAll` and click "Run"

### Step 5: Test Forms

1. Start dev server: `npm run dev`
2. Visit http://localhost:3000/contact
3. Fill out contact form - it should:
   - Save to Convex database
   - Send email notification (if Resend API key is set)
   - Show success message
4. Visit http://localhost:3000/blog
5. Subscribe to newsletter - should:
   - Save email to Convex database
   - Show success/duplicate email message

### Step 6: Verify Data in Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Click your project
3. Click "Data" tab
4. You should see:
   - `contactSubmissions` table with your form submissions
   - `newsletterSubscribers` table with emails
   - `blogPosts` table with 5 posts
   - `portfolioProjects` table with 6 projects

---

## 📝 Next Steps for Admin Dashboard

The admin dashboard infrastructure is ready to be built. Here's what remains:

### Phase 3: Admin Dashboard (Not Yet Implemented)

#### Pages to Create:
1. **`src/app/admin/layout.tsx`** - Admin sidebar + auth protection
2. **`src/app/admin/contacts/page.tsx`** - View/manage contact submissions
3. **`src/app/admin/newsletter/page.tsx`** - View/manage subscribers
4. **`src/app/admin/blog/page.tsx`** - Create/edit/delete blog posts (with rich editor)
5. **`src/app/admin/portfolio/page.tsx`** - Create/edit/delete portfolio projects

#### Auth Setup:
- Simple password protection (basic implementation)
- Or integrate Convex Auth for more security
- Create `convex/auth.ts` with login mutation

#### Features Needed:
- Rich text editor for blog (Tiptap is installed)
- Image upload to Convex file storage
- Form builders for admin pages
- Dashboard layout with navigation

---

## 🔧 Important Files

### Backend
- `convex/schema.ts` - Database schemas
- `convex/contactSubmissions.ts` - Contact mutations
- `convex/newsletter.ts` - Newsletter mutations
- `convex/blog.ts` - Blog CRUD
- `convex/portfolio.ts` - Portfolio CRUD
- `convex/emails.ts` - Email sending actions

### Frontend
- `src/components/ConvexClientProvider.tsx` - Convex provider wrapper
- `src/app/contact/contact-form.tsx` - Uses Convex mutations
- `src/app/blog/page.tsx` - Fetches from Convex
- `src/app/portfolio/page.tsx` - Fetches from Convex

### Configuration
- `.env.local` - Environment variables
- `convex.json` - Convex project config (auto-generated)
- `convex/_generated/api.ts` - Auto-generated API types (auto-generated)

---

## 🐛 Troubleshooting

### "Cannot prompt for input in non-interactive terminals"
**Solution:** Run `npm exec convex dev` in PowerShell directly or use Command Prompt:
```bash
cmd /c npm exec convex dev
```

### "NEXT_PUBLIC_CONVEX_URL is not set"
**Solution:** Make sure `.env.local` has the variable set and restart dev server:
```bash
npm run dev
```

### Forms not submitting data
**Checklist:**
1. Is `npm exec convex dev` running in another terminal?
2. Is `NEXT_PUBLIC_CONVEX_URL` correct in `.env.local`?
3. Check browser console for errors
4. Check Convex dashboard → Logs for backend errors

### No data in Convex tables after seeding
**Solution:**
1. Run `npm exec convex dev` to ensure connected
2. Go to Convex dashboard
3. Click "Functions" → `seed:seedAll` → "Run"
4. Or manually insert data through dashboard

### Email notifications not sending
**Checklist:**
1. Is `RESEND_API_KEY` set in `.env.local`?
2. API key starts with `re_`?
3. Check Convex dashboard → Logs for email action errors
4. Verify email address in `FROM_EMAIL` is verified in Resend account

---

## 📚 Resources

- **Convex Docs**: https://docs.convex.dev
- **Convex Dashboard**: https://dashboard.convex.dev
- **Resend Email Docs**: https://resend.com/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **Sonner Toast**: https://sonner.emilkowal.ski/

---

## ✨ Features Working

- ✅ Contact form saves to database
- ✅ Contact form sends email notifications
- ✅ Newsletter subscription with duplicate checking
- ✅ Blog posts load from database
- ✅ Portfolio projects load from database
- ✅ Fallback to hardcoded data if database empty
- ✅ Form validation and error handling
- ✅ Toast notifications for user feedback

---

## 🎯 Still TODO

- [ ] Individual blog post pages (`/blog/[slug]`)
- [ ] Individual portfolio pages (`/portfolio/[slug]`)
- [ ] Admin authentication & dashboard
- [ ] Admin blog management with rich editor
- [ ] Admin portfolio management
- [ ] Admin contact submissions viewer
- [ ] Admin newsletter management
- [ ] Fix broken links (`/work` → `/portfolio`)
- [ ] Add real WhatsApp number
- [ ] Add real social media links

---

## Questions?

Refer to the Convex documentation or check the implementation in:
- `convex/` directory for backend code
- `src/app/contact/contact-form.tsx` for form integration example
- `src/app/blog/page.tsx` for data fetching example
