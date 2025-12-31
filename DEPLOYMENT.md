# Deployment Guide for Render.com

## ⚠️ CRITICAL WARNING - READ BEFORE DEPLOYING ⚠️

**This application is NOT yet ready for production use with real patient data.**

Based on the [PROFESSIONAL_ASSESSMENT.md](PROFESSIONAL_ASSESSMENT.md):
- ❌ **NO HIPAA compliance framework** - Missing audit trails, consent tracking, BAA
- ❌ **NO data encryption at rest** - MongoDB needs encryption enabled
- ❌ **NO security certifications** - SOC 2, ISO 27001 required for healthcare
- ❌ **NO patient consent system** - Required by law
- ❌ **NO disaster recovery plan** - Risk of data loss

**Security Rating: 2/5 (Development/Demo only)**

### Safe Use Cases:
✅ **Personal testing/demo** with fake data
✅ **Development environment**
✅ **Portfolio showcase**
✅ **Proof of concept**

### DO NOT USE FOR:
❌ Real patient data (HIPAA violation)
❌ Clinical production environment
❌ Any healthcare setting without compliance framework

**Legal Notice:** Using this application with real Protected Health Information (PHI) without proper HIPAA compliance may result in fines up to $1.5M per violation and potential criminal charges.

---

## Prerequisites

Before deploying to Render, ensure you have:

1. **Render Account** - Sign up at https://render.com
2. **MongoDB Atlas Account** - Free tier at https://cloud.mongodb.com
3. **OpenAI API Key** - Get from https://platform.openai.com
4. **GitHub Repository** - Code must be in a Git repo
5. **Environment Variables Ready** - See section below

---

## Quick Deployment Steps

### Option A: Using Render Blueprint (Recommended)

1. **Push render.yaml to your repository:**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy from Render Dashboard:**
   - Go to https://dashboard.render.com
   - Click **"New" → "Blueprint"**
   - Connect your GitHub repository
   - Select the repository containing `render.yaml`
   - Render will automatically create both services

3. **Set Environment Variables:**
   - Go to each service in Render dashboard
   - Navigate to **"Environment"** tab
   - Add the required secrets (see section below)

### Option B: Manual Deployment

#### Step 1: Deploy Backend API

1. **Create Web Service:**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name:** `physio-note-api`
     - **Region:** Oregon (or closest to you)
     - **Branch:** `main`
     - **Root Directory:** `server`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Starter ($7/month)

2. **Add Environment Variables** (see section below)

3. **Create Health Check:**
   - Path: `/api/health`
   - This endpoint needs to be created (see below)

#### Step 2: Deploy Frontend Client

1. **Create Static Site:**
   - Go to Render Dashboard → New → Static Site
   - Connect your GitHub repository
   - Configure:
     - **Name:** `physio-note-client`
     - **Region:** Oregon
     - **Branch:** `main`
     - **Root Directory:** `client`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`

2. **Add Environment Variable:**
   - `VITE_API_URL`: Your backend API URL (from step 1)
   - Example: `https://physio-note-api.onrender.com/api`

3. **Configure Routing:**
   - Add rewrite rule: `/*` → `/index.html`
   - This enables client-side routing

---

## Required Environment Variables

### Backend API Environment Variables

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `NODE_ENV` | Environment mode | `production` | Set manually |
| `PORT` | Server port | `5001` | Set manually |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/physio-note` | MongoDB Atlas |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key-min-32-chars` | Generate with: `openssl rand -hex 32` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` | OpenAI Platform |
| `OPENAI_MODEL` | GPT model to use | `gpt-5-nano` | Set manually |
| `OPENAI_WHISPER_MODEL` | Whisper model | `whisper-1` | Set manually |
| `CORS_ORIGIN` | Allowed frontend URL | `https://physio-note.onrender.com` | Your frontend URL |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://physio-note-api.onrender.com/api` |

---

## Pre-Deployment Checklist

### 1. Create Health Check Endpoint

Add to `server/src/server.js` before your routes:

```javascript
// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### 2. Update CORS Configuration

In `server/src/server.js`, update CORS to accept Render URLs:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
```

### 3. Set Up MongoDB Atlas

1. **Create Free Cluster:**
   - Go to https://cloud.mongodb.com
   - Create new project: "Physio-Note"
   - Create cluster (free M0 tier)

2. **Configure Network Access:**
   - Database Access → Add User (username + password)
   - Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)
   - ⚠️ For production, restrict to Render IPs

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add database name: `/physio-note` before `?retryWrites`

