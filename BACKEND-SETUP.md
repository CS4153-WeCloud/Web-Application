# Columbia Point2Point Backend Setup Guide

Complete setup guide for the Columbia Point2Point microservices backend architecture.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────────┐
│   Frontend      │────│  Composite Service   │
│   React App     │    │     (Port 8080)      │
│                 │    │                      │
└─────────────────┘    └──────────┬───────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
         ┌──────────▼──────────┐ │  ┌──────────▼──────────┐
         │  Auth & User        │ │  │ Subscription &      │
         │  Service            │ │  │ Trip Service        │
         │  (Port 3001)        │ │  │ (Port 3003)         │
         └─────────────────────┘ │  └─────────────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Route & Group      │
                      │  Service            │
                      │  (Port 3002)        │
                      └─────────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 13.0
- **Git**

### Development Tools (Recommended)

- **Postman** for API testing
- **pgAdmin** or **DBeaver** for database management
- **VS Code** with REST Client extension
- **Docker** (optional, for containerized development)

## Quick Start

### 1. Clone Backend Repositories

```bash
# Create backend workspace
mkdir columbia-point2point-backend
cd columbia-point2point-backend

# Clone each microservice (replace with actual repo URLs)
git clone https://github.com/CS4153-WeCloud/composite-service.git
git clone https://github.com/CS4153-WeCloud/auth-user-service.git
git clone https://github.com/CS4153-WeCloud/route-group-service.git
git clone https://github.com/CS4153-WeCloud/subscription-trip-service.git
```

### 2. Database Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create databases
sudo -u postgres psql
CREATE DATABASE columbia_auth;
CREATE DATABASE columbia_routes;
CREATE DATABASE columbia_subscriptions;
CREATE DATABASE columbia_composite;

# Create user
CREATE USER columbia_dev WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE columbia_auth TO columbia_dev;
GRANT ALL PRIVILEGES ON DATABASE columbia_routes TO columbia_dev;
GRANT ALL PRIVILEGES ON DATABASE columbia_subscriptions TO columbia_dev;
GRANT ALL PRIVILEGES ON DATABASE columbia_composite TO columbia_dev;
\q
```

### 3. Environment Configuration

#### Composite Service (.env)

```bash
cd composite-service
cp .env.example .env
```

```env
# Composite Service Configuration
PORT=8080
NODE_ENV=development

# Database
DATABASE_URL=postgresql://columbia_dev:dev_password@localhost:5432/columbia_composite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=7d

# Microservice URLs
AUTH_SERVICE_URL=http://localhost:3001
ROUTE_SERVICE_URL=http://localhost:3002
SUBSCRIPTION_SERVICE_URL=http://localhost:3003

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Auth & User Service (.env)

```bash
cd ../auth-user-service
cp .env.example .env
```

```env
# Auth & User Service Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://columbia_dev:dev_password@localhost:5432/columbia_auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=7d

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Password Hashing
BCRYPT_ROUNDS=12
```

#### Route & Group Service (.env)

```bash
cd ../route-group-service
cp .env.example .env
```

```env
# Route & Group Service Configuration
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://columbia_dev:dev_password@localhost:5432/columbia_routes

# JWT Configuration (for token validation)
JWT_SECRET=your-super-secret-jwt-key-for-development

# External APIs (if needed)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Subscription & Trip Service (.env)

```bash
cd ../subscription-trip-service
cp .env.example .env
```

```env
# Subscription & Trip Service Configuration
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=postgresql://columbia_dev:dev_password@localhost:5432/columbia_subscriptions

# JWT Configuration (for token validation)
JWT_SECRET=your-super-secret-jwt-key-for-development

# Payment Integration (future)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Install Dependencies

```bash
# Install dependencies for all services
cd composite-service && npm install && cd ..
cd auth-user-service && npm install && cd ..
cd route-group-service && npm install && cd ..
cd subscription-trip-service && npm install && cd ..
```

### 5. Database Migration

```bash
# Run migrations for each service
cd auth-user-service
npm run migrate:up

cd ../route-group-service
npm run migrate:up

cd ../subscription-trip-service
npm run migrate:up

cd ../composite-service
npm run migrate:up
```

### 6. Seed Development Data

```bash
# Seed test data
cd auth-user-service
npm run seed:dev

cd ../route-group-service
npm run seed:dev

cd ../subscription-trip-service
npm run seed:dev
```

### 7. Start Services

Open 4 terminal windows/tabs:

```bash
# Terminal 1 - Auth Service
cd auth-user-service
npm run dev

# Terminal 2 - Route Service
cd route-group-service
npm run dev

# Terminal 3 - Subscription Service
cd subscription-trip-service
npm run dev

# Terminal 4 - Composite Service
cd composite-service
npm run dev
```

## Development Workflow

### Testing API Endpoints

#### Health Checks

```bash
# Check all services are running
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:8080/health
```

#### Authentication Flow

