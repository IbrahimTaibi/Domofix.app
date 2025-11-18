# Deployment Guide

This guide covers deployment strategies and environment setup for the domofix platform.

## 🚀 Quick Deployment

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB instance
- Domain name (for production)
- SSL certificate (for production)

## 🏠 Local Development

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd domofix

# Install dependencies
npm run install:all
```

### 2. Environment Variables

#### Backend Environment (`.env`)

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/domofix
MONGODB_TEST_URI=mongodb://localhost:27017/domofix_test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (Optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### Frontend Environment (`.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=false
```

### 3. Database Setup

#### Local MongoDB

```bash
# Install MongoDB (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

## ☁️ Production Deployment

### Option 1: Vercel + Railway

#### Frontend (Vercel)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   cd apps/frontend
   vercel
   ```

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

3. **Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Backend (Railway)

1. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   cd apps/backend
   railway deploy
   ```

2. **Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/domofix
   JWT_SECRET=production-jwt-secret-very-long-and-secure
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-app.vercel.app
   ```

### Option 2: Docker Deployment

#### 1. Create Dockerfiles

**Frontend Dockerfile** (`apps/frontend/Dockerfile`)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/ ./packages/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build:frontend

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Backend Dockerfile** (`apps/backend/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/ ./packages/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/

# Build the application
RUN npm run build:backend

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod", "--workspace=@domofix/backend"]
```

#### 2. Docker Compose

**docker-compose.yml**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: domofix-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: domofix
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    container_name: domofix-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/domofix?authSource=admin
      - JWT_SECRET=your-production-jwt-secret
      - PORT=3001
    ports:
      - "3001:3001"
    depends_on:
      - mongodb

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    container_name: domofix-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### 3. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: VPS Deployment

#### 1. Server Setup (Ubuntu 20.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### 2. Application Deployment

```bash
# Clone repository
git clone <repository-url> /var/www/domofix
cd /var/www/domofix

# Install dependencies
npm run install:all

# Build applications
npm run build

# Create PM2 ecosystem file
```

**ecosystem.config.js**

```javascript
module.exports = {
  apps: [
    {
      name: 'domofix-backend',
      cwd: '/var/www/domofix/apps/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'domofix-frontend',
      cwd: '/var/www/domofix/apps/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
```

```bash
# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

**/etc/nginx/sites-available/domofix**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/domofix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Environment-Specific Configurations

### Development
- Hot reloading enabled
- Detailed error messages
- Debug logging
- CORS enabled for localhost

### Staging
- Production-like environment
- Limited logging
- Performance monitoring
- Staging database

### Production
- Optimized builds
- Error tracking
- Performance monitoring
- Security headers
- Rate limiting
- HTTPS only

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs domofix-backend
pm2 logs domofix-frontend

# Restart applications
pm2 restart all
```

### Health Checks

Create health check endpoints:

**Backend Health Check** (`/health`)

```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}
```

### Log Management

```bash
# Rotate logs with PM2
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### Security Headers

```nginx
# Add to Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string
   mongo "your-connection-string"
   ```

3. **Port Conflicts**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

4. **Permission Issues**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER /var/www/domofix
   
   # Fix permissions
   chmod -R 755 /var/www/domofix
   ```

### Performance Optimization

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   ```

2. **Static File Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Database Indexing**
   ```javascript
   // Add indexes for frequently queried fields
   db.users.createIndex({ email: 1 })
   db.users.createIndex({ createdAt: -1 })
   ```

This deployment guide covers various deployment scenarios from local development to production environments. Choose the option that best fits your infrastructure and requirements.