### 4. Generate JWT Secret

```bash
# Generate a secure 32-byte random secret
openssl rand -hex 32
```

Copy this output and use it as your `JWT_SECRET`

### 5. Prepare Environment Files

Create `.env.production` files (DO NOT commit these):

**server/.env.production:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-generated-jwt-secret
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-nano
OPENAI_WHISPER_MODEL=whisper-1
CORS_ORIGIN=https://your-frontend.onrender.com
```

**client/.env.production:**
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### 6. Update package.json Scripts

Ensure these scripts exist:

**server/package.json:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

**client/package.json:**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## MongoDB Atlas Configuration

### 1. Enable Encryption at Rest (CRITICAL for HIPAA)

⚠️ **Note:** This requires MongoDB Atlas M10+ tier (not free)

- Go to Security → Encryption at Rest
- Enable encryption for your cluster
- Required for any healthcare data

### 2. Enable Backup

- Go to Backup
- Enable Cloud Backup
- Configure retention period (7+ years for medical records)

### 3. Set Up Monitoring

- Enable MongoDB Atlas monitoring
- Set up alerts for:
  - High CPU usage
  - Low disk space
  - Connection failures

---

## Deployment Process

### 1. Push to GitHub

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy via Render Dashboard

1. Log in to https://dashboard.render.com
2. Click "New" → "Blueprint" (or "Web Service" for manual)
3. Connect your GitHub repository
4. Render will:
   - Install dependencies
   - Build your application
   - Start the services

### 3. Configure Environment Variables

For each service:
1. Go to service in dashboard
2. Click "Environment" in sidebar
3. Add all required environment variables
4. Save changes (will trigger redeploy)

### 4. Verify Deployment

**Backend Health Check:**
```bash
curl https://your-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "uptime": 123.456
}
```

**Frontend:**
- Visit: `https://your-frontend.onrender.com`
- Should see login page
- Open browser console - no errors

**Database Connection:**
- Check Render logs: `Connected to MongoDB Atlas`

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Buy domain (e.g., Namecheap, Google Domains)
2. In Render Dashboard → Settings → Custom Domain
3. Add your domain
4. Update DNS records as instructed
5. Render automatically provisions SSL certificate

### 2. Environment-Specific Settings

Update these once deployed:

- `CORS_ORIGIN` in backend → Your actual frontend URL
- `VITE_API_URL` in frontend → Your actual backend URL

### 3. Monitoring Setup

**Render Built-in Monitoring:**
- Go to Metrics tab in each service
- Monitor: CPU, Memory, Response times

**External Monitoring (Recommended):**
- UptimeRobot (free): https://uptimerobot.com
- Check every 5 minutes
- Email alerts on downtime

---

## Troubleshooting

### Backend Won't Start

**Symptom:** Service keeps restarting
**Check:**
1. Render logs: Dashboard → Logs
2. Common issues:
   - Missing environment variables
   - MongoDB connection failed
   - Port configuration wrong

**Solution:**
```bash
# Check logs in Render dashboard
# Verify MONGODB_URI is correct
# Ensure JWT_SECRET is set
```

### Frontend 404 Errors

**Symptom:** Pages return 404 on refresh
**Solution:**
- Ensure rewrite rule is set: `/*` → `/index.html`
- In Static Site Settings → Rewrites and Redirects

### CORS Errors

**Symptom:** Browser console shows CORS policy errors
**Solution:**
1. Check backend `CORS_ORIGIN` matches frontend URL exactly
2. Include protocol: `https://your-site.onrender.com` (not `your-site.onrender.com`)
3. Redeploy backend after changing

### MongoDB Connection Timeout

**Symptom:** "MongoNetworkError" in logs
**Solution:**
1. Check MongoDB Atlas Network Access
2. Ensure `0.0.0.0/0` is allowed (or specific Render IPs)
3. Verify connection string is correct
4. Check MongoDB Atlas cluster is running

### OpenAI API Errors

**Symptom:** AI features fail
**Solution:**
1. Verify `OPENAI_API_KEY` is set correctly
2. Check API key has credits: https://platform.openai.com/usage
3. Ensure model name is correct: `gpt-5-nano`

---

## Performance Optimization

### 1. Database Indexes

After first deployment, create indexes:

