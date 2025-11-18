# Deployment Guide

This guide covers deploying SecretDraw to Railway for both staging and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Railway Setup](#initial-railway-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Environment Variables](#environment-variables)
7. [Custom Domains](#custom-domains)
8. [CI/CD Setup](#cicd-setup)
9. [Monitoring & Logs](#monitoring--logs)
10. [Rollback Procedures](#rollback-procedures)

## Prerequisites

- [Railway Account](https://railway.app) (free tier is sufficient for MVP)
- [GitHub Account](https://github.com) with repository created
- [Railway CLI](https://docs.railway.app/develop/cli) installed (optional but recommended)
- Project code pushed to GitHub

### Install Railway CLI

```bash
# macOS
brew install railway

# npm
npm i -g @railway/cli

# Verify installation
railway --version
```

### Login to Railway

```bash
railway login
```

This opens a browser window for authentication.

## Initial Railway Setup

### 1. Create New Project

**Via Web Dashboard:**
1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select your `secret-draw` repository
4. Railway will create a new project

**Via CLI:**
```bash
# From project root
cd /path/to/secret-draw
railway init
```

### 2. Link Local Project to Railway

```bash
# Link to Railway project
railway link

# Verify link
railway status
```

## Database Setup

### 1. Add PostgreSQL Service

**Via Web Dashboard:**
1. Open your Railway project
2. Click "+ New Service"
3. Select "Database" → "PostgreSQL"
4. Railway automatically provisions the database

**Via CLI:**
```bash
railway add --database postgres
```

### 2. Get Database Connection String

The `DATABASE_URL` is automatically added to your environment variables.

**View in dashboard:**
- Go to PostgreSQL service
- Click "Variables" tab
- Copy `DATABASE_URL`

**View via CLI:**
```bash
railway variables --service postgres
```

### 3. Run Migrations

You'll run migrations after backend deployment, but you can also run them locally against Railway database:

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="postgresql://..."

# Run migrations
cd backend
npx prisma migrate deploy
```

## Backend Deployment

### 1. Create Backend Service

**Via Web Dashboard:**
1. In your Railway project, click "+ New Service"
2. Select "GitHub Repo"
3. Choose your repository
4. Railway will auto-detect settings

**Via CLI:**
```bash
railway up --service backend
```

### 2. Configure Backend Service

**Set Root Directory:**
1. Go to Backend service settings
2. Under "Build", set "Root Directory" to `backend`
3. Set "Build Command" to `npm run build`
4. Set "Start Command" to `npm start`

**Or create `railway.json` in backend directory:**

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Set Backend Environment Variables

**Via Web Dashboard:**
1. Go to Backend service
2. Click "Variables" tab
3. Add variables (see [Environment Variables](#environment-variables) section)

**Via CLI:**
```bash
railway variables --service backend set DATABASE_URL=postgresql://...
railway variables --service backend set JWT_SECRET=$(openssl rand -base64 32)
railway variables --service backend set NODE_ENV=production
```

### 4. Deploy Backend

**Automatic Deployment:**
- Push to GitHub main branch
- Railway auto-deploys

**Manual Deployment:**
```bash
railway up --service backend
```

### 5. Verify Backend Deployment

**Check logs:**
```bash
railway logs --service backend
```

**Test health endpoint:**
```bash
curl https://your-backend.railway.app/health
```

## Frontend Deployment

### 1. Create Frontend Service

**Via Web Dashboard:**
1. Click "+ New Service"
2. Select "GitHub Repo"
3. Choose your repository

**Via CLI:**
```bash
railway up --service frontend
```

### 2. Configure Frontend Service

**Set Root Directory:**
1. Go to Frontend service settings
2. Under "Build", set "Root Directory" to `frontend`
3. Set "Build Command" to `npm run build`
4. Set "Start Command" to `npm run preview` (or use static file server)

**Or create `railway.json` in frontend directory:**

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 3. Set Frontend Environment Variables

**Via Web Dashboard:**
1. Go to Frontend service
2. Click "Variables" tab
3. Add `VITE_API_URL` with your backend Railway URL

**Via CLI:**
```bash
railway variables --service frontend set VITE_API_URL=https://your-backend.railway.app
```

### 4. Deploy Frontend

**Automatic:**
- Push to GitHub triggers deployment

**Manual:**
```bash
railway up --service frontend
```

### 5. Verify Frontend Deployment

**Check deployment:**
```bash
railway logs --service frontend
```

**Visit URL:**
- Railway provides a URL: `https://your-frontend.railway.app`

## Environment Variables

### Backend Environment Variables

```bash
# Database (auto-provided by Railway)
DATABASE_URL=postgresql://user:pass@host:port/db

# Server
PORT=3001
NODE_ENV=production

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-key
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.railway.app

# Email Service (use your SMTP provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@secretdraw.com

# Optional: Sentry for error tracking
SENTRY_DSN=https://...
```

### Frontend Environment Variables

```bash
# API URL (Railway backend URL)
VITE_API_URL=https://your-backend.railway.app

# Optional: Analytics
VITE_GA_ID=G-XXXXXXXXXX
```

### Managing Secrets

**Never commit secrets to Git!**

**Generate secure secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# Random password
openssl rand -base64 24
```

**Set via CLI:**
```bash
railway variables --service backend set JWT_SECRET=$(openssl rand -base64 32)
```

## Custom Domains

### 1. Add Custom Domain to Frontend

**Via Web Dashboard:**
1. Go to Frontend service
2. Click "Settings"
3. Scroll to "Domains"
4. Click "Custom Domain"
5. Enter your domain: `secretdraw.com`
6. Railway provides DNS records

**Via CLI:**
```bash
railway domain --service frontend
```

### 2. Configure DNS

Add the following records to your DNS provider:

**Option 1: CNAME (recommended)**
```
Type: CNAME
Name: @
Value: your-frontend.railway.app
```

**Option 2: A Record**
```
Type: A
Name: @
Value: [IP provided by Railway]
```

### 3. Add Custom Domain to Backend

1. Go to Backend service
2. Add custom domain: `api.secretdraw.com`
3. Update DNS with provided records
4. Update `FRONTEND_URL` in backend to use custom domain
5. Update `VITE_API_URL` in frontend to `https://api.secretdraw.com`

### 4. SSL Certificates

Railway automatically provisions SSL certificates via Let's Encrypt. Wait 5-10 minutes after DNS propagation.

## CI/CD Setup

### Automatic Deployments

**Railway automatically deploys on push to main branch.**

### Configure Branch Deployments

1. Go to Project Settings
2. Under "Environments", click "Configure"
3. Set production to `main` branch
4. Optionally add staging environment for `develop` branch

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm i -g @railway/cli

      - name: Deploy Backend
        run: railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Deploy Frontend
        run: railway up --service frontend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

**Get Railway Token:**
```bash
railway login
railway token
```

Add token to GitHub Secrets as `RAILWAY_TOKEN`.

## Monitoring & Logs

### View Logs

**Via Web Dashboard:**
1. Go to service
2. Click "Deployments"
3. View logs in real-time

**Via CLI:**
```bash
# Backend logs
railway logs --service backend

# Frontend logs
railway logs --service frontend

# Follow logs (live)
railway logs --service backend --follow
```

### Metrics

**Via Dashboard:**
1. Go to service
2. Click "Metrics"
3. View CPU, memory, network usage

### Alerts

**Set up alerts:**
1. Go to Project Settings
2. Click "Notifications"
3. Add webhook or email for deployment failures

### Error Tracking (Optional)

**Integrate Sentry:**

1. Create Sentry account
2. Add Sentry DSN to environment variables
3. Install Sentry SDK:

```bash
# Backend
npm install @sentry/node

# Frontend
npm install @sentry/react
```

4. Initialize in code (see Sentry docs)

## Rollback Procedures

### Rollback to Previous Deployment

**Via Web Dashboard:**
1. Go to service
2. Click "Deployments"
3. Find previous successful deployment
4. Click three dots → "Redeploy"

**Via CLI:**
```bash
# List deployments
railway deployments --service backend

# Rollback to specific deployment
railway rollback <deployment-id> --service backend
```

### Rollback Database Migration

**WARNING: Be very careful with database rollbacks!**

```bash
# Connect to Railway database
railway connect postgres

# Or manually
psql $DATABASE_URL

# View migration history
SELECT * FROM _prisma_migrations;

# Manual rollback (if needed)
# This is risky - prefer forward-fixing with new migrations
```

**Better approach:** Create a new migration that fixes the issue.

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Build succeeds locally
- [ ] No secrets in code

### Backend Deployment
- [ ] Database service created
- [ ] Backend service created
- [ ] Environment variables set
- [ ] Migrations run successfully
- [ ] Health endpoint responding
- [ ] Logs show no errors

### Frontend Deployment
- [ ] Frontend service created
- [ ] VITE_API_URL points to backend
- [ ] Build completes successfully
- [ ] Static assets loading
- [ ] API calls working

### Post-Deployment
- [ ] Test critical user flows
- [ ] Check error logs
- [ ] Verify email sending (if applicable)
- [ ] Monitor performance metrics
- [ ] Update documentation if needed

## Common Deployment Issues

### Issue: Build Fails

**Check:**
- Build logs for specific error
- package.json scripts are correct
- All dependencies in package.json (not just devDependencies)

**Fix:**
```bash
# Test build locally
npm run build

# Check Railway build command
railway logs --service backend
```

### Issue: Database Connection Fails

**Check:**
- DATABASE_URL is set correctly
- Database service is running
- Migrations have run

**Fix:**
```bash
# Verify DATABASE_URL
railway variables --service backend

# Run migrations manually
railway run --service backend npx prisma migrate deploy
```

### Issue: Environment Variables Not Working

**Check:**
- Variables are set in correct service
- Variables don't have quotes (Railway adds them automatically)
- Service was redeployed after adding variables

**Fix:**
```bash
# List all variables
railway variables --service backend

# Redeploy after adding variables
railway up --service backend
```

### Issue: CORS Errors

**Check:**
- FRONTEND_URL in backend matches actual frontend URL
- CORS middleware is configured correctly

**Fix in backend:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## Cost Optimization

### Railway Pricing (as of 2024)

- **Free Tier**: $5 credit/month, good for MVP
- **Pro Plan**: $20/month, includes $20 credit
- **Usage-Based**: $0.000463/GB-minute

### Optimize Costs

1. **Use lightweight builds**: Minimize dependencies
2. **Optimize Docker images**: Use multi-stage builds
3. **Sleep inactive services**: Use Railway's sleep feature
4. **Monitor usage**: Check metrics regularly
5. **Optimize database**: Add indexes, limit queries

## Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Node.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Last Updated**: 2025-11-18
**Questions?** Check MAINTENANCE.md or open an issue on GitHub.
