# Vercel Deployment Guide for GAMIFY Frontend

## Issues Fixed

The following issues were preventing successful Vercel deployment:

1. **Missing vercel.json** - Vercel didn't know to build from the `frontend/` directory
2. **No Node version specification** - Vercel needs `.nvmrc` to use the correct Node version
3. **Build configuration** - Vercel needed explicit build command and output directory
4. **Environment variables** - VITE_API_URL needs to be set in Vercel dashboard

## Files Created

- `vercel.json` - Configures Vercel to build from frontend directory using the `root` property
- `.nvmrc` - Specifies Node.js version 22 (LTS)
- `frontend/.npmrc` - Configures npm with timeout and retry settings for reliable Vercel builds

## Environment Variables Required

Add these in your Vercel project dashboard (Settings > Environment Variables):

### Required for Production
```
VITE_API_URL=https://api.yourdomain.com
```

**Important:** Replace `https://api.yourdomain.com` with your actual deployed backend URL.

### Optional
```
VITE_APP_NAME=GAMIFY
VITE_APP_VERSION=1.0.0
```

## Deployment Steps

### 1. Push Changes to Git
```bash
git add vercel.json .nvmrc frontend/.npmrc VERCEL_DEPLOYMENT.md
git commit -m "Add Vercel deployment configuration"
git push
```

### 2. Configure Vercel Project

If you haven't already:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically detect the `vercel.json` configuration

### 3. Set Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the required environment variables (see above)
4. Make sure to add them for **Production**, **Preview**, and **Development** environments

### 4. Redeploy

After setting environment variables:
1. Go to the **Deployments** tab
2. Click the three dots on the latest deployment
3. Select **Redeploy**

## Build Configuration Details

The `vercel.json` file configures:

- **Root Directory**: `frontend` - Tells Vercel to build from the frontend subdirectory
- **Build Command**: `npm run build` - Runs Vite build (executed from frontend directory)
- **Output Directory**: `dist` - Relative to the root directory (i.e., `frontend/dist`)
- **Install Command**: `npm install` - Installs dependencies (executed from frontend directory)
- **Framework**: Vite
- **Rewrites**: 
  - All routes serve `index.html` (for client-side routing with React Router)

## API Configuration

API requests are handled client-side using the `VITE_API_URL` environment variable. The frontend code in `src/lib/api.js` automatically uses:

- `/api` (relative path) in development (proxied by Vite dev server)
- `VITE_API_URL/api` in production (set via environment variable)

No server-side rewrite rules are needed for API requests.

## Troubleshooting

### npm Install Fails During Deployment

If you see errors during the `npm install` phase:

- **Node version mismatch**: The `.nvmrc` file now specifies Node 22 LTS. Ensure Vercel is using this version.
- **Lockfile conflicts**: If you've recently updated dependencies, regenerate the lockfile:
  ```bash
  cd frontend
  rm package-lock.json
  npm install
  git add package-lock.json
  git commit -m "Regenerate package-lock.json"
  ```
- **Network timeouts**: The `.npmrc` file includes timeout and retry settings to handle slow npm downloads. If issues persist, increase the values in `frontend/.npmrc`.
- **Registry issues**: Ensure you're using the public npm registry (the `.npmrc` file doesn't override the default registry)

### Build Fails with "Cannot find module"
- Ensure `installCommand` is correct in `vercel.json`
- Check that all dependencies are in `frontend/package.json`

### API Requests Fail in Production
- Verify `VITE_API_URL` is set in Vercel environment variables
- Ensure the backend URL is correct and accessible
- Check that your backend allows CORS from your Vercel domain

### Blank Page After Deployment
- Ensure the rewrite rule for `/(.*)` → `/index.html` is present
- Check that client-side routing is working (React Router)
- Verify the build output directory is correct

### Environment Variables Not Working
- Remember that only variables prefixed with `VITE_` are available in the client
- Restart the deployment after adding environment variables
- Check that variable names match exactly (case-sensitive)

## Local Build Verification

To verify the build works locally:
```bash
cd frontend
npm install
npm run build
```

The build should complete successfully and create a `frontend/dist` directory.

## Additional Notes

- The build currently produces a warning about chunk sizes (>500 kB). This is not a blocker but can be optimized later using code splitting.
- The project uses React Router for client-side routing, which requires the SPA fallback rewrite rule.
- Environment variables with `VITE_` prefix are bundled into the client JavaScript - never put secrets in them.
