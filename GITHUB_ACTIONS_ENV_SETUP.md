# GitHub Actions Environment Variables Setup

## Required Environment Variables for GitHub Pages Deployment

To deploy this application to GitHub Pages, you **must** add the following environment variables as **GitHub Repository Secrets**.

## Step-by-Step Instructions

### 1. Get Your Supabase Credentials

First, obtain your Supabase credentials:

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project (or create a new one if you haven't already)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (the long JWT token)

### 2. Add Secrets to GitHub Repository

Now add these credentials as GitHub repository secrets:

1. Go to your GitHub repository (e.g., `https://github.com/USERNAME/REPOSITORY`)
2. Click on **Settings** (repository settings, not your profile)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click the **New repository secret** button
5. Add the following two secrets:

#### Secret 1: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
```
(Replace with your actual Supabase Project URL)

#### Secret 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Replace with your actual Supabase anon/public key)

### 3. Verify Setup

After adding both secrets, your repository secrets page should show:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Enable GitHub Pages

1. In repository **Settings**, scroll down to **Pages** section
2. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
3. Save the settings

### 5. Deploy

Push to the main branch or manually trigger the workflow:

```bash
git push origin main
```

Or manually trigger from GitHub:
1. Go to **Actions** tab
2. Click "Deploy Next.js site to Pages" workflow
3. Click "Run workflow" button

### 6. Monitor Deployment

1. Go to the **Actions** tab in your repository
2. Click on the latest workflow run
3. Monitor the build process
4. Once complete, your site will be live at:
   ```
   https://USERNAME.github.io/REPOSITORY/
   ```
   (Replace USERNAME with your GitHub username and REPOSITORY with your repo name)

## How It Works

The GitHub Actions workflow (`.github/workflows/nextjs.yml`) includes this configuration:

```yaml
- name: Build with Next.js
  run: npx --no-install next build
  env:
    # These environment variables are injected during build
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

During the build process:
1. The secrets are securely injected as environment variables
2. Next.js embeds these values in the static JavaScript bundles
3. The browser can then connect directly to Supabase

## Security Notes

### Is it safe to expose these keys?

**Yes!** The Supabase anon/public key is designed to be exposed in client-side code:

- ✅ This is the **intended use** of the anon key
- ✅ Your data is protected by **Row Level Security (RLS)** policies in Supabase
- ✅ This is the standard pattern for all JAMstack/serverless applications
- ✅ The key only allows operations permitted by your RLS policies

### What about the admin password?

🚨 **CRITICAL SECURITY WARNING**: The current implementation uses a hardcoded admin password (`admin123`). This is **NOT SAFE for production use**.

**Before deploying to production, you MUST:**
1. Implement Supabase Authentication (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
2. Use proper user roles and permissions with Row Level Security
3. Remove all hardcoded passwords from the codebase
4. Never expose admin credentials in client-side code

**The current setup is only suitable for:**
- Development and testing
- Internal demos
- Proof-of-concept deployments

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions on implementing proper authentication.

## Troubleshooting

### Build fails with "Supabase is not configured"

**Problem**: The environment variables are not set or are incorrect.

**Solution**: 
1. Verify both secrets are added in Settings → Secrets and variables → Actions
2. Check that secret names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Verify the values are correct (copy-paste from Supabase dashboard)
4. Re-run the workflow

### Site loads but shows "No queue data" or errors

**Problem**: Environment variables are set but Supabase is not properly configured.

**Solution**:
1. Verify your Supabase project is active
2. Check that the database schema is created (see SUPABASE_SETUP.md)
3. Verify Row Level Security policies are configured
4. Check browser console for specific error messages

### Workflow doesn't run

**Problem**: GitHub Actions workflow is not triggered.

**Solution**:
1. Ensure GitHub Pages source is set to "GitHub Actions" (not "Deploy from branch")
2. Check that `.github/workflows/nextjs.yml` exists in your repository
3. Manually trigger the workflow from Actions tab

## Summary

**Required Environment Variables:**
1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Where to Add Them:**
- Repository Settings → Secrets and variables → Actions → New repository secret

**What Happens:**
- These secrets are injected during the Next.js build process
- The built static site can connect to Supabase from the browser
- GitHub Pages serves the static files

**Need Help?**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) - Step-by-step GitHub Pages setup
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Database setup instructions
