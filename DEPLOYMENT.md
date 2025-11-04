# FlashGenius AI - Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)
- MongoDB Atlas production cluster
- Google Cloud Platform account with Gemini API

## Quick Deployment

### 1. Environment Setup

```bash
# Copy production environment template
cp backend/.env.production backend/.env

# Update the following variables:
# - FRONTEND_URL (your domain)
# - MONGODB_URI (production database)
# - JWT_SECRET (generate new secure secret)
# - CORS_ORIGIN (your domain)
# - SMTP credentials for email
```

### 2. SSL Certificate Setup

```bash
# Create SSL directory
mkdir ssl

# Copy your SSL certificate files
cp your-cert.pem ssl/cert.pem
cp your-private-key.pem ssl/key.pem

# Or use Let's Encrypt (recommended)
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

### 3. Google Cloud Service Account

```bash
# Download service account key from Google Cloud Console
# Save as gcp-key.json in project root
```

### 4. Deploy Application

```bash
# Build and deploy
npm run prod:deploy

# Check health
npm run prod:health

# View logs
npm run docker:logs
```

## Manual Deployment Steps

### 1. Build Application

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml build
```

### 2. Start Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 3. Verify Deployment

```bash
# Check application health
curl -f https://your-domain.com/health
curl -f https://your-domain.com/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## Production Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `FRONTEND_URL` | Your domain URL | Yes |
| `MONGODB_URI` | Production MongoDB connection | Yes |
| `JWT_SECRET` | Secure JWT secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CORS_ORIGIN` | Allowed CORS origins | Yes |

### Security Features

- ✅ Rate limiting (API, auth, uploads)
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Input sanitization
- ✅ HTTPS enforcement
- ✅ Non-root Docker containers
- ✅ Request logging and monitoring

### Performance Features

- ✅ Nginx reverse proxy
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Redis caching layer
- ✅ Health checks
- ✅ Auto-restart policies

## Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl https://your-domain.com/health

# API health
curl https://your-domain.com/api/health

# Database connectivity
curl https://your-domain.com/api/test/config
```

### Log Management

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker logs flashgenius-backend-prod
docker logs flashgenius-frontend-prod
docker logs flashgenius-nginx-prod
```

### Backup Strategy

```bash
# MongoDB backup (if using local MongoDB)
docker exec flashgenius-mongodb-prod mongodump --out /backup

# Application logs backup
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Updates and Maintenance

```bash
# Update application
git pull origin main
npm run build
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Update dependencies
npm update
cd frontend && npm update
cd ../backend && npm update
```

## Scaling Considerations

### Horizontal Scaling

```yaml
# Add to docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
    
frontend:
  deploy:
    replicas: 2
```

### Load Balancing

- Use multiple backend instances
- Configure Nginx upstream load balancing
- Implement session affinity if needed

### Database Scaling

- Use MongoDB Atlas auto-scaling
- Implement read replicas for heavy read workloads
- Consider database sharding for large datasets

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   ```

2. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   docker exec -it flashgenius-backend-prod node -e "require('./dist/config/database').connectDatabase()"
   ```

3. **Memory Issues**
   ```bash
   # Check container memory usage
   docker stats
   ```

### Performance Optimization

1. **Enable Redis Caching**
2. **Optimize Database Queries**
3. **Implement CDN for Static Assets**
4. **Use HTTP/2 and Compression**

## Security Checklist

- [ ] SSL/TLS certificate installed and configured
- [ ] Strong JWT secrets generated
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Input validation implemented
- [ ] Database access restricted
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test individual services
4. Review security settings
5. Monitor resource usage

Happy deploying! 🚀