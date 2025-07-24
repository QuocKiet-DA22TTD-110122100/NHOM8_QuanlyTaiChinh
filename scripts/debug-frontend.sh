#!/bin/bash

echo "🔍 Debugging Frontend..."

# Kiểm tra container frontend
echo "📦 Frontend container status:"
docker ps | grep frontend

# Kiểm tra logs frontend
echo "📋 Frontend logs:"
docker logs finance_frontend --tail 50

# Kiểm tra port mapping
echo "🔌 Port mapping:"
docker port finance_frontend

# Kiểm tra network
echo "🌐 Network connectivity:"
docker exec finance_frontend ping -c 3 backend || echo "❌ Cannot reach backend"

# Kiểm tra files trong container
echo "📁 Files in container:"
docker exec finance_frontend ls -la /app

# Kiểm tra Vite process
echo "⚡ Vite process:"
docker exec finance_frontend ps aux | grep vite

# Test direct connection
echo "🧪 Testing direct connection:"
curl -I http://localhost:3000 || echo "❌ Cannot connect to frontend"

# Check if Vite is binding to correct host
echo "🔍 Checking Vite config:"
docker exec finance_frontend cat /app/vite.config.js