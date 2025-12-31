#!/bin/bash

# Render Deployment Environment Setup Script
# This script helps verify your environment is ready for deployment

echo "🔍 Checking Render Deployment Requirements..."
echo ""

# Check if Git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Git repository not initialized"
  echo "   Run: git init"
  exit 1
else
  echo "✅ Git repository found"
fi

# Check if remote is configured
if ! git remote get-url origin &> /dev/null; then
  echo "❌ Git remote 'origin' not configured"
  echo "   Run: git remote add origin <your-github-repo-url>"
  exit 1
else
  echo "✅ Git remote configured: $(git remote get-url origin)"
fi

# Check server files
if [ ! -f "server/package.json" ]; then
  echo "❌ server/package.json not found"
  exit 1
else
  echo "✅ server/package.json found"
fi

if [ ! -f "server/src/server.js" ]; then
  echo "❌ server/src/server.js not found"
  exit 1
else
  echo "✅ server/src/server.js found"
fi

# Check client files
if [ ! -f "client/package.json" ]; then
  echo "❌ client/package.json not found"
  exit 1
else
  echo "✅ client/package.json found"
fi

# Check for start script in server package.json
if ! grep -q '"start"' server/package.json; then
  echo "⚠️  Warning: 'start' script not found in server/package.json"
  echo "   Add: \"start\": \"node src/server.js\""
else
  echo "✅ Server start script found"
fi

# Check for build script in client package.json
if ! grep -q '"build"' client/package.json; then
  echo "⚠️  Warning: 'build' script not found in client/package.json"
  echo "   Add: \"build\": \"vite build\""
else
  echo "✅ Client build script found"
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
  echo "⚠️  render.yaml not found (optional, but recommended)"
else
  echo "✅ render.yaml found"
fi

# Check if .env.example exists
if [ ! -f "server/.env.example" ]; then
  echo "⚠️  server/.env.example not found (recommended)"
else
  echo "✅ server/.env.example found"
fi

echo ""
echo "📋 Required Environment Variables for Render:"
echo ""
echo "Backend (Web Service):"
echo "  - NODE_ENV=production"
echo "  - PORT=5001"
echo "  - MONGODB_URI=<your-mongodb-connection-string>"
echo "  - JWT_SECRET=<generate with: openssl rand -hex 32>"
echo "  - OPENAI_API_KEY=<your-openai-api-key>"
echo "  - OPENAI_MODEL=gpt-5-nano"
echo "  - OPENAI_WHISPER_MODEL=whisper-1"
echo "  - CORS_ORIGIN=<your-frontend-url>"
echo ""
echo "Frontend (Static Site):"
echo "  - VITE_API_URL=<your-backend-url>/api"
echo ""

# Check if committed and pushed
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "⚠️  Warning: You have uncommitted changes"
  echo "   Run: git add . && git commit -m 'Prepare for deployment'"
else
  echo "✅ All changes committed"
fi

# Check if branch is pushed
if [ -z "$(git log @{u}.. 2>/dev/null)" ]; then
  echo "✅ Branch is up to date with remote"
else
  echo "⚠️  Warning: Local commits not pushed to remote"
  echo "   Run: git push origin main"
fi

echo ""
echo "📚 Documentation:"
echo "  - Quick Start: RENDER_QUICKSTART.md (15-minute guide)"
echo "  - Full Guide: DEPLOYMENT.md (comprehensive)"
echo "  - ⚠️  WARNING: PRODUCTION_WARNING.md (READ THIS FIRST!)"
echo ""
echo "🚀 Ready to deploy! Go to: https://dashboard.render.com"
echo ""
