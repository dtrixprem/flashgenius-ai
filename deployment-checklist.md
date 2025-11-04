# FlashGenius AI Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
- [ ] Update `MONGODB_URI` with production database
- [ ] Generate secure `JWT_SECRET` for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` and `NEXT_PUBLIC_API_URL`
- [ ] Verify `GEMINI_API_KEY` is working

### 2. Database Setup
- [ ] Create production MongoDB Atlas cluster
- [ ] Whitelist deployment server IPs
- [ ] Test database connection

### 3. Security
- [ ] Generate new JWT secrets (don't use development ones)
- [ ] Enable CORS for production domains only
- [ ] Set up rate limiting
- [ ] Configure security headers

## Deployment Steps

### Option A: Vercel (Recommended)
1. `cd frontend && vercel`
2. `cd backend && vercel`
3. Configure environment variables in Vercel dashboard
4. Update CORS settings with production URLs

### Option B: Railway
1. `railway login`
2. `cd backend && railway up`
3. `cd frontend && railway up`
4. Configure environment variables in Railway dashboard

### Option C: Render
1. Push to GitHub
2. Connect repository to Render
3. Deploy using render.yaml configuration

## Post-Deployment Verification

### Test Checklist
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Document upload works
- [ ] Flashcard generation works
- [ ] Study sessions work
- [ ] Leaderboard displays
- [ ] Points are awarded correctly

### Performance Checks
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Database queries optimized
- [ ] Images and assets optimized

### Security Verification
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Authentication secure

## Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure log aggregation

## Domain Configuration (Optional)
- [ ] Purchase custom domain
- [ ] Configure DNS settings
- [ ] Set up SSL certificate
- [ ] Update CORS and environment variables