#!/bin/bash

# Render API Deployment Script for Backend
# Usage: ./deploy-backend.sh

set -e

RENDER_API_KEY="rnd_FPGacc20g6INMu9gCsKwTzF2phRT"
OWNER_ID="wsmontes"
REPO="Physio-Note"

echo "🚀 Deploying Backend Web Service to Render..."

# Prompt for required environment variables
echo ""
echo "📝 Please provide the following environment variables:"
echo ""
read -p "MongoDB URI (mongodb+srv://...): " MONGODB_URI
read -p "JWT Secret (use 'openssl rand -hex 32' to generate): " JWT_SECRET
read -p "OpenAI API Key (sk-...): " OPENAI_API_KEY
read -p "CORS Origin (leave empty for now, add after frontend deploys): " CORS_ORIGIN

echo ""
echo "Creating backend web service..."

# Create the web service
RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "physio-note-backend",
    "ownerId": "'${OWNER_ID}'",
    "repo": "https://github.com/'${OWNER_ID}'/'${REPO}'",
    "branch": "main",
    "rootDir": "server",
    "buildCommand": "npm install",
    "startCommand": "node src/server.js",
    "envVars": [
      {
        "key": "NODE_ENV",
        "value": "production"
      },
      {
        "key": "PORT",
        "value": "10000"
      },
      {
        "key": "MONGODB_URI",
        "value": "'${MONGODB_URI}'"
      },
      {
        "key": "JWT_SECRET",
        "value": "'${JWT_SECRET}'"
      },
      {
        "key": "OPENAI_API_KEY",
        "value": "'${OPENAI_API_KEY}'"
      },
      {
        "key": "CORS_ORIGIN",
        "value": "'${CORS_ORIGIN}'"
      }
    ],
    "serviceDetails": {
      "env": "node",
      "plan": "free",
      "region": "oregon",
      "healthCheckPath": "/api/health"
    },
    "autoDeploy": "yes"
  }')

echo ""
echo "Response from Render API:"
echo "$RESPONSE" | python3 -m json.tool

# Extract service URL
SERVICE_URL=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('service', {}).get('serviceDetails', {}).get('url', 'N/A'))" 2>/dev/null || echo "N/A")

echo ""
echo "✅ Backend deployment initiated!"
echo "📍 Backend URL: ${SERVICE_URL}"
echo ""
echo "Next steps:"
echo "1. Wait for deployment to complete (check Render dashboard)"
echo "2. Test health check: curl ${SERVICE_URL}/api/health"
echo "3. Run ./deploy-frontend.sh with backend URL"
