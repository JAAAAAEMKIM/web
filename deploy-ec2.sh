#!/bin/bash

# Direct Deployment Script for Next.js Blog
# This script helps deploy your blog directly to EC2 without Docker

set -e  # Exit on any error

echo "🚀 Starting direct deployment for Next.js Blog..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Please ensure it exists with:"
    print_warning "  - DATABASE_URL=file:./data/prod.db"
    print_warning "  - NEXTAUTH_SECRET=your-secure-secret"
    print_warning "  - NEXTAUTH_URL=https://yourdomain.com"
    print_warning "  - NODE_ENV=production"
    exit 1
fi

# Load environment variables
set -a  # automatically export all variables
source <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.production)
set +a

print_status "Environment variables loaded from .env.production"

# Create data directory for database persistence
mkdir -p data
print_status "Created data directory for database persistence"

# Check if Node.js and pnpm are installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first: npm install -g pnpm"
    exit 1
fi

print_status "Node.js and pnpm are available"

# Install dependencies
print_status "Installing dependencies..."
pnpm install

# Initialize database if it doesn't exist
if [ ! -f "data/prod.db" ]; then
    print_status "Initializing database for first time..."
    
    # Push schema to database
    npx prisma db push --accept-data-loss
    
    # Generate Prisma client
    npx prisma generate
    
    # Seed database
    pnpm run seed
    
    print_status "Database initialized and seeded!"
else
    print_warning "Database already exists. Running migrations if needed..."
    npx prisma db push
    npx prisma generate
fi

# Build the application
print_status "Building the application..."
pnpm build

# Check if PM2 is installed for process management
if command -v pm2 &> /dev/null; then
    print_status "Using PM2 for process management..."
    
    # Stop existing process if running
    pm2 stop mysite-blog || true
    pm2 delete mysite-blog || true
    
    # Start the application with PM2
    pm2 start pnpm --name "mysite-blog" -- start
    pm2 save
    
    print_status "Application is running with PM2!"
    print_status "Access your blog at: http://localhost:3000"
    print_status "Admin login: admin@example.com / admin123"
    echo
    print_status "Useful PM2 commands:"
    echo "  View logs: pm2 logs mysite-blog"
    echo "  Stop: pm2 stop mysite-blog"
    echo "  Restart: pm2 restart mysite-blog"
    echo "  Status: pm2 status"
else
    print_warning "PM2 not found. Starting application directly..."
    print_warning "For production, consider installing PM2: npm install -g pm2"
    echo
    print_status "Starting the application..."
    print_status "Access your blog at: http://localhost:3000"
    print_status "Admin login: admin@example.com / admin123"
    echo
    print_warning "Note: This will run in foreground. Use Ctrl+C to stop."
    pnpm start
fi