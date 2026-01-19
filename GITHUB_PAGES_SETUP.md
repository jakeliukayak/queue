# GitHub Pages + Supabase Setup Guide

This guide explains how to deploy your Queue System with GitHub Pages (frontend) and Supabase (backend).

## Architecture Overview

```
┌─────────────────────┐
│   GitHub Pages      │  ← Free static hosting
│  (Your Frontend)    │  ← HTML, CSS, JavaScript
└──────────┬──────────┘
           │
           │ Direct HTTPS calls
           │ from browser
           ▼
┌─────────────────────┐
│     Supabase        │  ← Database + API
│   PostgreSQL DB     │  ← Real-time subscriptions
│   (Your Backend)    │  ← Row Level Security
└─────────────────────┘
```

## Why This Setup?

✅ **100% Free** (for public repos + Supabase free tier)
✅ **No servers to manage** - fully serverless
✅ **Real-time updates** - WebSocket subscriptions work perfectly
✅ **Scalable** - GitHub Pages handles static files, Supabase scales automatically
✅ **Fast** - Static files + CDN delivery
✅ **Simple** - Just push to deploy

## Step-by-Step Setup

### 1. Set Up Supabase (Backend)

Follow the detailed instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md):

1. Create a free Supabase account at https://supabase.com
2. Create a new project
3. Run the SQL schema to create the `tickets` table
4. Copy your project URL and anon key

### 2. Configure GitHub Repository

Add your Supabase credentials as GitHub repository secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project-id.supabase.co
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your-supabase-anon-key-here
   ```

### 3. Enable GitHub Pages

1. Go to your repository **Settings**
2. Scroll to **Pages** section
3. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
4. Save the settings

### 4. Deploy

Simply push to the `main` branch:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow will:
- Install dependencies
- Build the static site with your Supabase credentials
- Deploy to GitHub Pages

### 5. Access Your Site

Once deployment completes (check the **Actions** tab), your site will be live at:

```
https://[your-username].github.io/[repository-name]/
```

For example: `https://jakeliukayak.github.io/queue/`

## How It Works

### Static Site Generation

When you run `npm run build`, Next.js generates a static site in the `out/` directory:

- **HTML files**: Pre-rendered pages (index.html, admin.html, ticket.html)
- **JavaScript**: React code that runs in the browser
- **CSS**: Tailwind styles
- **No server**: Everything is static files

### Client-Side API Calls

All database operations happen directly from the browser to Supabase:

```typescript
// This runs in the browser
const ticket = await SupabaseQueueManager.addTicket(email);
```

The browser makes HTTPS requests to:
```
https://your-project.supabase.co/rest/v1/tickets
```

### Real-Time Subscriptions

WebSocket connections work perfectly from static sites:

```typescript
// Real-time updates via WebSocket
const unsubscribe = SupabaseQueueManager.subscribeToQueue((queue) => {
  setQueue(queue);
});
```

## Environment Variables

### During Build (GitHub Actions)

Supabase credentials are injected during the build process and embedded in the JavaScript bundles. This is **safe** because:

1. Only the **public** Supabase anon key is embedded (intended for client-side use)
2. Supabase Row Level Security (RLS) protects your data
3. This is the standard pattern for JAMstack applications

### Local Development

For local development, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run locally:
```bash
npm install
npm run dev
```

## Updating Your Site

Just push changes to the main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions automatically rebuilds and redeploys.

## Custom Domain

To use a custom domain like `queue.yourdomain.com`:

1. Go to repository **Settings** → **Pages**
2. Under **Custom domain**, enter: `queue.yourdomain.com`
3. Add a CNAME record in your DNS:
   ```
   CNAME  queue  your-username.github.io
   ```
4. Wait for DNS propagation (up to 24 hours)
5. GitHub will automatically provision an SSL certificate

## Troubleshooting

### Build Fails

Check the **Actions** tab for error details. Common issues:

- **Missing secrets**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- **Node version**: Workflow uses Node 20 (should work)
- **Dependencies**: Run `npm install` locally to verify

### Site Loads but No Data

- Verify Supabase credentials in browser console (check Network tab)
- Ensure database schema is created (see SUPABASE_SETUP.md)
- Check Supabase RLS policies allow public access (for demo)

### Real-Time Not Working

- Check browser console for WebSocket errors
- Verify Supabase project has real-time enabled
- Ensure network allows WebSocket connections

### 404 Errors

If you see 404s, your site might be at:
```
https://username.github.io/repository-name/
```
Not just:
```
https://username.github.io/
```

## Cost Breakdown

### GitHub Pages
- **Cost**: FREE for public repositories
- **Bandwidth**: Unlimited
- **Build minutes**: 2,000/month free (way more than needed)

### Supabase Free Tier
- **Database**: 500 MB
- **Bandwidth**: 5 GB/month
- **API requests**: Unlimited
- **Real-time connections**: 500 concurrent

### Total Monthly Cost
**$0** - Perfect for small to medium projects!

## Monitoring

### GitHub Actions
- Check build status: Repository → **Actions** tab
- View deployment logs
- Monitor build times

### Supabase Dashboard
- Monitor API requests
- View real-time connections
- Check database usage
- Review RLS policies

## Next Steps

1. ✅ Follow this guide to deploy
2. ✅ Test your live site
3. ⚠️ Change admin password (default: `admin123`)
4. 🔒 Implement Supabase Authentication (see SUPABASE_SETUP.md)
5. 🎨 Customize the design
6. 📊 Add analytics (Google Analytics, Plausible, etc.)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Admin Password**: The default password (`admin123`) is hardcoded. In production:
   - Implement Supabase Authentication
   - Use proper user roles
   - Never hardcode passwords

2. **Supabase Anon Key**: It's safe to expose this key because:
   - It's designed for client-side use
   - RLS policies protect your data
   - This is the standard Supabase pattern

3. **Row Level Security**: Update RLS policies for production:
   ```sql
   -- Example: Only authenticated users
   CREATE POLICY "authenticated_only" ON tickets
     FOR ALL TO authenticated USING (true);
   ```

## Support

- **Documentation**: See all `.md` files in this repo
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Static Export**: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **GitHub Pages**: https://docs.github.com/en/pages

## Summary

You now have a modern, scalable queue system with:
- ✅ Free hosting on GitHub Pages
- ✅ PostgreSQL database on Supabase
- ✅ Real-time updates via WebSocket
- ✅ Automatic deployments
- ✅ No servers to manage
- ✅ Production-ready architecture

Push your code and you're live! 🚀
