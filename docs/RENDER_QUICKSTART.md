# Quick Deployment Guide for Render

## 🚨 CRITICAL: Read PRODUCTION_WARNING.md First!

This is a **DEMO/DEVELOPMENT** deployment guide. DO NOT use with real patient data.

---

## Fast Track Deployment (15 minutes)

### Step 1: Prepare Environment Variables

You'll need these ready:

1. **MongoDB Atlas Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/physio-note?retryWrites=true&w=majority
   ```

2. **JWT Secret** (generate):
   ```bash
   openssl rand -hex 32
   ```

3. **OpenAI API Key**
   ```
   sk-proj-your-key-here
   ```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 3: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `physio-note-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/mo) or Free (with sleep)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-generated-secret>
   OPENAI_API_KEY=<your-openai-key>
   OPENAI_MODEL=gpt-5-nano
   OPENAI_WHISPER_MODEL=whisper-1
   CORS_ORIGIN=<will-add-after-frontend-deployed>
   ```

6. Click **"Create Web Service"**

7. Wait for deployment (3-5 minutes)

8. Copy your backend URL (e.g., `https://physio-note-api.onrender.com`)

### Step 4: Deploy Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name:** `physio-note`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=<your-backend-url>/api
   ```
   Example: `https://physio-note-api.onrender.com/api`

5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

6. Click **"Create Static Site"**

7. Wait for deployment (2-3 minutes)

8. Copy your frontend URL (e.g., `https://physio-note.onrender.com`)

### Step 5: Update Backend CORS

1. Go back to your backend service
2. Environment → Edit `CORS_ORIGIN`
3. Set to your frontend URL: `https://physio-note.onrender.com`
4. Save (will trigger redeploy)

### Step 6: Test Deployment

1. Visit your frontend URL
2. Try to register a new account (use FAKE data only!)
3. Login
4. Create a test patient
5. Create a test session

**If everything works, you're done!**

---

## Troubleshooting

### Backend won't start?
- Check logs in Render dashboard
- Verify `MONGODB_URI` is correct
- Ensure all environment variables are set

### Frontend shows CORS errors?
- Ensure `CORS_ORIGIN` in backend matches frontend URL exactly
- Include `https://` in the URL
- Redeploy backend after changing

### Can't connect to database?
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify username/password in connection string
- Ensure cluster is running

---

## What's Next?

1. **Add disclaimer to login page** - See [PRODUCTION_WARNING.md](PRODUCTION_WARNING.md)
2. **Set up monitoring** - UptimeRobot or similar
3. **Review security** - See [PROFESSIONAL_ASSESSMENT.md](PROFESSIONAL_ASSESSMENT.md)
4. **Plan improvements** - See [ARCHITECTURE_AUDIT.md](ARCHITECTURE_AUDIT.md)

---

## Cost

**Free Tier (with limitations):**
- Backend sleeps after 15 min inactivity
- First request takes 30-60 seconds to wake
- Not suitable for real use

**Paid Tier ($7-27/month):**
- Backend: Render Starter ($7/mo)
- Frontend: Free (static site)
- MongoDB: Free M0 tier
- OpenAI: Usage-based (~$20-100/mo)

---

## Important Reminders

⚠️ **This deployment is for DEMO/TESTING only**
- Do NOT enter real patient data
- Do NOT use in clinical setting
- Do NOT share publicly without disclaimer
- See [PRODUCTION_WARNING.md](PRODUCTION_WARNING.md) for legal implications

📖 **Full Documentation:**
- Detailed deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Production requirements: [PROFESSIONAL_ASSESSMENT.md](PROFESSIONAL_ASSESSMENT.md)

---

**Questions?** Review the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide.
