#!/bin/bash

echo "=== Testing Backend API Endpoints ==="
echo ""

echo "1. Testing API Version:"
curl -s http://localhost:3000/v1/api-version || echo "❌ API Version endpoint failed"
echo ""

echo "2. Testing Health Check:"
curl -s http://localhost:3000/v1/health || echo "❌ Health endpoint failed"
echo ""

echo "3. Testing Auth Login (should return 400 for missing data):"
curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' || echo "❌ Auth login endpoint failed"
echo ""

echo "4. Testing Auth Login with test data:"
curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "testpass"}' || echo "❌ Auth login with data failed"
echo ""

echo "=== Test Complete ==="
