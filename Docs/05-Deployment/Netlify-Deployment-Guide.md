# Netlify Deployment Guide for BrowserGPT
**Complete deployment walkthrough for Netlify**

**Version:** 1.0
**Last Updated:** 2025-10-22
**Author:** Dr. Ernesto Lee

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Methods](#deployment-methods)
4. [Configuration](#configuration)
5. [Build Settings](#build-settings)
6. [Environment Variables](#environment-variables)
7. [Custom Domain](#custom-domain)
8. [Optimization](#optimization)
9. [Troubleshooting](#troubleshooting)

---

## Overview

BrowserGPT is optimized for deployment on Netlify with:
- ✅ **WASM Support**: SharedArrayBuffer headers configured
- ✅ **SPA Routing**: Client-side routing with _redirects
- ✅ **Build Optimization**: Vite production builds
- ✅ **Asset Caching**: Optimized cache headers for static assets
- ✅ **Zero Config**: Deploy with `netlify.toml`

---

## Prerequisites

### Required
- GitHub/GitLab account with repository access
- Netlify account (free tier works)
- Node.js 18+ installed locally for testing

### Recommended
- Custom domain (optional)
- CloudFlare R2 models already uploaded
- Git CLI installed

---

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

**Step 1: Push to GitHub**
```bash
cd BrowserGPT

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - BrowserGPT by Dr. Ernesto Lee"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/BrowserGPT.git
git branch -M main
git push -u origin main
```

**Step 2: Connect to Netlify**
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select **BrowserGPT** repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click **"Deploy site"**

**Step 3: Wait for Build**
- Build time: ~2-3 minutes
- Netlify will assign a random subdomain: `random-name-123.netlify.app`
- Site will be live immediately after build completes

---

### Method 2: Netlify CLI

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login to Netlify**
```bash
netlify login
```

**Step 3: Initialize and Deploy**
```bash
cd BrowserGPT

# Initialize Netlify site
netlify init

# Build locally
npm run build

# Deploy to production
netlify deploy --prod
```

---

### Method 3: Drag & Drop

**Step 1: Build Locally**
```bash
npm run build
```

**Step 2: Deploy**
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `dist` folder to the drop zone
3. Site will be deployed in seconds

⚠️ **Note**: This method doesn't support continuous deployment.

---

## Configuration

### netlify.toml

Our `netlify.toml` is pre-configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"

  [build.environment]
    NODE_VERSION = "18"

# WASM headers (Critical!)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Why These Headers Matter**:
- `COEP` and `COOP` enable **SharedArrayBuffer** for WASM threading
- Without these, models **will not load**
- Required for WebGPU acceleration

---

## Build Settings

If not using `netlify.toml`, configure manually:

### Build Command
```
npm run build
```

### Publish Directory
```
dist
```

### Node Version
```
18
```

### Environment Variables
None required (models load from CloudFlare R2)

---

## Environment Variables

BrowserGPT doesn't require environment variables by default, but you can add:

### Optional Variables

**1. Analytics Tracking ID**
```
VITE_ANALYTICS_ID=your-analytics-id
```

**2. Custom R2 Base URL**
```
VITE_R2_BASE_URL=https://pub-YOUR-ID.r2.dev
```

**3. Feature Flags**
```
VITE_ENABLE_WEBLLM=true
VITE_ENABLE_VOICE=false
```

**How to Add**:
1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Enter key and value
4. Click **Save**
5. Trigger a new deploy

---

## Custom Domain

### Adding a Custom Domain

**Step 1: Add Domain in Netlify**
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `browsergpt.com`)
4. Click **Verify**

**Step 2: Configure DNS**

**Option A: Use Netlify DNS (Recommended)**
- Netlify provides nameservers
- Update your domain registrar with Netlify nameservers
- SSL certificate auto-provisioned

**Option B: External DNS**
- Add `A` record pointing to Netlify's load balancer IP
- Add `CNAME` record for `www` subdomain
- Netlify will provision SSL certificate

**Step 3: Enable HTTPS**
- Netlify auto-enables HTTPS
- Free SSL certificate via Let's Encrypt
- Auto-renewal every 90 days

---

## Optimization

### Build Optimizations

**1. Code Splitting**
Already configured in `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        transformers: ['@xenova/transformers'],
      },
    },
  },
}
```

**2. Asset Optimization**
- Images: Use WebP format
- Fonts: Subset to used glyphs only
- Icons: Use SVG sprites

**3. Preload Critical Assets**
Add to `index.html`:
```html
<link rel="preload" href="/assets/critical.css" as="style">
<link rel="preload" href="/assets/app.js" as="script">
```

### Performance Monitoring

**Add Lighthouse CI**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: 'https://YOUR-SITE.netlify.app'
```

---

## Troubleshooting

### Models Won't Load

**Issue**: Models fail to download or initialize

**Solution**:
1. Check browser console for CORS errors
2. Verify COEP/COOP headers are set:
   ```bash
   curl -I https://your-site.netlify.app
   ```
3. Clear browser cache and reload
4. Verify CloudFlare R2 URLs are accessible

---

### Build Fails

**Issue**: `npm run build` fails on Netlify

**Solutions**:

**1. Check Node Version**
```toml
[build.environment]
  NODE_VERSION = "18"
```

**2. Clear Cache and Retry**
- Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

**3. Check Dependencies**
```bash
# Locally test build
npm ci
npm run build
```

---

### WASM Not Working

**Issue**: `SharedArrayBuffer is not defined`

**Solution**:
1. Verify headers in `netlify.toml`:
   ```toml
   Cross-Origin-Embedder-Policy = "require-corp"
   Cross-Origin-Opener-Policy = "same-origin"
   ```
2. Check headers in browser DevTools → Network tab
3. Ensure Vite config also sets headers

---

### Slow Performance

**Issue**: Site loads slowly

**Solutions**:

**1. Enable Netlify CDN** (automatic)
- Assets served from edge locations
- Geographically distributed

**2. Optimize Images**
```bash
# Install image optimizer
npm install -D vite-plugin-imagemin
```

**3. Enable Compression**
Netlify auto-compresses, but verify:
- Brotli for modern browsers
- Gzip fallback

**4. Use Asset CDN**
Consider moving models to CloudFlare R2 CDN (already configured)

---

## Deployment Checklist

Before deploying to production:

- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify all environment variables are set
- [ ] Check CloudFlare R2 URLs are accessible
- [ ] Test WASM headers: `curl -I https://your-site.netlify.app`
- [ ] Run Lighthouse audit (Performance > 90)
- [ ] Test on mobile devices
- [ ] Verify all three GEMMA models load correctly
- [ ] Test WebLLM fallback (if enabled)
- [ ] Check browser console for errors
- [ ] Verify attribution to Dr. Ernesto Lee is visible

---

## Post-Deployment

### Monitoring

**1. Netlify Analytics** (Paid)
- Real user metrics
- Page views and unique visitors
- Geographic distribution

**2. Google Analytics** (Free)
- Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**3. Sentry Error Tracking** (Free tier available)
```bash
npm install @sentry/react
```

### Continuous Deployment

**Automatic Deploys**:
- Every push to `main` triggers deploy
- Preview deploys for pull requests
- Branch deploys for staging

**Deploy Contexts**:
```toml
[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build"
```

---

## Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [BrowserGPT GitHub Issues](https://github.com/YOUR_USERNAME/BrowserGPT/issues)

---

**Built with ❤️ by Dr. Ernesto Lee**
*Empowering privacy-focused AI, one browser at a time.*
