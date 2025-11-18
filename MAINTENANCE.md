# Maintenance Guide

This guide covers common maintenance tasks, troubleshooting procedures, and operational tips for the SecretDraw application.

## Table of Contents

1. [Common Tasks](#common-tasks)
2. [Database Management](#database-management)
3. [Troubleshooting](#troubleshooting)
4. [Performance Monitoring](#performance-monitoring)
5. [Security Updates](#security-updates)
6. [Backup & Recovery](#backup--recovery)
7. [User Support](#user-support)

## Common Tasks

### Starting Development Environment

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Database (if running locally)
docker-compose up postgres
```

### Running Tests

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report

# Frontend tests
cd frontend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm run test:e2e           # End-to-end tests
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update package
npm update <package-name>

# Update all packages (careful!)
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

**Best Practice**: Update dependencies regularly but test thoroughly before deploying.

### Database Migrations

**Create a new migration:**
```bash
cd backend
npx prisma migrate dev --name add_user_preferences
```

**Apply migrations to production:**
```bash
npx prisma migrate deploy
```

**Reset database (development only!):**
```bash
npx prisma migrate reset
```

**View database in browser:**
```bash
npx prisma studio
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Environment Variable Management

**Local development:**
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your values
nano backend/.env
```

**Production (Railway):**
```bash
# Set variable
railway variables --service backend set KEY=value

# View all variables
railway variables --service backend

# Delete variable
railway variables --service backend delete KEY
```

## Database Management

### Connecting to Production Database

**Via Railway CLI:**
```bash
railway connect postgres
```

**Via psql directly:**
```bash
psql $DATABASE_URL
```

**Get DATABASE_URL from Railway:**
```bash
railway variables --service postgres | grep DATABASE_URL
```

### Common Database Queries

**View all users:**
```sql
SELECT id, email, name, created_at FROM "User" ORDER BY created_at DESC LIMIT 10;
```

**View all groups:**
```sql
SELECT id, name, organizer_id, draw_date, created_at FROM "Group" ORDER BY created_at DESC;
```

**Count participants in a group:**
```sql
SELECT g.name, COUNT(p.id) as participant_count
FROM "Group" g
LEFT JOIN "Participant" p ON p.group_id = g.id
GROUP BY g.id, g.name;
```

**Find drawings by group:**
```sql
SELECT d.id, d.draw_date, d.is_complete, COUNT(a.id) as assignments
FROM "Drawing" d
LEFT JOIN "Assignment" a ON a.drawing_id = d.id
WHERE d.group_id = 'group-uuid-here'
GROUP BY d.id;
```

### Database Backup

**Manual backup:**
```bash
# Get DATABASE_URL from Railway
export DATABASE_URL="postgresql://..."

# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup (CAREFUL!)
psql $DATABASE_URL < backup_20241118_120000.sql
```

**Automated backups:**
Railway Pro plan includes automatic backups. Free tier does not.

### Database Maintenance

**Vacuum database (optimize):**
```sql
VACUUM ANALYZE;
```

**Check database size:**
```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

**Find slow queries:**
```sql
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Troubleshooting

### Backend Issues

#### Issue: Server won't start

**Symptoms:**
- Error on `npm run dev` or `npm start`
- Port already in use

**Diagnosis:**
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Check environment variables
cat backend/.env

# Check logs
npm run dev
```

**Solutions:**
```bash
# Kill process using port 3001
kill -9 $(lsof -ti:3001)

# Or use different port
export PORT=3002
npm run dev

# Verify DATABASE_URL is set
echo $DATABASE_URL
```

#### Issue: Database connection fails

**Symptoms:**
- "Can't reach database server" error
- Prisma client errors

**Diagnosis:**
```bash
# Test database connection
psql $DATABASE_URL

# Check Prisma client is generated
ls backend/node_modules/.prisma/client
```

**Solutions:**
```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

#### Issue: JWT authentication fails

**Symptoms:**
- Login returns 401
- "Invalid token" errors

**Diagnosis:**
```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Check token expiration
# Decode JWT at jwt.io
```

**Solutions:**
```bash
# Set JWT_SECRET
export JWT_SECRET=$(openssl rand -base64 32)

# Update .env file
echo "JWT_SECRET=$JWT_SECRET" >> backend/.env

# Restart server
npm run dev
```

### Frontend Issues

#### Issue: API calls failing

**Symptoms:**
- Network errors
- CORS errors in console
- 404 on API routes

**Diagnosis:**
```bash
# Check API URL
cat frontend/.env

# Test API directly
curl http://localhost:3001/health

# Check browser console
```

**Solutions:**
```bash
# Verify VITE_API_URL
echo "VITE_API_URL=http://localhost:3001" >> frontend/.env

# Restart dev server (Vite requires restart for env changes)
npm run dev

# Check CORS settings in backend
```

#### Issue: Build fails

**Symptoms:**
- TypeScript errors
- Missing dependencies
- Build process crashes

**Diagnosis:**
```bash
# Check for TypeScript errors
npm run type-check

# Check dependencies
npm install

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

**Solutions:**
```bash
# Fix TypeScript errors
npm run type-check

# Update dependencies
npm update

# Clear Vite cache
rm -rf frontend/.vite
npm run build
```

#### Issue: Hot reload not working

**Symptoms:**
- Changes don't reflect in browser
- Vite server needs manual restart

**Solutions:**
```bash
# Restart dev server
# Ctrl+C then npm run dev

# Clear browser cache
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Database Issues

#### Issue: Migration fails

**Symptoms:**
- Prisma migrate errors
- Schema conflicts

**Diagnosis:**
```bash
# Check migration status
npx prisma migrate status

# View migration history
npx prisma migrate resolve --help
```

**Solutions:**
```bash
# Mark migration as applied (if already applied manually)
npx prisma migrate resolve --applied "20241118_migration_name"

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back "20241118_migration_name"

# Reset and reapply (dev only!)
npx prisma migrate reset
```

#### Issue: Prisma client out of sync

**Symptoms:**
- "Type '...' is not assignable" errors
- Missing models or fields

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Deployment Issues

#### Issue: Railway deployment fails

**Symptoms:**
- Build errors in Railway logs
- Deployment crashes

**Diagnosis:**
```bash
# Check Railway logs
railway logs --service backend

# Check build command
# In Railway dashboard → Service → Settings
```

**Solutions:**
```bash
# Ensure all dependencies are in package.json (not devDependencies)
# Move TypeScript to dependencies:
npm install --save typescript

# Add build script to package.json
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js"
}

# Redeploy
railway up --service backend
```

#### Issue: Environment variables not working

**Symptoms:**
- App crashes on Railway
- "undefined" errors in logs

**Solutions:**
```bash
# Set variables in Railway
railway variables --service backend set JWT_SECRET=...

# Redeploy (required for new variables)
railway up --service backend

# Verify variables are set
railway variables --service backend
```

## Performance Monitoring

### Backend Performance

**Monitor response times:**
```bash
# Add Morgan logging middleware
npm install morgan
```

```typescript
// In server.ts
import morgan from 'morgan';
app.use(morgan('combined'));
```

**Database query performance:**
```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**Memory usage:**
```bash
# Check Node.js memory
node --max-old-space-size=4096 dist/server.js

# Monitor in Railway
# Dashboard → Service → Metrics
```

### Frontend Performance

**Build size analysis:**
```bash
npm run build
npm run preview

# Analyze bundle
npx vite-bundle-visualizer
```

**Lighthouse audit:**
```bash
# Chrome DevTools → Lighthouse → Run audit
# Or use CLI:
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

**Monitor bundle size:**
```bash
# Check build output
npm run build

# dist/assets should be < 500KB for main bundle
ls -lh frontend/dist/assets/
```

## Security Updates

### Dependency Updates

**Check for vulnerabilities:**
```bash
npm audit

# Fix automatically
npm audit fix

# Fix with breaking changes (careful!)
npm audit fix --force
```

**Update specific packages:**
```bash
# Update React
npm install react@latest react-dom@latest

# Update Express
npm install express@latest
```

### Security Best Practices

**Regular tasks:**
- [ ] Weekly: Run `npm audit` and fix critical issues
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Review and rotate secrets (JWT_SECRET, etc.)
- [ ] Yearly: Security audit of codebase

**Password policy:**
- Minimum 8 characters
- Bcrypt with 12 rounds
- Consider password strength checker

**Rate limiting:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Backup & Recovery

### Backup Strategy

**Database:**
- Railway Pro: Automatic daily backups
- Railway Free: Manual backups recommended

**Manual backup script:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Backup database
railway run --service postgres pg_dump > $BACKUP_DIR/db_$DATE.sql

# Backup environment variables
railway variables --service backend > $BACKUP_DIR/env_backend_$DATE.txt
railway variables --service frontend > $BACKUP_DIR/env_frontend_$DATE.txt

echo "Backup completed: $DATE"
```

**Schedule with cron:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Procedures

**Restore database:**
```bash
# CAUTION: This will overwrite existing data!
railway connect postgres < backups/db_20241118_020000.sql
```

**Restore environment variables:**
```bash
# Manually set from backup file
cat backups/env_backend_20241118_020000.txt
railway variables --service backend set KEY=value
```

**Rollback deployment:**
```bash
# Via Railway dashboard
# Deployments → Previous deployment → Redeploy

# Via CLI
railway rollback <deployment-id>
```

## User Support

### Common User Issues

#### Issue: "I didn't receive my assignment email"

**Troubleshooting:**
1. Check spam folder
2. Verify email address in participant list
3. Check backend logs for email errors
4. Resend assignment

**Query to check email status:**
```sql
SELECT p.email, a.notification_sent_at
FROM "Assignment" a
JOIN "Participant" p ON p.id = a.giver_id
WHERE a.drawing_id = 'drawing-uuid';
```

#### Issue: "The draw says it's impossible"

**Troubleshooting:**
1. Check constraints (couples + exclusions)
2. Verify participant count (minimum 3)
3. Look for over-constrained scenarios

**Example over-constrained scenario:**
- 4 people: A-B couple, C-D couple
- Impossible to draw (everyone excluded)

#### Issue: "I can't see my group"

**Troubleshooting:**
1. Verify user is logged in
2. Check group membership
3. Verify group ID in URL

**Query:**
```sql
SELECT g.name, p.email
FROM "Group" g
JOIN "Participant" p ON p.group_id = g.id
WHERE g.id = 'group-uuid';
```

### Admin Tools

**View all groups:**
```sql
SELECT id, name, created_at,
       (SELECT COUNT(*) FROM "Participant" p WHERE p.group_id = g.id) as participants
FROM "Group" g
ORDER BY created_at DESC;
```

**Delete test data:**
```sql
-- CAREFUL: Only in development!
DELETE FROM "Assignment";
DELETE FROM "Drawing";
DELETE FROM "Participant";
DELETE FROM "Group";
DELETE FROM "User" WHERE email LIKE '%test%';
```

**Create admin user manually:**
```sql
-- Password: 'password' (bcrypt with 12 rounds)
INSERT INTO "User" (id, email, name, password_hash, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@secretdraw.com',
  'Admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JwLkN5F5I8c9w8Y7G',
  NOW(),
  NOW()
);
```

## Health Checks

**Backend health endpoint:**
```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-18T12:00:00.000Z",
  "database": "connected"
}
```

**Production health check:**
```bash
curl https://your-backend.railway.app/health
```

## Logging Best Practices

**Backend logging levels:**
- **ERROR**: Application errors, crashes
- **WARN**: Warnings, potential issues
- **INFO**: General application flow
- **DEBUG**: Detailed debugging information

**Log important events:**
- User registration
- Group creation
- Drawing execution
- Email sends (success/failure)
- Authentication failures

**Example:**
```typescript
logger.info('User registered', { userId, email });
logger.error('Email send failed', { error, recipient });
```

## Monitoring Checklist

**Daily:**
- [ ] Check Railway deployment status
- [ ] Review error logs for critical issues

**Weekly:**
- [ ] Review performance metrics
- [ ] Check disk space and database size
- [ ] Review user support tickets

**Monthly:**
- [ ] Update dependencies
- [ ] Review and optimize database queries
- [ ] Check for security updates
- [ ] Review and update documentation

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup testing
- [ ] Disaster recovery drill

## Additional Resources

- [Node.js Production Checklist](https://github.com/goldbergyoni/nodebestpractices)
- [Railway Status Page](https://status.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting)

---

**Last Updated**: 2025-11-18
**Need Help?** Open an issue on GitHub or contact the team.
