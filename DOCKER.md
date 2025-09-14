# Docker Deployment Guide

This guide covers the containerized deployment setup for the Next.js personal blog application.

## 🏗️ Architecture Overview

The application has been containerized using a multi-stage Docker build approach:

- **Base Stage**: Node.js 22 Alpine Linux foundation
- **Dependencies Stage**: Installs and caches dependencies
- **Builder Stage**: Builds the Next.js application with standalone output
- **Runner Stage**: Production-ready container with non-root user

## 📁 File Structure

```
mysite/
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment with Nginx
├── .dockerignore             # Files excluded from Docker context
├── .env.docker.example       # Environment template
├── nginx/
│   └── default.conf          # Nginx reverse proxy configuration
└── scripts/
    ├── deploy-docker.sh      # Automated deployment script
    └── health-check.js       # Health monitoring utility
```

## 🚀 Quick Start

### Development Deployment

```bash
# Copy environment template
cp .env.docker.example .env.local

# Edit environment variables
nano .env.local

# Deploy with development settings
./scripts/deploy-docker.sh --env development
```

### Production Deployment

```bash
# Copy environment template
cp .env.docker.example .env.production

# Edit production environment variables
nano .env.production

# Deploy to production
./scripts/deploy-docker.sh --env production
```

## 🔧 Configuration

### Environment Variables

#### Required Variables
```env
DATABASE_URL="file:./data/prod.db"
NEXTAUTH_SECRET="your-secure-secret-here"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

#### Optional Variables
```env
HEALTH_URL="http://localhost:3000/api/health"
HEALTH_TIMEOUT="10000"
HEALTH_RETRIES="3"
```

### Docker Compose Services

#### Development (docker-compose.yml)
- **App Container**: Next.js application on port 3000
- **Volume Mounts**: Database and images directory
- **Health Check**: HTTP endpoint monitoring

#### Production (docker-compose.prod.yml)
- **App Container**: Next.js application
- **Nginx Container**: Reverse proxy and static file serving
- **Resource Limits**: Memory constraints for production
- **Logging**: Structured JSON logs with rotation

## 🛠️ Deployment Script Usage

The `deploy-docker.sh` script provides automated deployment with various options:

```bash
# Development deployment
./scripts/deploy-docker.sh --env development

# Production deployment (default)
./scripts/deploy-docker.sh

# Deploy without building (use existing image)
./scripts/deploy-docker.sh --no-build

# Pull from registry instead of building
./scripts/deploy-docker.sh --pull

# Help
./scripts/deploy-docker.sh --help
```

### Script Features
- ✅ Environment validation
- ✅ Database initialization
- ✅ Health check monitoring
- ✅ Container status reporting
- ✅ Database seeding for first run
- ✅ Automatic backup creation

## 🏥 Health Monitoring

### Health Check Endpoint
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-14T11:42:38.473Z",
  "uptime": 19,
  "memory": {
    "rss": 111,
    "heapUsed": 38,
    "heapTotal": 41
  },
  "database": "connected"
}
```

### Health Check Script
```bash
# Run health check
node scripts/health-check.js

# Custom health URL
HEALTH_URL="http://localhost:3000/api/health" node scripts/health-check.js
```

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Test Stage**: Linting, type checking, and build verification
2. **Build Stage**: Multi-platform Docker image creation
3. **Deploy Stage**: Automated deployment to production server

### Required Secrets
```
DEPLOY_HOST        # Server IP/hostname
DEPLOY_USER        # SSH username
DEPLOY_SSH_KEY     # Private SSH key
GITHUB_TOKEN       # For container registry access
```

### Optional Secrets
```
DEPLOY_PORT        # SSH port (default: 22)
SLACK_WEBHOOK      # For deployment notifications
```

## 📊 Performance Metrics

### Build Performance
- **Build Time**: ~3-5 minutes
- **Image Size**: ~200MB (optimized)
- **Startup Time**: ~10-15 seconds
- **Memory Usage**: ~100-150MB

### Container Features
- ✅ Multi-stage build optimization
- ✅ Non-root user execution
- ✅ Health check integration
- ✅ Volume persistence for database
- ✅ Resource limits and logging

## 🔧 Maintenance Commands

### Container Management
```bash
# View logs
docker compose logs -f

# Check container status
docker compose ps

# Restart containers
docker compose restart

# Stop containers
docker compose down

# Shell access
docker compose exec app sh
```

### Database Operations
```bash
# Run database migrations
docker compose exec app npx prisma db push

# Seed database
docker compose exec app pnpm run seed

# Access database shell
docker compose exec app npx prisma studio
```

### Image Management
```bash
# Build new image
docker compose build --no-cache

# Remove unused images
docker image prune -f

# View image size
docker images mysite-app
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes on port 3000
lsof -ti :3000 | xargs kill -9
```

**Container Won't Start**
```bash
# Check logs
docker compose logs app

# Check health status
curl http://localhost:3000/api/health
```

**Database Issues**
```bash
# Reset database
docker compose exec app npx prisma migrate reset --force

# Check database connection
docker compose exec app npx prisma db pull
```

### Health Check Failures

1. **Database Connection**: Ensure SQLite file permissions are correct
2. **Environment Variables**: Verify all required variables are set
3. **Port Conflicts**: Check if port 3000 is already in use
4. **Memory Limits**: Monitor container memory usage

## 📈 Monitoring & Logging

### Application Logs
```bash
# Follow all logs
docker compose logs -f

# Application-specific logs
docker compose logs -f app

# Nginx logs (production)
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Health Monitoring
```bash
# Continuous health monitoring
watch -n 5 'curl -s http://localhost:3000/api/health | jq'
```

### Performance Monitoring
```bash
# Container stats
docker stats

# Memory usage
docker compose exec app free -h

# Disk usage
docker compose exec app df -h
```

## 🔐 Security Considerations

### Container Security
- ✅ Non-root user execution
- ✅ Minimal Alpine base image
- ✅ No unnecessary packages
- ✅ Secret management via environment variables

### Network Security
- ✅ Nginx reverse proxy
- ✅ Rate limiting configuration
- ✅ Security headers
- ✅ Port isolation

### Data Security
- ✅ Database file permissions
- ✅ Environment variable isolation
- ✅ Container filesystem restrictions

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment/docker)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)
- [Docker Compose Production Guide](https://docs.docker.com/compose/production/)
- [Nginx Docker Configuration](https://hub.docker.com/_/nginx)