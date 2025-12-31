#!/bin/bash

# Update CORS_ORIGIN on backend service
# Usage: ./update-cors.sh https://physio-note-frontend.onrender.com

set -e

RENDER_API_KEY="rnd_FPGacc20g6INMu9gCsKwTzF2phRT"

if [ -z "$1" ]; then
  echo "Usage: ./update-cors.sh <frontend-url>"
  exit 1
fi

FRONTEND_URL=$1

echo "🔧 Updating CORS_ORIGIN on backend service..."
echo "Frontend URL: ${FRONTEND_URL}"
echo ""

# First, list services to get the backend service ID
echo "Fetching service list..."
SERVICES=$(curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer ${RENDER_API_KEY}")

# Extract backend service ID (looks for "physio-note-backend" or "Physio-Note")
SERVICE_ID=$(echo "$SERVICES" | python3 -c "
import sys, json
services = json.load(sys.stdin)
for service in services:
    name = service.get('service', {}).get('name', '')
    if 'backend' in name.lower() or name == 'Physio-Note':
        print(service.get('service', {}).get('id', ''))
        break
" 2>/dev/null)

if [ -z "$SERVICE_ID" ]; then
  echo "❌ Could not find backend service ID"
  echo "Services found:"
  echo "$SERVICES" | python3 -m json.tool
  exit 1
fi

echo "Found backend service ID: ${SERVICE_ID}"
echo ""

# Update the environment variable
echo "Updating CORS_ORIGIN environment variable..."
UPDATE_RESPONSE=$(curl -s -X PUT "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/CORS_ORIGIN" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "'${FRONTEND_URL}'"
  }')

echo "Response:"
echo "$UPDATE_RESPONSE" | python3 -m json.tool

echo ""
echo "✅ CORS_ORIGIN updated successfully!"
echo "🔄 Backend service will redeploy automatically"