```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@columbia.edu",
    "password": "testpassword",
    "firstName": "Test",
    "lastName": "User",
    "homeArea": "Manhattan, NY"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@columbia.edu",
    "password": "testpassword"
  }'

# Save the token from login response
export TOKEN="your-jwt-token-here"

# Test protected endpoint
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

#### Route Management

```bash
# Get all routes
curl http://localhost:3002/api/routes

# Create new route (requires auth)
curl -X POST http://localhost:3002/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "from": "Columbia University",
    "to": "Astoria, Queens",
    "schedule": {
      "days": ["Monday", "Wednesday", "Friday"],
      "morningTime": "08:00",
      "eveningTime": "18:00"
    },
    "semester": "Spring 2025",
    "estimatedCost": 110,
    "description": "Tri-weekly shuttle to Astoria"
  }'

# Join a route
curl -X POST http://localhost:3002/api/routes/1/join \
  -H "Authorization: Bearer $TOKEN"
```

### Database Management

#### Connect to databases

```bash
# Using psql
psql postgresql://columbia_dev:dev_password@localhost:5432/columbia_auth
psql postgresql://columbia_dev:dev_password@localhost:5432/columbia_routes
psql postgresql://columbia_dev:dev_password@localhost:5432/columbia_subscriptions
```

#### Common queries

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- View all routes
SELECT * FROM routes ORDER BY created_at DESC;

-- Check route membership
SELECT r.from_location, r.to_location, COUNT(rm.user_id) as members
FROM routes r
LEFT JOIN route_members rm ON r.id = rm.route_id
GROUP BY r.id, r.from_location, r.to_location;
```

## Deployment

### Docker Compose (Development)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: columbia_dev
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: columbia_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  auth-service:
    build: ./auth-user-service
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://columbia_dev:dev_password@postgres:5432/columbia_dev
    depends_on:
      - postgres

  route-service:
    build: ./route-group-service
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://columbia_dev:dev_password@postgres:5432/columbia_dev
    depends_on:
      - postgres

  subscription-service:
    build: ./subscription-trip-service
    ports:
      - "3003:3003"
    environment:
      DATABASE_URL: postgresql://columbia_dev:dev_password@postgres:5432/columbia_dev
    depends_on:
      - postgres

  composite-service:
    build: ./composite-service
    ports:
      - "8080:8080"
    environment:
      AUTH_SERVICE_URL: http://auth-service:3001
      ROUTE_SERVICE_URL: http://route-service:3002
      SUBSCRIPTION_SERVICE_URL: http://subscription-service:3003
    depends_on:
      - auth-service
      - route-service
      - subscription-service

volumes:
  postgres_data:
```

Start with Docker:

```bash
docker-compose up -d
```

### Google Cloud Platform Deployment

#### Cloud Run (for stateless services)

```bash
# Build and deploy each service
gcloud builds submit --tag gcr.io/your-project/auth-service ./auth-user-service
gcloud run deploy auth-service --image gcr.io/your-project/auth-service --port 3001

gcloud builds submit --tag gcr.io/your-project/route-service ./route-group-service
gcloud run deploy route-service --image gcr.io/your-project/route-service --port 3002
```

#### Cloud SQL (for database)

```bash
# Create PostgreSQL instance
gcloud sql instances create columbia-db --database-version=POSTGRES_15 \
  --tier=db-f1-micro --region=us-central1
```

## Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Check what's running on ports
   lsof -i :3001
   lsof -i :3002
   lsof -i :3003
   lsof -i :8080
   ```

2. **Database connection errors**

   ```bash
   # Check PostgreSQL is running
   brew services list | grep postgresql

   # Test connection
   pg_isready -h localhost -p 5432
   ```

3. **JWT token issues**

   - Ensure all services use the same JWT_SECRET
   - Check token expiration
   - Verify Authorization header format: `Bearer <token>`

4. **CORS errors**
   - Add frontend URL to CORS configuration
   - Check preflight OPTIONS requests

### Logs and Debugging

```bash
# View service logs
tail -f auth-user-service/logs/app.log
tail -f route-group-service/logs/app.log

# Debug mode
NODE_ENV=development DEBUG=* npm run dev
```

## Testing

### Unit Tests

```bash
# Run tests for each service
cd auth-user-service && npm test
cd route-group-service && npm test
cd subscription-trip-service && npm test
cd composite-service && npm test
```

### Integration Tests

```bash
# End-to-end API tests
npm run test:integration
```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

## API Documentation

For detailed API documentation with interactive testing, visit:

- Swagger UI: http://localhost:8080/api-docs (when composite service is running)
- Each service also provides OpenAPI specs at `/api-docs`

## Contributing

1. Create feature branches from `main`
2. Follow conventional commit messages
3. Run tests before submitting PRs
4. Update API documentation if endpoints change
5. Ensure environment variables are documented

## Support

For backend development questions:

- Check the troubleshooting section
- Review service logs
- Test endpoints with Postman
- Consult the API documentation
