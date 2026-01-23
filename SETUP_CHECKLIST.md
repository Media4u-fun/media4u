# Media4U Setup Checklist

Use this checklist to track your setup progress.

---

## ✅ Backend Infrastructure (Completed by Developer)

- [x] Install Convex and dependencies
- [x] Create Convex schema (contactSubmissions, newsletter, blogPosts, portfolioProjects)
- [x] Create all mutations and queries
- [x] Set up Resend email integration
- [x] Create seed data with 5 blog posts and 6 portfolio projects
- [x] Update root layout with ConvexProvider
- [x] Add toast notification system (Sonner)
- [x] Create skeleton loading components

---

## 👤 Your Setup Tasks (Do These)

### 1. Convex Account & Deployment
- [ ] Create free Convex account at https://www.convex.dev
- [ ] Create new project called "media4u"
- [ ] Copy deployment URL from project settings
- [ ] Copy deployment name (format: `dev:project-name`)

### 2. Resend Account (Optional but Recommended)
- [ ] Create free Resend account at https://resend.com
- [ ] Generate API key
- [ ] Verify a sender email address (e.g., hello@media4u.fun)
- [ ] Copy API key (starts with `re_`)

### 3. Environment Variables
- [ ] Open `.env.local` in project root
- [ ] Fill in `NEXT_PUBLIC_CONVEX_URL` (from step 1)
- [ ] Fill in `CONVEX_DEPLOYMENT` (from step 1)
- [ ] Fill in `RESEND_API_KEY` (from step 2)
- [ ] Fill in `FROM_EMAIL` (from step 2)
- [ ] Update social media URLs (Twitter, Instagram, LinkedIn)
- [ ] Update WhatsApp number

### 4. Connect Convex Locally
- [ ] Open terminal in project root
- [ ] Run: `npm exec convex dev`
- [ ] Log in when prompted (use same account as Convex dashboard)
- [ ] Wait for message: "Dev server running"
- [ ] **Keep this terminal open** while working

### 5. Seed Database
- [ ] Open another terminal (keep first one running)
- [ ] Run: `npm run seed`
- [ ] Wait for "Successfully ran seed:seedAll"
- [ ] You should now have:
  - 5 blog posts in database
  - 6 portfolio projects in database

### 6. Start Dev Server
- [ ] Open third terminal (keep first two running)
- [ ] Run: `npm run dev`
- [ ] Visit: http://localhost:3000

---

## 🧪 Testing Checklist

### Contact Form Testing
- [ ] Navigate to http://localhost:3000/contact
- [ ] Fill out contact form with valid data
- [ ] Click "Send Message"
- [ ] See success message appear
- [ ] Go to Convex dashboard → Data → contactSubmissions
- [ ] Verify your form submission is there

### Newsletter Testing
- [ ] Navigate to http://localhost:3000/blog
- [ ] Scroll to "Stay in the Loop" section
- [ ] Enter your email
- [ ] Click "Subscribe"
- [ ] See success message
- [ ] Go to Convex dashboard → Data → newsletterSubscribers
- [ ] Verify your email is there
- [ ] Try subscribing again - should see "already subscribed" message

### Blog Posts Testing
- [ ] Blog page should load 5 posts from database
- [ ] Verify posts display correctly
- [ ] Check category, date, and read time
- [ ] Verify featured post styling
- [ ] Load More button should work

### Portfolio Projects Testing
- [ ] Navigate to http://localhost:3000/portfolio
- [ ] Should load 6 projects from database
- [ ] Click filter tabs (All, VR, Web, Multiverse)
- [ ] Verify filtering works correctly
- [ ] Check gradient backgrounds and text

### Email Notifications (if Resend configured)
- [ ] Submit contact form
- [ ] Check your inbox for:
  - [x] Email from admin (acknowledging your submission)
  - [x] Email from hello@media4u.fun (confirmation)
- [ ] Check spam folder if not in inbox

---

## ✨ Verification

### Check Convex Dashboard
- [ ] Go to https://dashboard.convex.dev
- [ ] Click your "media4u" project
- [ ] Click "Data" tab
- [ ] You should see 4 tables:
  - [ ] `blogPosts` (5 documents)
  - [ ] `portfolioProjects` (6 documents)
  - [ ] `contactSubmissions` (at least 1)
  - [ ] `newsletterSubscribers` (at least 1)

### Check Browser Console
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Should have **no errors** about Convex
- [ ] No warnings about missing environment variables

---

## 🚀 Final Steps

Once everything is working:

1. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Implement Convex backend integration"
   ```

2. **Deploy to Production (Recommended)**
   - Use Vercel (free, integrated with Next.js)
   - Connect your GitHub repo
   - Vercel will auto-deploy on push
   - Add environment variables in Vercel dashboard

3. **Configure Convex for Production**
   - Upgrade Convex project to production
   - Update environment variables with prod URL
   - Re-run seed if needed

---

## 📱 Troubleshooting

### Terminal Issues

**"Cannot prompt for input in non-interactive terminals"**
```bash
# Instead of: npm exec convex dev
# Use: cmd /c npm exec convex dev
```

**Convex dev won't start**
- Make sure you're logged in: `npm exec convex auth login`
- Check internet connection
- Try: `npm exec convex dev --once`

### Environment Variables

**"NEXT_PUBLIC_CONVEX_URL is not set"**
- Check `.env.local` has the variable
- Restart dev server (Ctrl+C, npm run dev)
- Make sure there are no typos

**Seed command not found**
- Make sure package.json has the seed script
- Try: `npx convex run seed:seedAll`

### Data Issues

**Forms not saving to database**
1. Is Convex dev server running?
2. Is NEXT_PUBLIC_CONVEX_URL correct?
3. Check browser console (F12) for errors
4. Check Convex dashboard Logs tab

**Database is empty after seeding**
1. Make sure Convex dev is running
2. Go to Convex dashboard
3. Click Functions tab
4. Find `seed:seedAll`
5. Click "Run"

**Emails not sending**
1. Is RESEND_API_KEY correct?
2. Is FROM_EMAIL verified in Resend?
3. Check Convex Logs for email action errors
4. Email might be in spam folder

---

## 📚 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm exec convex dev` | Start Convex development server |
| `npm run seed` | Populate database with sample data |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |

---

## 🎯 Success Criteria

✅ You're ready to use the system when:

1. Convex dev server is running
2. Contact form submits successfully
3. Newsletter signup works
4. Blog posts load from database
5. Portfolio projects load from database
6. Convex dashboard shows all data
7. (Optional) Emails are being sent

---

## 📖 Documentation

For more details, read:
- **QUICK_START.md** - Fast setup (5 minutes)
- **CONVEX_SETUP_GUIDE.md** - Detailed instructions
- **IMPLEMENTATION_SUMMARY.md** - Technical overview

---

## ❓ Questions?

- **Convex Docs**: https://docs.convex.dev
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create an issue in your repo

---

## ✅ All Done?

Once you've completed all steps:

1. Your Media4U backend is live
2. Forms are saving data
3. Newsletter is collecting emails
4. Blog/Portfolio content is in database
5. Ready to build admin dashboard next

**Congratulations! Your backend is production-ready. 🎉**

---

*Use this checklist to ensure nothing is missed. Check off items as you complete them.*
