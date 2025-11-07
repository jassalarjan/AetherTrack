#!/bin/bash

# AetherTrack Setup Script
# This script helps you set up the AetherTrack application

echo "╔════════════════════════════════════════╗"
echo "║   AetherTrack - Setup Script             ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}⚠️  Yarn not found. Installing yarn...${NC}"
    npm install -g yarn
fi

echo -e "${GREEN}✅ Yarn detected${NC}"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    yarn install
else
    echo "Backend dependencies already installed"
fi

echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    yarn install
else
    echo "Frontend dependencies already installed"
fi

cd ..

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Setup Complete!                  ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "⚠️  IMPORTANT: MongoDB Atlas Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Before starting the servers, make sure to:"
echo "1. Go to MongoDB Atlas Dashboard"
echo "2. Navigate to: Network Access"
echo "3. Click: Add IP Address"
echo "4. Choose: Allow Access from Anywhere (0.0.0.0/0)"
echo "   OR add your current IP address"
echo ""
echo "🚀 To start the application:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Terminal 1 (Backend):"
echo "  cd backend && yarn start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && yarn dev"
echo ""
echo "🌐 Application URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  API:      http://localhost:5000/api"
echo ""
echo "📚 For more information, see README.md"
echo ""
