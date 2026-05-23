# Vercel Deployment Guide for GAMIFY Frontend

## Issues Fixed

The following issues were preventing successful Vercel deployment:

1. **Missing Vercel project settings** - Vercel didn't know to build from the `frontend/` directory
2. **No Node version specification** - Vercel needs `.nvmrc` to use the correct Node version
3. **Build configuration** - Vercel needed explicit build command and output directory configured in project settings
4. **Environment variables** - VITE_API_URL needs to be set in Vercel dashboard

## Files Created

- `vercel.json` - Contains only rewrite rules for client-side routing
- `.nvmrc` - Specifies Node.js version 22 (LTS)
- `frontend/.npmrc` - Configures npm with timeout and retry settings for reliable Vercel builds
- `frontend/.env.production` - Provides fallback for VITE_API_URL during build
- `frontend/src/lib/api.js` - Fixed refresh token endpoint to use configured BASE_URL

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
git add vercel.json .nvmrc frontend/.npmrc frontend/.env.production VERCEL_DEPLOYMENT.md frontend/src/lib/api.js
git commit -m "Fix Vercel build configuration and API endpoint"
git push
```

### 2. Configure Vercel Project Settings

If you haven't already:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **Important**: Configure the following in your Vercel project settings:

   **Go to Settings > General > Build & Development Settings:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

   These settings override any vercel.json configuration and are more reliable for monorepo deployments.

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

### Vercel Project Settings (Required)
Configure these in **Settings > General > Build & Development Settings**:

- **Root Directory**: `frontend` - Tells Vercel to build from the frontend subdirectory
- **Build Command**: `npm run build` - Runs Vite build (executed from frontend directory)
- **Output Directory**: `dist` - Relative to the root directory (i.e., `frontend/dist`)
- **Install Command**: `npm install` - Installs dependencies (executed from frontend directory)

### vercel.json (Optional)
The `vercel.json` file only contains:

- **Rewrites**: 
  - All routes serve `index.html` (for client-side routing with React Router)

**Note**: Vercel project settings override vercel.json configuration. Using project settings is more reliable for monorepo deployments.

## API Configuration

API requests are handled client-side using the `VITE_API_URL` environment variable. The frontend code in `src/lib/api.js` automatically uses:

- `/api` (relative path) in development (proxied by Vite dev server)
- `VITE_API_URL/api` in production (set via environment variable)

**Important**: The refresh token endpoint has been fixed to use the configured BASE_URL instead of a hardcoded path, ensuring it works correctly in production.

No server-side rewrite rules are needed for API requests.

## Troubleshooting

### npm Install Fails During Deployment

If you see errors during the `npm install` phase:

- **"cd frontend && npm install" error**: This indicates Vercel is using old configuration. Fix by:
  1. Go to **Settings > General > Build & Development Settings**
  2. Set **Root Directory** to `frontend`
  3. Set **Install Command** to `npm install` (no `cd frontend &&`)
  4. Save changes and redeploy

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
- Ensure **Install Command** is set to `npm install` in Vercel project settings
- Check that all dependencies are in `frontend/package.json`
- Verify **Root Directory** is set to `frontend` in Vercel project settings

### Build Fails During `npm run build`

If the build fails during the build phase:

- **Missing environment variables**: The `.env.production` file provides a fallback for `VITE_API_URL`. Ensure it's committed to git.
- **Node version mismatch**: Verify `.nvmrc` specifies Node 22 and Vercel is using this version
- **Build output directory mismatch**: Ensure **Output Directory** is set to `dist` in Vercel project settings
- **Memory issues**: Vercel builds have memory limits. If you see "out of memory" errors, try:
  - Reducing chunk size by adding code splitting
  - Increasing Vercel plan memory limits
- **Vite configuration issues**: Check `vite.config.js` for any environment-specific settings that might fail in production

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
