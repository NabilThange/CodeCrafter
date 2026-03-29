#!/bin/bash

# Project Consolidation - Quick Start Script
# This script helps you set up the unified platform

echo "🎯 Unified Platform - Quick Start"
echo "================================="
echo ""

# Check if we're in the New directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the New/ directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Check for .env.local
echo "🔧 Step 2: Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your configuration:"
    echo "   - DATABASE_URL (Supabase PostgreSQL)"
    echo "   - OPENAI_API_KEY or GROQ_API_KEY (AI provider)"
    echo ""
    echo "Press Enter after you've configured .env.local..."
    read
else
    echo "✅ .env.local found"
fi
echo ""

# Step 3: Database setup
echo "🗄️  Step 3: Setting up database..."
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "Running database migrations..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    echo "   Make sure DATABASE_URL is correct in .env.local"
    exit 1
fi

echo "Seeding database..."
npx prisma db seed
if [ $? -ne 0 ]; then
    echo "⚠️  Failed to seed database (this is optional)"
else
    echo "✅ Database seeded"
fi
echo ""

# Step 4: Ready to start
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Follow MIGRATION.md to copy code from existing projects"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:migrate   - Run database migrations"
echo ""
echo "Documentation:"
echo "  README.md            - Project overview"
echo "  SETUP.md             - Detailed setup guide"
echo "  MIGRATION.md         - Code migration guide"
echo "  CHECKLIST.md         - Implementation tracking"
echo ""

# Ask if user wants to start dev server
read -p "Would you like to start the development server now? (y/n) " response
if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo ""
    echo "🚀 Starting development server..."
    npm run dev
fi
