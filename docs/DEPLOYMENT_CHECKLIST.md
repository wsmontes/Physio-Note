# Render Deployment Checklist

Use this checklist before deploying to Render.

## Pre-Deployment

- [ ] Read [PRODUCTION_WARNING.md](PRODUCTION_WARNING.md) - **CRITICAL**
- [ ] MongoDB Atlas account created
- [ ] OpenAI API key obtained (with credits)
- [ ] Generated JWT secret: `openssl rand -hex 32`
- [ ] Reviewed [RENDER_QUICKSTART.md](RENDER_QUICKSTART.md)

## Code Preparation

- [ ] Health check endpoint added (`/api/health`)
- [ ] CORS configured with environment variable
- [ ] Server start script exists: `"start": "node src/server.js"`
- [ ] Client build script exists: `"build": "vite build"`
- [ ] Environment variable examples documented
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub

## MongoDB Atlas Setup

- [ ] Cluster created (M0 free tier minimum)
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0 for Render)
- [ ] Connection string copied and tested
- [ ] Database name added to connection string

## Render Backend Deployment

- [ ] Web Service created
- [ ] Root directory set to `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] NODE_ENV=production
  - [ ] PORT=5001
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] OPENAI_API_KEY
  - [ ] OPENAI_MODEL=gpt-5-nano
  - [ ] OPENAI_WHISPER_MODEL=whisper-1
  - [ ] CORS_ORIGIN (will add after frontend)
- [ ] Health check path set: `/api/health`
- [ ] Service deployed successfully
- [ ] Backend URL copied

## Render Frontend Deployment

- [ ] Static Site created
- [ ] Root directory set to `client`
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variable added:
  - [ ] VITE_API_URL=<backend-url>/api
- [ ] Rewrite rule added: `/*` → `/index.html`
- [ ] Site deployed successfully
- [ ] Frontend URL copied

## Final Configuration

- [ ] Updated CORS_ORIGIN in backend to frontend URL
- [ ] Backend redeployed with new CORS setting
- [ ] Tested health check: `curl <backend-url>/api/health`
- [ ] Tested frontend loads in browser
- [ ] Tested registration (with fake data)
- [ ] Tested login
- [ ] Tested creating patient
- [ ] Tested creating session
- [ ] Checked browser console for errors
- [ ] Checked Render logs for errors

## Post-Deployment

- [ ] Set up UptimeRobot monitoring (free)
- [ ] Added disclaimer to application about demo status
- [ ] Documented frontend and backend URLs
- [ ] Shared access with team (if applicable)
- [ ] Reviewed logs for first 24 hours

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate verified (auto by Render)
- [ ] Upgraded to paid plan (if needed)
- [ ] Database indexes created
- [ ] Performance monitoring set up
- [ ] Backup strategy documented

## Troubleshooting Done

If issues occurred, verify these were checked:

- [ ] All environment variables spelled correctly
- [ ] MongoDB connection string includes password
- [ ] MongoDB Network Access allows Render (0.0.0.0/0)
- [ ] CORS_ORIGIN matches frontend URL exactly (with https://)
- [ ] OpenAI API key is valid and has credits
- [ ] Render services are in same region (faster)
- [ ] No syntax errors in code (check logs)

## Notes

Add any deployment-specific notes here:

```
Backend URL: 
Frontend URL: 
MongoDB Cluster: 
Deployment Date: 
```

---

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

**Deployed By:** ________________

**Date:** ________________
