# CLAUDE.md

## 👋 About Me (The Owner)

Hi Claude! I'm the owner of **Media4U**, and here's what you need to know about me:

- **I am NOT a coder.** I don't have a traditional software development background.
- **I'm "vibe coding"** - building this with AI assistants like you helping me every step of the way.
- **I don't understand most jargon.** If you say "transpile," "bundler," "SSR," or similar terms, explain them simply.
- **I learn by doing.** Show me, don't just tell me.
- **I need safety rails.** I want to build with confidence, knowing I won't accidentally break everything.

## 🎯 What I Want to Accomplish

My main goals are:

1. **Prevent breaking the project** when I make changes
2. **Catch errors BEFORE I commit** to GitHub
3. **Ensure builds succeed locally** before they hit GitHub Actions or Hostinger
4. **Build with confidence** even though I'm not a professional developer
5. **Learn incrementally** without getting overwhelmed

## 🛠️ Project Stack (Media4U)

This is what Media4U is built with:

- **Framework:** Next.js 15 (React-based web framework)
- **Language:** TypeScript (JavaScript with type checking)
- **Package Manager:** npm
- **Backend:** Convex (serverless backend)
- **Styling:** Tailwind CSS v4
- **Editor:** Tiptap (rich text editor)
- **Animations:** Motion (formerly Framer Motion)

**Key Files:**
- `package.json` - defines all dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `package-lock.json` - locks exact dependency versions

## 📋 How You Should Work With Me

### 1. Always Explain Simply

- Don't assume I know what "hydration," "middleware," or "SSG" means
- If you use a technical term, follow it with a one-sentence explanation in plain English
- Example: "I'll update the middleware (code that runs before each page loads) to..."

**CRITICAL WRITING RULE:**
- **NEVER use em dashes (—) anywhere in code, content, or documentation**
- Always use regular hyphens (-) instead
- This applies to all files: code, markdown, documentation, content, etc.
- Em dashes are forbidden - always use a regular hyphen with spaces around it

### 2. Give Me Copy/Paste Commands

- Every command should be ready to paste into my terminal
- Always use `npm` (not yarn or pnpm) since that's what this project uses
- Format commands in code blocks like this:

```bash
npm run dev
```

### 3. Inspect Before Assuming

Before making changes:
- Read the relevant files to understand current code
- Check `package.json` scripts to see what commands exist
- Look at the project structure to see where files belong
- **Never guess** - if you're unsure, read the file first

### 4. Keep It Simple - Avoid Over-Engineering

**CRITICAL: Stop and ask before adding complexity**

Before implementing any solution:
- **STOP if you sense we're over-complicating something**
- Ask yourself: "Is there a simpler, industry-standard way to do this?"
- If the solution requires multiple new files, database changes, or complex logic, **pause and ask me first**

**Examples of unnecessary complexity to avoid:**
- Adding approval workflows when simple role-based access is enough
- Creating custom solutions when built-in features exist
- Adding status fields when existing fields can handle the logic
- Building features "for the future" that aren't needed now

**What to do instead:**
1. Suggest the **simplest solution** that solves the immediate problem
2. If I ask for something complex, offer a **simpler alternative** with explanation
3. Use **industry-standard patterns** over custom implementations
4. Only add complexity when there's a clear, immediate need

**Example approach:**
- ❌ BAD: "I'll add a user approval system with status fields, email notifications, and an admin panel"
- ✅ GOOD: "For user management, role-based access (user/admin) is the industry standard and keeps it simple. Do you need anything beyond that?"

### 5. Propose Small, Safe Changes

- Make the smallest change that solves the problem
- Don't refactor unrelated code
- Don't add features I didn't ask for
- Don't "improve" code that's already working
- Focus on the specific task at hand

### 6. Always Run Checks Before Committing

Before you suggest I commit anything, **always** run lint:

```bash
npm run lint
```

**IMPORTANT:** Do NOT run `npm run build` unless I specifically ask for it - it breaks the dev server.

Only run build when:
- I explicitly request it
- We're preparing for deployment
- We're troubleshooting build issues

If lint fails, **stop and fix it** before committing.

### 7. Use This Commit Workflow

**Every time we're ready to commit:**

1. Show me what files changed:
```bash
git status
```

2. Run lint to check for code problems:
```bash
npm run lint
```

3. If lint passes, stage the files:
```bash
git add [specific-files]
```

4. Commit with a clear message:
```bash
git commit -m "feat: add contact form validation

- Add email format validation
- Add required field checks
- Show error messages to user

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

5. Remind me to test locally before pushing:
```bash
npm run dev
# Then open http://localhost:3000 and test the change
```

## 🚨 Safety Rules (Never Break These)

### Before Any Commit

✅ **Must pass:** `npm run lint`
✅ **Must test:** `npm run dev` (and manually check it works)

**Note:** Only run `npm run build` if specifically requested - it breaks the dev server.

### Never Commit These Files

- `.env` or `.env.local` (contains secrets)
- `node_modules/` (huge dependency folder)
- `.next/` (build output)
- Any file with API keys, passwords, or tokens

### Always Check .gitignore

Before committing new files, verify they're not in `.gitignore`:

```bash
git check-ignore -v [filename]
```

If it's ignored, don't force-add it.

## 🔧 Common Commands You'll Use

### Development
```bash
# Start local dev server
npm run dev

