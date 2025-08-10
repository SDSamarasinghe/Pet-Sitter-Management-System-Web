#!/bin/bash

# Environment Switcher Script for Pet Sitter Management System
# Usage: ./scripts/switch-env.sh [development|production|staging]

ENV=${1:-development}

case $ENV in
  development|dev)
    echo "🔧 Switching to DEVELOPMENT environment..."
    cp .env.development .env.local
    echo "✅ Environment set to DEVELOPMENT"
    echo "📍 API URL: http://localhost:8000"
    echo "🚀 Run: npm run dev"
    ;;
  production|prod)
    echo "🚀 Switching to PRODUCTION environment..."
    cp .env.production .env.local
    echo "✅ Environment set to PRODUCTION"
    echo "📍 API URL: http://20.151.57.93:8000"
    echo "🏗️  Run: npm run build && npm run start"
    ;;
  staging)
    echo "🔨 Switching to STAGING environment..."
    # Create staging env if it doesn't exist
    if [ ! -f .env.staging ]; then
      cp .env.production .env.staging
      sed -i '' 's/NODE_ENV=production/NODE_ENV=staging/' .env.staging
    fi
    cp .env.staging .env.local
    echo "✅ Environment set to STAGING"
    echo "📍 API URL: http://20.151.57.93:8000"
    echo "🔨 Run: npm run build:staging && npm run start"
    ;;
  *)
    echo "❌ Invalid environment: $ENV"
    echo "📋 Available environments:"
    echo "   - development (or dev)"
    echo "   - production (or prod)"
    echo "   - staging"
    echo ""
    echo "Usage: ./scripts/switch-env.sh [development|production|staging]"
    exit 1
    ;;
esac

echo ""
echo "📄 Current .env.local contents:"
echo "================================"
cat .env.local
