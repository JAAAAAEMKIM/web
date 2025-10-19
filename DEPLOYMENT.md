# Deployment Guide

## Server Setup (One-time)

### 1. Upload docker-compose.deploy.yml to Server

On your local machine, copy the deployment compose file to your server:

```bash
scp docker-compose.deploy.yml $DEPLOY_USER@$DEPLOY_HOST:/home/$DEPLOY_USER/web/
```

Or manually create `/home/$DEPLOY_USER/web/docker-compose.deploy.yml` on the server with the contents from the repository.

### 2. Create .env.production on Server

On the server at `/home/$DEPLOY_USER/web/.env.production`:

```env
NEXTAUTH_SECRET=your-secure-production-secret-here
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Create Required Directories

```bash
mkdir -p /home/$DEPLOY_USER/web/data
mkdir -p /home/$DEPLOY_USER/web/public/images
```

### 4. Initialize Database (First deployment only)

After the first successful deployment, initialize the database:

```bash
cd /home/$DEPLOY_USER/web
docker compose -f docker-compose.deploy.yml exec app npx prisma db push
docker compose -f docker-compose.deploy.yml exec app npx prisma generate
# Optional: Seed with initial data
docker compose -f docker-compose.deploy.yml exec app pnpm run seed
```

## How Deployment Works

1. **Build Stage** (GitHub Actions):
   - Builds Docker image with multi-stage Dockerfile
   - Pushes image to GitHub Container Registry (ghcr.io)
   - Image contains fully built Next.js application

2. **Deploy Stage** (GitHub Actions → Your Server):
   - SSHs into your server
   - Pulls the latest pre-built image from GHCR
   - Runs `docker compose -f docker-compose.deploy.yml up -d`
   - Docker Compose uses the pre-built image (NO building on server)

## Manual Deployment

If you need to deploy manually:

```bash
# SSH into server
ssh $DEPLOY_USER@$DEPLOY_HOST

# Navigate to deployment directory
cd /home/$DEPLOY_USER/web

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull latest image
docker pull ghcr.io/jaeminkim/mysite:latest

# Restart containers
docker compose -f docker-compose.deploy.yml down
docker compose -f docker-compose.deploy.yml up -d

# Check logs
docker compose -f docker-compose.deploy.yml logs -f
```

## Key Files

- **docker-compose.yml**: Local development (can build)
- **docker-compose.prod.yml**: Local production testing (can build)
- **docker-compose.deploy.yml**: Server deployment (pulls pre-built image only, no source code)
- **.github/workflows/deploy.yml**: CI/CD pipeline

## Troubleshooting

### View logs
```bash
docker compose -f docker-compose.deploy.yml logs -f app
```

### Check container status
```bash
docker compose -f docker-compose.deploy.yml ps
```

### Access container shell
```bash
docker compose -f docker-compose.deploy.yml exec app sh
```

### Database issues
```bash
# Check database file permissions
ls -la /home/$DEPLOY_USER/web/data/

# Regenerate Prisma client
docker compose -f docker-compose.deploy.yml exec app npx prisma generate
```
