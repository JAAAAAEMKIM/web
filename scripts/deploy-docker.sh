#!/bin/bash

# Docker Deployment Script for Next.js Blog
# This script deploys your blog using Docker containers

set -e  # Exit on any error

echo "🐳 Starting Docker deployment for Next.js Blog..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Parse command line arguments
ENVIRONMENT="production"
BUILD_IMAGE="true"
PULL_IMAGE="false"

while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --no-build)
      BUILD_IMAGE="false"
      shift
      ;;
    --pull)
      PULL_IMAGE="true"
      BUILD_IMAGE="false"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --env ENV        Set environment (development|production) [default: production]"
      echo "  --no-build       Don't build image locally, use existing"
      echo "  --pull           Pull image from registry instead of building"
      echo "  -h, --help       Show this help message"
      exit 0
      ;;
    *)
      print_error "Unknown option $1"
      exit 1
      ;;
  esac
done

print_info "Deployment environment: $ENVIRONMENT"

# Set compose file based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.production"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env.local"
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "$ENV_FILE not found. Creating template..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        cat > "$ENV_FILE" << EOF
DATABASE_URL="file:./data/prod.db"
NEXTAUTH_SECRET="your-secure-production-secret-replace-this"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
EOF
    else
        cat > "$ENV_FILE" << EOF
DATABASE_URL="file:./data/dev.db"
NEXTAUTH_SECRET="development-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
EOF
    fi
    
    print_warning "Please update $ENV_FILE with your actual values and run again."
    exit 1
fi

print_status "Environment file $ENV_FILE found"

# Create data directory for database persistence
mkdir -p data
print_status "Created data directory for database persistence"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed or not the plugin version. Please install Docker Compose."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Load environment variables
set -a  # automatically export all variables
source "$ENV_FILE"
set +a

print_status "Environment variables loaded from $ENV_FILE"

# Initialize database if it doesn't exist
DB_FILE="data/$(basename "$DATABASE_URL")"
if [ ! -f "$DB_FILE" ]; then
    print_status "Database not found. It will be initialized on first container run."
else
    print_warning "Database already exists at $DB_FILE"
    
    # Create backup
    BACKUP_FILE="$DB_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$DB_FILE" "$BACKUP_FILE"
    print_status "Database backed up to $BACKUP_FILE"
fi

# Build or pull image
if [ "$PULL_IMAGE" = "true" ]; then
    print_status "Pulling Docker image from registry..."
    docker compose -f "$COMPOSE_FILE" pull
elif [ "$BUILD_IMAGE" = "true" ]; then
    print_status "Building Docker image..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down

# Start containers
print_status "Starting containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for health check
print_info "Waiting for application to be healthy..."
HEALTH_CHECK_URL="http://localhost:3000/api/health"
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_status "Application is healthy!"
        break
    fi
    
    echo -ne "${YELLOW}⏳${NC} Attempt $ATTEMPT/$MAX_ATTEMPTS: Waiting for application to be ready...\r"
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

echo "" # New line after progress indicator

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    print_error "Application failed to become healthy within expected time"
    print_info "Check logs with: docker compose -f $COMPOSE_FILE logs"
    exit 1
fi

# Show container status
print_status "Container status:"
docker compose -f "$COMPOSE_FILE" ps

# Database initialization for first time setup
if [ ! -f "$DB_FILE" ] || [ ! -s "$DB_FILE" ]; then
    print_status "Initializing database..."
    
    # Run database commands inside the container
    docker compose -f "$COMPOSE_FILE" exec app npx prisma db push --accept-data-loss
    docker compose -f "$COMPOSE_FILE" exec app npx prisma generate
    docker compose -f "$COMPOSE_FILE" exec app pnpm run seed
    
    print_status "Database initialized and seeded!"
fi

echo
print_status "🎉 Deployment completed successfully!"

if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Production environment:"
    print_info "  • Application: http://localhost:3000 (or through Nginx on port 80)"
    print_info "  • Health check: http://localhost:3000/api/health"
    print_info "  • Admin login: admin@example.com / admin123"
else
    print_info "Development environment:"
    print_info "  • Application: http://localhost:3000"
    print_info "  • Health check: http://localhost:3000/api/health"
    print_info "  • Admin login: admin@example.com / admin123"
fi

echo
print_info "Useful commands:"
echo "  • View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "  • Stop: docker compose -f $COMPOSE_FILE down"
echo "  • Restart: docker compose -f $COMPOSE_FILE restart"
echo "  • Status: docker compose -f $COMPOSE_FILE ps"
echo "  • Shell access: docker compose -f $COMPOSE_FILE exec app sh"