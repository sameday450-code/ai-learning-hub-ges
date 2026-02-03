# 🚀 AI Learning Hub - Deployment Guide

Complete step-by-step guide to deploy the AI Learning Hub platform for production use.

## 📋 Prerequisites

Before deployment, ensure you have:

1. **API Keys** (REQUIRED)

   - OpenAI API key (https://platform.openai.com/api-keys)
   - ElevenLabs API key (https://elevenlabs.io)

2. **Infrastructure**

   - PostgreSQL 14+ database
   - Node.js 18+ runtime
   - Web server (Nginx/Apache)
   - SSL certificate for HTTPS

3. **Tools**
   - Git
   - Docker & Docker Compose (recommended)
   - PM2 or similar process manager

---

## 🐳 Option 1: Docker Deployment (Recommended)

### Step 1: Clone and Configure

```bash
# Clone repository
git clone <your-repo-url>
cd ai-learning-hub

# Create environment file
cp .env.example .env
```

### Step 2: Set Environment Variables

Edit `.env`:

```env
# REQUIRED: Change these!
JWT_SECRET=your-super-secret-random-string-minimum-32-characters
OPENAI_API_KEY=sk-your-actual-openai-key
ELEVENLABS_API_KEY=your-actual-elevenlabs-key

# Optional: Customize if needed
OPENAI_MODEL=gpt-4
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

### Step 3: Copy Images

```bash
# Copy your UI images to the client public folder
mkdir -p client/public
cp bg.png logo.png icon.png land.png client/public/
```

### Step 4: Deploy with Docker

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Verify services are running
docker-compose ps
```

### Step 5: Initialize Database

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed initial data (subjects)
docker-compose exec backend npm run prisma:seed
```

### Step 6: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Docker Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Remove everything (including database)
docker-compose down -v
```

---

## 🖥 Option 2: Manual Deployment

### Backend Setup

1. **Install Dependencies**

```bash
cd server
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**

```bash
# Make sure PostgreSQL is running
# Update DATABASE_URL in .env

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run prisma:seed
```

4. **Start Backend**

```bash
# Development
npm run dev

# Production (with PM2)
npm install -g pm2
pm2 start src/server.js --name ai-learning-backend
pm2 save
pm2 startup
```

### Frontend Setup

1. **Install Dependencies**

```bash
cd client
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
# Update VITE_API_URL to your backend URL
```

3. **Copy Images**

```bash
cp ../bg.png ../logo.png ../icon.png ../land.png public/
```

4. **Build for Production**

```bash
npm run build
```

5. **Serve with Nginx**

Create `/etc/nginx/sites-available/ai-learning-hub`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/ai-learning-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🌍 Environment Variables Reference

### Backend (.env in server/)

```env
# Server
NODE_ENV=production
PORT=5000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/ai_learning_hub?schema=public

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4

# ElevenLabs (Voice)
ELEVENLABS_API_KEY=your-key
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB

# CORS
CLIENT_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env in client/)

```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=AI Learning Hub
```

---

## 📊 Database Management

### Backup Database

```bash
# Using Docker
docker-compose exec postgres pg_dump -U postgres ai_learning_hub > backup.sql

# Manual
pg_dump -U postgres -h localhost ai_learning_hub > backup.sql
```

### Restore Database

```bash
# Using Docker
docker-compose exec -T postgres psql -U postgres ai_learning_hub < backup.sql

# Manual
psql -U postgres -h localhost ai_learning_hub < backup.sql
```

### View Database

```bash
# Using Prisma Studio
cd server
npx prisma studio
# Access at http://localhost:5555
```

---

## 🔍 Monitoring & Logs

### PM2 Monitoring

```bash
# View processes
pm2 list

# Monitor
pm2 monit

# Logs
pm2 logs ai-learning-backend

# Restart
pm2 restart ai-learning-backend
```

### Docker Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs backend
```

---

## 🧪 Testing Deployment

### 1. Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Database connection
curl http://localhost:5000/api/subjects
```

### 2. Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "email": "test@example.com",
    "password": "test123",
    "className": "JHS 2"
  }'
```

### 3. Test AI Query

```bash
# Login first to get token, then:
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "What is 2 + 2?",
    "subjectId": "SUBJECT_ID"
  }'
```

---

## 🛠 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait 30 seconds
# 2. Missing .env file - check environment variables
# 3. Port conflict - change PORT in .env
```

### Database connection errors

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
docker-compose exec postgres psql -U postgres -l
```

### Frontend shows API errors

```bash
# Check VITE_API_URL is correct
# Verify backend is running
# Check CORS settings in backend
# Check browser console for errors
```

### Voice not working

```bash
# Verify ElevenLabs API key
# Check backend logs for errors
# Ensure ELEVENLABS_VOICE_ID is valid
```

---

## 📈 Performance Optimization

### 1. Enable Redis Caching

Add to docker-compose.yml:

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

### 2. Database Indexing

Already configured in Prisma schema for optimal performance.

### 3. CDN for Static Assets

Upload images to CDN and update paths in frontend.

### 4. Load Balancing

Use Nginx upstream for multiple backend instances.

---

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Set strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (allow only 80, 443)
- [ ] Regular security updates
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts
- [ ] Regular database backups
- [ ] Keep API keys in environment variables only
- [ ] Review Prisma migrations before deployment

---

## 📞 Support

For deployment issues:

- Check logs first
- Review environment variables
- Verify API keys are valid
- Ensure database is accessible

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features**:

   - User registration/login
   - Subject selection
   - AI question answering
   - Voice responses
   - Progress tracking

2. **Create admin user** (optional):

   ```sql
   -- Connect to database and run
   INSERT INTO students (id, email, password, "firstName", "lastName", "className")
   VALUES (
     gen_random_uuid(),
     'admin@ailearninghub.com',
     '$2a$10$hashed_password',
     'Admin',
     'User',
     'SHS 3'
   );
   ```

3. **Set up monitoring**:

   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)
   - Analytics (Google Analytics)

4. **Document**:
   - Admin credentials
   - API endpoints
   - Backup procedures

---

**Deployment Complete! 🚀**

Your AI Learning Hub is now live and ready to help Ghanaian students excel in their studies!
