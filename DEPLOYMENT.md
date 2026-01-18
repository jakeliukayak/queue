# GitHub Pages Deployment Guide

This guide walks you through deploying the Queue System frontend to GitHub Pages.

## Prerequisites

- GitHub repository with the queue system code
- GitHub Actions enabled for your repository
- GitHub Pages configured in repository settings

## Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages on every push to the main branch.

### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Build and deployment", select "GitHub Actions" as the source

2. **Push to Main Branch**
   ```bash
   git push origin main
   ```

3. **Monitor Deployment**
   - Go to the "Actions" tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Once complete, your site will be live at: `https://[username].github.io/[repo-name]`

### Workflow File

The workflow is already configured in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Manual Deployment

If you prefer to deploy manually:

1. **Build the project locally**
   ```bash
   npm run build
   ```

2. **Install gh-pages package**
   ```bash
   npm install -D gh-pages
   ```

3. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d out"
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file**
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

2. **Configure DNS**
   - Add a CNAME record pointing to `[username].github.io`
   - Or add A records pointing to GitHub's IP addresses

3. **Enable HTTPS**
   - Go to repository Settings > Pages
   - Check "Enforce HTTPS"

## Important Notes

### Static Export Limitations

Since this uses `output: 'export'` for static hosting:

1. **No API Routes**: The current implementation uses client-side localStorage
   - For production, integrate with Firebase Functions (see FIREBASE_SETUP.md)
   
2. **No Server-Side Rendering**: All pages are pre-rendered at build time

3. **No Image Optimization**: Images are served unoptimized
   - Use `unoptimized: true` in next.config.js (already configured)

### Environment Variables

For production deployment with Firebase:

1. Create `.env.production` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   ```

2. Add GitHub Secrets:
   - Go to Settings > Secrets and variables > Actions
   - Add each environment variable as a secret
   - Update the workflow to use these secrets during build

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf .next node_modules && npm install`
- Review build logs in Actions tab

### 404 on Page Refresh
- Ensure `.nojekyll` file exists in public directory (already included)
- Check that GitHub Pages is set to use GitHub Actions as source

### Assets Not Loading
- Verify `basePath` is not set in next.config.js for root deployment
- For subdirectory deployment, add `basePath: '/repo-name'` to next.config.js

## Local Preview of Production Build

To preview the production build locally:

```bash
npm run build
npx serve out
```

Then open http://localhost:3000

## Updating the Deployment

Simply push changes to the main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy.
