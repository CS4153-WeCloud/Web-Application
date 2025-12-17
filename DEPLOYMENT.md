# Columbia Point2Point Shuttle - Frontend Deployment Guide

## Architecture Overview
This React-based frontend demonstrates the requirements for static file deployment with microservice integration.

## Professor's Requirements Met:

### 1. ✅ UI calls composite microservice endpoints via HTTPS
- **Implementation**: `src/services/apiService.js` contains the ShuttleAPIService class
- **HTTPS Endpoints**: All API calls use HTTPS URLs (configurable via environment variables)
- **Composite Service Integration**: Main API calls go through the composite service at `https://composite-service.columbia-shuttle.com`
- **Example endpoints**:
  - `GET /api/v1/routes` - Fetch all routes
  - `POST /api/v1/routes/{id}/join` - Join a route
  - `POST /api/v1/subscriptions` - Create subscription
  - `GET /api/v1/me/semester-overview` - User dashboard (parallel execution)

### 2. ✅ Static files (HTML, JS, CSS) built with a simple framework
- **Framework**: React (meets "React-lite" requirement)
- **Build Process**: `npm run build` creates optimized static files
- **Static Assets**: All files are generated as static HTML, JS, CSS for Cloud Storage deployment
- **No Server Dependency**: Frontend runs entirely client-side after build

## Deployment Strategy (Matches Assignment Requirements):

### Frontend Deployment
```bash
# Build static files
npm run build

# Deploy to Cloud Storage
gsutil -m cp -r build/* gs://columbia-shuttle-frontend/
gsutil web set -m index.html -e index.html gs://columbia-shuttle-frontend/
```

### Microservice Integration
- **Composite Service**: Deployed on Cloud Run (HTTPS enabled)
- **Atomic Services**: 
  - Auth & User Service: Cloud Run + Cloud SQL
  - Route & Group Service: Compute VM + Cloud SQL 
  - Subscription & Trip Service: Cloud Run/VM + MySQL VM
- **Cross-Origin Requests**: Handled via CORS configuration on services

### Environment Configuration
```bash
# Production environment variables
REACT_APP_COMPOSITE_SERVICE_URL=https://composite-service-abc123.run.app
REACT_APP_AUTH_SERVICE_URL=https://auth-service-def456.run.app
REACT_APP_ROUTE_SERVICE_URL=https://34.123.45.67:443
REACT_APP_SUBSCRIPTION_SERVICE_URL=https://subscription-service-ghi789.run.app
```

## API Integration Highlights:

### HTTPS-First Design
- All API calls use secure HTTPS endpoints
- Environment-based configuration for different deployment stages
- Proper error handling and fallback mechanisms

### Composite Service Pattern
- Frontend primarily calls the composite service
- Composite service orchestrates calls to atomic services
- Demonstrates foreign key validation across services
- Shows parallel execution for complex operations

### RESTful API Compliance
- Supports eTag processing (If-Match headers)
- Query parameters for filtering and pagination
- Proper HTTP status codes (201 Created, 202 Accepted)
- Linked data with relative paths
- Async operations with polling

## File Structure:
```
src/
  ├── App.js              # Main application with service integration
  ├── App.css             # Global styles with blue theme
  ├── services/
  │   └── apiService.js   # HTTPS API service layer
  └── pages/
      └── HomePage.js     # Main shuttle route interface

build/ (generated)        # Static files for deployment
  ├── static/
  │   ├── css/           # Compiled CSS
  │   └── js/            # Compiled JavaScript
  └── index.html         # Main HTML entry point
```

This implementation demonstrates a production-ready frontend that integrates with microservices via HTTPS while maintaining the simplicity required for static file deployment.