# Open browser to http://localhost:3000
```

### Killing Dev Servers
**ALWAYS use this script to kill dev servers** - it's the most consistent method:

```bash
# Kill all Node processes and clear port 3000
powershell -ExecutionPolicy Bypass -File kill-all-processes.ps1

# Then restart dev server
npm run dev
```

**Important:** Never use `taskkill`, `Ctrl+C`, or manual process killing. Always use the `kill-all-processes.ps1` script. It:
- Kills all Node.js and npm processes
- Clears port 3000
- Cleans npm cache
- Ensures a clean restart every time

### Quality Checks
```bash
# Check for code problems
npm run lint

# Build the production version
npm run build

# Run the production build locally
npm run start
```

### Convex (Backend)
```bash
# Seed database with sample data
npm run seed
```

### Git Operations
```bash
# See what changed
git status

# See detailed changes
git diff

# Create a new branch
git checkout -b feature/your-feature-name

# Stage specific files
git add src/app/page.tsx

# Commit with message
git commit -m "fix: correct header alignment"

# Push to GitHub
git push
```

## ⚠️ Common Mistakes to Prevent

### Mistake 1: Changing Files Without Testing Lint

**Prevention:**
After file changes, run `npm run lint` before committing. Only run `npm run build` if specifically requested.

### Mistake 2: Breaking Imports

**Prevention:**
If you rename or move a file, search the codebase for all imports of that file:

```bash
# Search for imports (Windows)
findstr /s /i "import.*OldFileName" *.tsx *.ts
```

### Mistake 3: Committing Secrets

**Prevention:**
Never put API keys, passwords, or secrets in code. Use environment variables in `.env.local` (which is gitignored).

Check before committing:
```bash
git diff | findstr /i "api.key password secret token"
```

### Mistake 4: Pushing Broken Code to Main

**Prevention:**
Work on feature branches:

```bash
git checkout -b feature/new-thing
# Make changes, test, commit
git push origin feature/new-thing
# Create PR on GitHub, review, then merge
```

## 🎯 Definition of Done

A change is **not ready** to commit until:

- ✅ `npm run lint` passes with no errors
- ✅ `npm run dev` works and I've tested the feature manually
- ✅ No `.env` files or secrets in the commit
- ✅ All TypeScript errors resolved
- ✅ Only the files related to this change are included

**Note:** `npm run build` is only required when specifically requested or preparing for deployment.

## 🆘 Emergency Rollback

**If I committed something broken:**

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```
This removes the commit but keeps my file changes so I can fix them.

### Undo Last Commit (Delete Changes) ⚠️
```bash
git reset --hard HEAD~1
```
**WARNING:** This deletes everything in the last commit.

### Already Pushed? Use Revert Instead
```bash
# See recent commits
git log --oneline

# Revert a specific commit (creates new commit that undoes it)
git revert [commit-hash]

# Push the revert
git push
```

**Safest option:** `git revert` if you've already pushed.

## 🌐 Deployment Checklist

Before deploying Media4U to production:

### 1. Environment Variables
- ✅ All `.env.local` variables copied to Convex dashboard
- ✅ All `.env.local` variables copied to hosting platform (Hostinger/Vercel)
- ✅ `CONVEX_URL` is set correctly
- ✅ No secrets in the codebase

### 2. Build Verification
```bash
# Build the production version
npm run build

# Check build output exists
dir .next

# Run production build locally to test
npm run start
# Open http://localhost:3000 and test
```

### 3. Smoke Test After Deploy
1. Open the live website
2. Test main navigation (Home, About, Contact, etc.)
3. Test any forms (sign up, contact, etc.)
4. Check browser console (F12) for errors
5. Test on mobile (resize browser or use phone)

**If anything breaks:** Rollback the deployment immediately.

## 💡 Working With Claude (You!)

### Ask Questions Proactively
If something is unclear, ask me directly:
- "Should I update the footer on all pages or just the homepage?"
- "Do you want me to add validation to this form?"

### Show, Don't Tell
Instead of: "You should update the config file"
Do this: "I'll update `next.config.js` by changing..."

### Warn Me About Risks
If a change could break something:
- Tell me what could go wrong
- Suggest testing steps
- Offer a safer alternative

### Celebrate Small Wins
When something works, acknowledge it! Building with AI is a journey.

---

**Last Updated:** 2026-01-25
**Claude Model:** Sonnet 4.5
