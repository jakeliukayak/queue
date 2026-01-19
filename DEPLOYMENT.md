# Deployment Guide

This guide walks you through deploying the Queue System with GitHub Pages (frontend) and Supabase (backend).

## Prerequisites

- Supabase account and project set up (see SUPABASE_SETUP.md)
- GitHub repository with the code

## Architecture

```
┌─────────────────────┐
│   GitHub Pages      │
│  (Static Frontend)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Supabase        │
│   PostgreSQL        │
│  (Backend + DB)     │
│  Real-time Updates  │
└─────────────────────┘
```

- **Frontend**: Hosted on GitHub Pages as static HTML/CSS/JS
- **Backend**: Supabase handles all database operations and real-time subscriptions

## Deployment Steps

### 1. Set Up Supabase Backend

Follow the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) guide to:
- Create a Supabase project
- Set up the database schema
- Configure environment variables

### 2. Deploy to GitHub Pages

GitHub Pages provides free static hosting for your frontend:

1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"

2. **Configure Repository Secrets**
   
   The GitHub Actions workflow needs your Supabase credentials. Add them as repository secrets:
   
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret" and add:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: https://your-project.supabase.co
     
     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
     Value: your-anon-key
     ```

3. **Deploy**
   - Push your code to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Check the "Actions" tab to monitor deployment progress
   - Once complete, your app will be live at:
     - `https://[username].github.io/[repository]/`
     - Or your custom domain if configured

4. **Verify Deployment**
   - Visit your GitHub Pages URL
   - Test ticket creation
   - Test admin dashboard
   - Verify real-time updates work

## Custom Domain

To use a custom domain with GitHub Pages:

1. **Add Custom Domain**
   - Go to repository Settings → Pages
   - Under "Custom domain", enter your domain (e.g., `queue.yourdomain.com`)
   - Click "Save"

2. **Configure DNS**
   - Add a CNAME record pointing to `[username].github.io`
   - Or add A records for GitHub Pages IPs (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))

3. **Enable HTTPS**
   - GitHub automatically provisions SSL certificate
   - Check "Enforce HTTPS" once certificate is ready

## Important Notes

### Real-time Features

The application uses Supabase real-time subscriptions to automatically update the admin dashboard. This works out of the box with no additional configuration.

### Environment Variables

**Never commit `.env.local` to version control!** Always use GitHub repository secrets for environment variables:

- **GitHub Pages**: Repository Settings → Secrets and variables → Actions

### Database Setup

Before deploying, ensure you've:
1. Created the Supabase database schema (see SUPABASE_SETUP.md)
2. Configured Row Level Security policies
3. Tested the connection locally

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Verify environment variables are set correctly
- Check build logs in your deployment platform
- Clear cache and rebuild

### Database Connection Issues
- Verify Supabase URL and anon key are correct
- Check that database schema is created
- Review Supabase logs for errors
- Ensure RLS policies allow the required operations

### Real-time Not Working
- Verify real-time is enabled in Supabase for the tickets table
- Check browser console for WebSocket errors
- Ensure client has proper permissions

## Local Testing

To test the production build locally:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

Then open http://localhost:3000

## Continuous Deployment

GitHub Pages supports automatic deployments:

- **Push to main branch** → Automatic production deployment
- **Pull requests** → Preview deployments (if configured)

The included `.github/workflows/deploy.yml` handles:
- Installing dependencies
- Building the static site
- Deploying to GitHub Pages

## Monitoring and Analytics

### Supabase Dashboard
- Monitor database usage
- View real-time connections
- Check API logs and errors

### Vercel/Netlify Analytics
- Track page views and performance
- Monitor build times
- View deployment history

## Updating the Deployment

Simply push changes to your repository:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your hosting platform will automatically rebuild and redeploy.
