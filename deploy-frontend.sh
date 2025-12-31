#!/bin/bash

# Render API Deployment Script for Frontend
# Usage: ./deploy-frontend.sh

set -e

RENDER_API_KEY="rnd_FPGacc20g6INMu9gCsKwTzF2phRT"
OWNER_ID="wsmontes"
REPO="Physio-Note"

echo "🚀 Deploying Frontend Static Site to Render..."

# Prompt for backend URL
echo ""
read -p "Backend API URL (https://physio-note-backend.onrender.com): " BACKEND_URL

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

echo ""
echo "Creating frontend static site..."

# Create the static site
RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "static_site",
    "name": "physio-note-frontend",
    "ownerId": "'${OWNER_ID}'",
    "repo": "https://github.com/'${OWNER_ID}'/'${REPO}'",
    "branch": "main",
    "rootDir": "client",
    "buildCommand": "npm install && npm run build",
    "publishPath": "dist",
    "envVars": [
      {
        "key": "VITE_API_URL",
        "value": "'${BACKEND_URL}'/api"
      }
    ],
    "serviceDetails": {
      "pullRequestPreviewsEnabled": "no"
    },
    "autoDeploy": "yes"
  }')

echo ""
echo "Response from Render API:"
echo "$RESPONSE" | python3 -m json.tool

# Extract service URL
SERVICE_URL=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('service', {}).get('serviceDetails', {}).get('url', 'N/A'))" 2>/dev/null || echo "N/A")

echo ""
echo "✅ Frontend deployment initiated!"
echo "📍 Frontend URL: ${SERVICE_URL}"
echo ""
echo "⚠️  IMPORTANT - Update Backend CORS:"
echo "1. Go to backend service in Render dashboard"
echo "2. Add environment variable:"
echo "   CORS_ORIGIN=${SERVICE_URL}"
echo "3. Redeploy backend service"
echo ""
echo "Or run: ./update-cors.sh ${SERVICE_URL}"
