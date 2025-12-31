#!/bin/bash

# Test AI Agent Endpoint in Production

echo "=== Testing AI Agent Generate Exercises Endpoint ==="
echo ""

# Create a test user first (or use existing)
echo "1. Creating/logging in test user..."
LOGIN_RESPONSE=$(curl -s -X POST https://physio-note-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got auth token: ${TOKEN:0:20}..."
echo ""

# Test the generate exercises endpoint
echo "2. Testing /api/ai/agent/generate-exercises..."
EXERCISE_RESPONSE=$(curl -s -X POST https://physio-note-backend.onrender.com/api/ai/agent/generate-exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "diagnosis": "shoulder pain",
    "impairments": ["ROM deficit: 40%"],
    "goals": "improve function"
  }')

echo "Response:"
echo "$EXERCISE_RESPONSE" | jq '.' 2>/dev/null || echo "$EXERCISE_RESPONSE"
echo ""

# Check if it succeeded
if echo "$EXERCISE_RESPONSE" | jq -e '.exercises' > /dev/null 2>&1; then
  echo "✅ Exercise generation successful!"
  echo "Generated $(echo "$EXERCISE_RESPONSE" | jq '.exercises | length') exercises"
else
  echo "❌ Exercise generation failed"
  ERROR_MSG=$(echo "$EXERCISE_RESPONSE" | jq -r '.message // .error // "Unknown error"')
  echo "Error: $ERROR_MSG"
fi