```javascript
// Run once in MongoDB Atlas shell or Compass
db.patients.createIndex({ therapistId: 1, createdAt: -1 });
db.sessions.createIndex({ patientId: 1, date: -1 });
db.sessions.createIndex({ therapistId: 1, date: -1 });
db.notes.createIndex({ sessionId: 1 });
```

### 2. Enable Compression

Already enabled via:
```javascript
app.use(compression()); // in server.js
```

### 3. Upgrade Plan If Needed

**Render Starter Plan Limits:**
- 512 MB RAM
- 0.5 CPU
- 30-day logs
- Sleeps after 15 min inactivity (free tier only)

**Upgrade to Standard ($25/mo) when:**
- More than 10 users
- Need faster response times
- Can't tolerate sleep on inactivity
- Need more logs retention

---

## Security Hardening for Production

⚠️ **BEFORE using with real patient data, you MUST:**

### 1. Enable HTTPS Everywhere
✅ Render provides this automatically

### 2. Add Rate Limiting

```bash
cd server && npm install express-rate-limit
```

```javascript
// In server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 3. Add Helmet Security Headers

Already included, but verify:
```javascript
app.use(helmet());
```

### 4. Enable MongoDB Encryption at Rest

Requires MongoDB Atlas M10+ cluster ($57/month)

### 5. Implement Audit Logging

See [PROFESSIONAL_ASSESSMENT.md](PROFESSIONAL_ASSESSMENT.md) Phase 1 requirements

### 6. Add Patient Consent Tracking

Required by HIPAA before collecting PHI

### 7. Create Privacy Policy & Terms of Service

Required legal documents for healthcare apps

### 8. Get Business Associate Agreement (BAA)

Required contracts:
- MongoDB Atlas BAA (Enterprise tier only)
- OpenAI BAA (Enterprise only - ⚠️ **Current API calls are NOT HIPAA-compliant**)
- Render BAA (Enterprise only)

---

## Cost Estimate

### Minimum Production Setup (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Render Backend | Starter | $7 |
| Render Frontend | Free (static) | $0 |
| MongoDB Atlas | M0 (Free) | $0 |
| OpenAI API | Usage-based | $20-$100 |
| **Total** | | **$27-$107/mo** |

### HIPAA-Compliant Setup (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Render Backend | Standard + | $25 |
| Render Frontend | Static | $0 |
| MongoDB Atlas | M10 (Dedicated) | $57 |
| OpenAI API | Enterprise | $Custom |
| Monitoring | Datadog/New Relic | $15-$31 |
| **Total** | | **$97-$113/mo + OpenAI Enterprise** |

⚠️ **Reality:** Full HIPAA compliance typically costs **$300-$500/month minimum**

---

## Backup and Disaster Recovery

### 1. MongoDB Backups

**Free Tier (M0):**
- ❌ No automated backups
- Manual exports only

**Paid Tiers (M10+):**
- ✅ Continuous backups
- Point-in-time recovery
- Configurable retention

### 2. Manual Backup Script

```bash
# Run periodically
mongodump --uri="your-mongodb-uri" --out=./backup-$(date +%Y%m%d)
```

### 3. Code Backups

- Already handled by GitHub
- Ensure you push regularly
- Tag releases: `git tag v1.0.0`

---

## Monitoring and Alerts

### 1. Render Dashboard Monitoring

- CPU usage
- Memory usage
- Response times
- Error rates

### 2. Set Up External Monitoring

**UptimeRobot (Free):**
1. Sign up at https://uptimerobot.com
2. Add monitors:
   - Frontend URL (every 5 min)
   - Backend health endpoint (every 5 min)
3. Set up email alerts

### 3. Log Management

**Render Logs:**
- Available in dashboard
- Last 30 days (Starter plan)
- Last 90 days (Standard plan)

**External Logging (Production):**
- Consider: Papertrail, Loggly, or ELK stack
- Retain logs 7+ years for medical records

---

## Scaling Considerations

### When to Scale

**Scale Backend when:**
- Response times > 1 second consistently
- CPU usage > 70% sustained
- Memory usage > 80%
- More than 50 concurrent users

**Options:**
1. Upgrade to Standard plan (1 GB RAM, 1 CPU)
2. Upgrade to Pro plan (4 GB RAM, 2 CPU)
3. Add horizontal scaling (multiple instances)

### Database Scaling

**Scale MongoDB when:**
- Storage > 80% of limit
- Connections > 80% of limit
- Query times > 100ms

**Options:**
1. Upgrade cluster tier (M10 → M20 → M30)
2. Enable sharding (M30+)
3. Add read replicas

---

## Deployment Checklist

Before going live:

- [ ] Health check endpoint created
- [ ] CORS configured with production URLs
- [ ] MongoDB Atlas cluster created and configured
- [ ] Network access allows Render (0.0.0.0/0 or specific IPs)
- [ ] Database user created with strong password
- [ ] All environment variables set in Render
- [ ] JWT_SECRET generated (32+ characters)
- [ ] OpenAI API key has sufficient credits
- [ ] Frontend VITE_API_URL points to production backend
- [ ] Backend CORS_ORIGIN points to production frontend
- [ ] Test registration works
- [ ] Test login works
- [ ] Test creating a patient
- [ ] Test creating a session
- [ ] Test voice recording (if using)
- [ ] Test AI note generation
- [ ] Monitor logs for errors (24 hours)
- [ ] Set up external uptime monitoring
- [ ] Document emergency contacts
- [ ] **Add disclaimer about non-HIPAA compliance**

---

## Support and Resources

### Render Documentation
- Deploying Node.js: https://render.com/docs/deploy-node-express-app
- Static Sites: https://render.com/docs/static-sites
- Environment Variables: https://render.com/docs/configure-environment-variables

### MongoDB Atlas Documentation
- Getting Started: https://docs.atlas.mongodb.com/getting-started/
- Security: https://docs.atlas.mongodb.com/security/

### This Project Documentation
- [README.md](README.md) - Project overview
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [SETUP.md](SETUP.md) - Local development setup
- [PROFESSIONAL_ASSESSMENT.md](PROFESSIONAL_ASSESSMENT.md) - Production readiness assessment

---

## Emergency Procedures

### Service Down

1. Check Render dashboard for errors
2. Check Render status: https://status.render.com
3. Review recent deployments - rollback if needed
4. Check MongoDB Atlas status
5. Contact Render support if infrastructure issue

### Data Loss Prevention

1. MongoDB Atlas: Enable backups immediately
2. Regular manual exports
3. Never delete production database
4. Test restore procedure monthly

### Security Incident

1. If breach suspected:
   - Immediately change all passwords
   - Rotate JWT_SECRET (will log out all users)
   - Rotate OpenAI API key
   - Check Render logs for suspicious activity
2. If real patient data exposed:
   - **HIPAA requires notification within 60 days**
   - Contact legal counsel immediately
   - Document incident thoroughly

---

## Next Steps After Deployment

1. **Monitor closely for 48 hours**
   - Check logs every few hours
   - Test all features
   - Monitor error rates

2. **Set up proper monitoring**
   - UptimeRobot or similar
   - Error tracking (Sentry)
   - Performance monitoring

3. **Plan security improvements**
   - Review [PROFESSIONAL_ASSESSMENT.md](PROFESSIONAL_ASSESSMENT.md)
   - Implement Phase 1 security features
   - Do NOT use with real patient data until compliant

4. **Consider paid plans**
   - Render Standard ($25/mo) - no sleep, better performance
   - MongoDB M10 ($57/mo) - backups, encryption at rest
   - Monitor costs vs. benefits

---

## Frequently Asked Questions

### Q: Can I use the free tier?

**A:** Yes, for testing only:
- Render Free tier services sleep after 15 min inactivity
- First request after sleep takes 30-60 seconds
- Not suitable for production use

### Q: Is this HIPAA compliant now?

**A:** **NO.** Current setup is NOT HIPAA compliant because:
- No audit logging
- No patient consent tracking
- No encryption at rest (free MongoDB tier)
- No Business Associate Agreements with vendors
- OpenAI API (standard tier) is not HIPAA compliant

**Cost to make HIPAA compliant:** $300-500/month minimum + 3-6 months development

### Q: Can I use custom domain?

**A:** Yes, Render supports custom domains:
- Free SSL certificate included
- Instructions in Render dashboard under Settings → Custom Domain

### Q: How do I roll back a deployment?

**A:** 
1. Go to Render Dashboard → Your Service
2. Click "Deploys" in sidebar
3. Find previous working deploy
4. Click "Redeploy"

### Q: What happens if I exceed OpenAI credits?

**A:**
- API calls will fail
- Application will show errors to users
- Add payment method at https://platform.openai.com/account/billing
- Set usage limits to prevent overspending

---

**Last Updated:** December 30, 2025
**Deployment Platform:** Render.com
**Status:** ⚠️ Development/Demo Only - NOT for production healthcare use
