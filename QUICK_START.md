# Media4U - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Convex account (free at https://convex.dev)
- Resend account (free at https://resend.com) - optional for emails

---

## Step 1: Install Dependencies ✅ (Already Done)

```bash
npm install convex resend sonner @tiptap/react @tiptap/starter-kit date-fns
```

---

## Step 2: Create Convex Account

1. Go to https://www.convex.dev
2. Sign up (GitHub recommended for quick setup)
3. Create a new project called "media4u"
4. Copy your **deployment URL** (format: `https://[project-name].convex.cloud`)

---

## Step 3: Configure Environment Variables

Edit `.env.local` in your project root:

```bash
# Get from Convex dashboard
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
CONVEX_DEPLOYMENT=dev:your-project-name

# Get from Resend dashboard (optional, for emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=hello@media4u.fun

# Your contact info (optional)
NEXT_PUBLIC_WHATSAPP_NUMBER=15551234567
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourhandle
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourhandle
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/yourcompany
```

---

## Step 4: Connect Convex Locally

In your project root, **open a NEW terminal** and run:

```bash
npm exec convex dev
```

**Windows PowerShell users:** If you get execution policy errors:
```bash
cmd /c npm exec convex dev
```

This will:
- Log you into Convex
- Create `convex.json` with your deployment
- Start the Convex dev server
- Generate `convex/_generated/api.ts`

**Keep this terminal running while developing!**

---

## Step 5: Seed Database With Sample Data

In **another terminal** (keep the first one running), run:

```bash
npm run seed
```

**Alternative:** If seed script isn't defined:
```bash
npx convex run seed:seedAll
```

This will populate your database with:
- 5 blog posts
- 6 portfolio projects

---

## Step 6: Start Your App

In **another terminal**, run:

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Step 7: Test Everything ✨

### Test Contact Form
1. Go to http://localhost:3000/contact
2. Fill out the form
3. Click "Send Message"
4. Should see success message
5. Check Convex dashboard → Data → `contactSubmissions` table

### Test Newsletter Signup
1. Go to http://localhost:3000/blog
2. Scroll to "Stay in the Loop"
3. Enter your email
4. Click "Subscribe"
5. Should see success message or "already subscribed"

### Check Your Data
1. Go to https://dashboard.convex.dev
2. Click your project
3. Click "Data" tab
4. You should see:
   - `blogPosts` (5 posts)
   - `portfolioProjects` (6 projects)
   - `contactSubmissions` (form you submitted)
   - `newsletterSubscribers` (email you entered)

---

## 📚 What's Working

✅ Contact form saves to database
✅ Newsletter subscription
✅ Blog posts load from database
✅ Portfolio projects load from database
✅ Toast notifications for feedback
✅ Email notifications (if Resend API key added)
✅ Fallback to hardcoded data if needed

---

## 🔧 Troubleshooting

### "Cannot prompt for input in non-interactive terminals"
**Solution:** Use Command Prompt instead of PowerShell:
```bash
cmd /c npm exec convex dev
```

### "NEXT_PUBLIC_CONVEX_URL is not set"
**Solution:**
1. Check `.env.local` has the variable
2. Restart dev server: `Ctrl+C` and `npm run dev`

### Forms not saving
**Checklist:**
- [ ] Is `npm exec convex dev` running in another terminal?
- [ ] Is NEXT_PUBLIC_CONVEX_URL correct?
- [ ] Check browser console for errors (F12)
- [ ] Check Convex dashboard Logs tab

### No data appears after seeding
**Solution:**
1. Make sure Convex dev is running
2. Go to Convex dashboard
3. Find "seed:seedAll" in Functions
4. Click "Run"
5. Refresh your browser

### Emails not sending
**Checklist:**
- [ ] Is RESEND_API_KEY in .env.local?
- [ ] Does it start with `re_`?
- [ ] Is FROM_EMAIL set?
- [ ] Check Convex Logs for email action errors

---

## 📖 Full Documentation

For detailed setup instructions, see: **`CONVEX_SETUP_GUIDE.md`**

For implementation overview, see: **`IMPLEMENTATION_SUMMARY.md`**

---

## 🎯 File Structure

```
media4u/
├── convex/                    ← Backend code
│   ├── schema.ts
│   ├── contactSubmissions.ts
│   ├── newsletter.ts
│   ├── blog.ts
│   ├── portfolio.ts
│   ├── emails.ts
│   └── seed.ts
├── src/
│   ├── components/
│   │   ├── ConvexClientProvider.tsx    ← Convex setup
│   │   ├── layout/
│   │   │   └── footer.tsx              ← Social links
│   │   │   └── whatsapp-button.tsx     ← WhatsApp integration
│   │   └── ui/
│   │       ├── toast-provider.tsx      ← Toast notifications
│   │       └── skeleton.tsx            ← Loading states
│   └── app/
│       ├── layout.tsx                  ← Root layout (updated)
│       ├── contact/
│       │   └── contact-form.tsx        ← Convex integration
│       ├── blog/
│       │   └── page.tsx                ← Fetches from Convex
│       └── portfolio/
│           └── page.tsx                ← Fetches from Convex
├── .env.local                          ← Config (create this)
└── CONVEX_SETUP_GUIDE.md              ← Detailed setup
```

---

## ✨ Next Steps

After testing, consider implementing:

1. **Admin Dashboard** - Manage content (blog, portfolio)
2. **Blog Post Pages** - Individual `/blog/[slug]` routes
3. **Portfolio Pages** - Individual `/portfolio/[slug]` routes
4. **Analytics** - Track visitors and popular content
5. **Search** - Find blog posts by title/content

---

## 🆘 Need Help?

- **Convex Docs**: https://docs.convex.dev
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Sonner Toast**: https://sonner.emilkowal.ski

---

## 🎊 You're All Set!

Your backend is configured and ready to go. Start with step 1 and work through each step. Should take about 10 minutes total.

Happy building! 🚀
