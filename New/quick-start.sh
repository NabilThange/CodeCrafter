#!/bin/bash

# Unified Platform — Quick Start Script
# This script sets up the development environment

set -e

echo "🚀 Unified Platform — Quick Start"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your configuration:"
    echo "   - DATABASE_URL (required)"
    echo "   - API keys (optional, by feature)"
    echo ""
    read -p "Press Enter to continue after editing .env.local..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo ""

# Check if database is configured
if grep -q "postgresql://user:password@host:5432/database" .env.local; then
    echo "⚠️  Database URL not configured in .env.local"
    echo "   Please update DATABASE_URL before running migrations"
    echo ""
else
    # Run migrations
    echo "🗄️  Running database migrations..."
    npx prisma migrate dev --name init
    echo ""

    # Seed database
    echo "🌱 Seeding database..."
    npx prisma db seed
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🎉 Next steps:"
echo "   1. Edit .env.local with your configuration"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md — Project overview"
echo "   - SETUP.md — Detailed setup guide"
echo "   - MIGRATION.md — Code migration guide"
echo ""
