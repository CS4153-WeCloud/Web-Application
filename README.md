# Columbia Point2Point Shuttle - Frontend

React-based web application for the Columbia Point2Point Semester Shuttle service, integrating with microservices architecture.

## Demo of the Page on Google Cloud VM

Access this URL for the demo video: https://drive.google.com/file/d/18by95S6iBg8_qLioCvhKD2ylgRO5PMv9/view?usp=drive_link

## Features

- ✅ Modern React 18 with Hooks & Context API
- ✅ React Router for navigation
- ✅ JWT-based authentication system
- ✅ Route proposal and management system
- ✅ Real-time route filtering and search
- ✅ User profile management
- ✅ Responsive mobile-first design
- ✅ Columbia University branding
- ✅ Microservice integration via HTTPS
- ✅ Form validation and error handling

## Quick Start

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp env.example .env
# Edit .env with your Columbia Point2Point microservice URLs
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Use demo credentials to test authentication:
   - Email: `demo@columbia.edu`
   - Password: `password`

## Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Columbia Point2Point Shuttle Microservice URLs
REACT_APP_COMPOSITE_SERVICE_URL=https://composite-service.columbia-shuttle.com
REACT_APP_AUTH_SERVICE_URL=https://auth-service.columbia-shuttle.com
REACT_APP_ROUTE_SERVICE_URL=https://route-service.columbia-shuttle.com
REACT_APP_SUBSCRIPTION_SERVICE_URL=https://subscription-service.columbia-shuttle.com
```

For development with local services:

```bash
REACT_APP_COMPOSITE_SERVICE_URL=http://localhost:8080
REACT_APP_AUTH_SERVICE_URL=http://localhost:3001
REACT_APP_ROUTE_SERVICE_URL=http://localhost:3002
REACT_APP_SUBSCRIPTION_SERVICE_URL=http://localhost:3003
```

For production deployment on GCP:

```bash
REACT_APP_COMPOSITE_SERVICE_URL=https://<cloud-run-composite-service-url>
REACT_APP_AUTH_SERVICE_URL=https://<cloud-run-auth-service-url>
REACT_APP_ROUTE_SERVICE_URL=https://<vm-route-service-ip>:443
REACT_APP_SUBSCRIPTION_SERVICE_URL=https://<cloud-run-subscription-service-url>
```

## Application Pages

### 🏠 Home Page

- Columbia Point2Point shuttle service overview
- Route proposal system with comprehensive form validation
- Active and proposed route listings with filtering
- Interactive route cards showing member counts and schedules
- Authentication-protected actions (join routes, propose routes)
- Real-time route data via composite service API

### 👤 User Profile

- Personal information management (name, home area, preferred departure time)
- Edit mode with validation and error handling
- Activity summary (joined routes, active subscriptions)
- Secure profile updates via authenticated API calls

### 🔐 Authentication System

- Unified login/signup modal with mode switching
- JWT token-based authentication with session persistence
- Form validation (email format, password strength, required fields)
- Password visibility toggle and confirmation matching
- Integration with Auth & User Service via composite service

## Project Structure

```
columbia-point2point-web/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx        # Login/Signup modal
│   │   └── AuthModal.css        # Authentication modal styles
│   ├── contexts/
│   │   └── AuthContext.js       # Authentication state management
│   ├── pages/
│   │   ├── HomePage.jsx         # Main shuttle route interface
│   │   ├── HomePage.css         # HomePage component styles
│   │   ├── UserProfile.jsx      # User profile management
│   │   ├── UserProfile.css      # UserProfile component styles
│   │   ├── NotificationsPage.js # Legacy - to be removed
│   │   ├── OrdersPage.js        # Legacy - to be removed
│   │   └── UsersPage.js         # Legacy - to be removed
│   ├── services/
│   │   └── apiService.js        # HTTPS API integration layer
│   ├── App.js                   # Main application with routing
│   ├── App.css                  # Global styles and navigation
│   ├── index.js                 # React application entry point
│   └── index.css                # Global CSS reset and base styles
├── env.example                  # Environment variables template
├── package.json                 # Dependencies and build scripts
├── BACKEND-SETUP.md             # Complete backend development guide
├── API-DOCUMENTATION.md         # Detailed API reference
├── DEMO-CREDENTIALS.md          # Test account information
├── DEPLOYMENT.md                # Cloud deployment guide
├── STEP3-ROUTE-PROPOSAL.md      # Route proposal feature docs
├── STEP4-AUTHENTICATION.md      # Authentication system docs
└── README.md                    # This file
```

## Building for Production

```bash
# Create production build
npm run build

# The build folder will contain optimized static files
# Deploy these files to any static hosting service
```

## Deployment Options

### Option 1: Static Hosting (Recommended)

Deploy to:

- **Netlify** - Drag & drop `build/` folder
- **Vercel** - Import from GitHub
- **Firebase Hosting** - `firebase deploy`
- **AWS S3 + CloudFront**
- **GCP Cloud Storage + CDN**

### Option 2: GCP VM with Nginx

```bash
# SSH into VM
gcloud compute ssh web-app-vm --zone=us-central1-a

# Install Nginx
sudo apt-get update
sudo apt-get install nginx -y

# Clone repo and build
git clone <your-repo-url>
cd web-application
npm install
npm run build

# Copy build to Nginx
sudo cp -r build/* /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx config:

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

```bash
# Restart Nginx
sudo systemctl restart nginx
```

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }
}
```

Build and run:

```bash
docker build -t web-app .
docker run -p 80:80 web-app
```

## Backend API Documentation

### Microservice Architecture

The Columbia Point2Point system follows a microservice architecture with the following services:

#### 1. Composite Service (Port 8080)

**Main orchestrator service that coordinates between all microservices**

```bash
# Health check
GET /health

# Get all routes with member information
GET /api/routes
```

#### 2. Auth & User Service (Port 3001)

**Handles user authentication, registration, and profile management**

```bash
# Authentication endpoints
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout

# User management
GET /api/users/profile
PUT /api/users/profile
GET /api/users/:id
```

#### 3. Route & Group Service (Port 3002)

**Manages shuttle routes, proposals, and group formation**

```bash
# Route management
GET /api/routes
POST /api/routes
PUT /api/routes/:id
DELETE /api/routes/:id

# Group management
POST /api/routes/:id/join
DELETE /api/routes/:id/leave
GET /api/routes/:id/members
```

#### 4. Subscription & Trip Service (Port 3003)

**Handles semester subscriptions and daily trip scheduling**

```bash
# Subscription management
POST /api/subscriptions
GET /api/subscriptions/user/:userId
PUT /api/subscriptions/:id
DELETE /api/subscriptions/:id

# Trip management
GET /api/trips
POST /api/trips
PUT /api/trips/:id/status
```

### API Request/Response Examples

#### User Authentication

**POST /api/auth/login**

```json
// Request
{
  "email": "student@columbia.edu",
  "password": "securepassword"
}

// Response (200)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@columbia.edu",
    "firstName": "John",
    "lastName": "Doe",
    "homeArea": "Flushing, Queens",
    "preferredDepartureTime": "08:00"
  }
}

// Error Response (401)
{
  "success": false,
  "error": "Invalid credentials"
}
```

**POST /api/auth/register**

```json
// Request
{
  "email": "newstudent@columbia.edu",
  "password": "securepassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "homeArea": "Jersey City, NJ",
  "preferredDepartureTime": "08:30"
}

// Response (201)
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "email": "newstudent@columbia.edu",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

#### Route Management

**GET /api/routes**

```json
// Response (200)
{
  "success": true,
  "routes": [
    {
      "id": 1,
      "from": "Columbia University",
      "to": "Flushing, Queens",
      "status": "active",
      "schedule": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "morningTime": "08:00",
        "eveningTime": "18:30"
      },
      "semester": "Fall 2025",
      "currentMembers": 15,
      "requiredMembers": 15,
      "estimatedCost": 120,
      "description": "Daily shuttle service between Columbia and Flushing",
      "createdBy": 1,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**POST /api/routes**

```json
// Request (requires Authorization header)
{
  "from": "Columbia University",
  "to": "Brooklyn Heights, NY",
  "schedule": {
    "days": ["Monday", "Wednesday", "Friday"],
    "morningTime": "08:30",
    "eveningTime": "17:00"
  },
  "semester": "Spring 2025",
  "estimatedCost": 100,
  "description": "Tri-weekly shuttle to Brooklyn Heights"
}

// Response (201)
{
  "success": true,
  "route": {
    "id": 3,
    "from": "Columbia University",
    "to": "Brooklyn Heights, NY",
    "status": "proposed",
    "currentMembers": 1,
    "requiredMembers": 15,
    // ... other fields
  }
}
```

#### Join Route

**POST /api/routes/:id/join**

```json
// Request (requires Authorization header)
{
  "userId": 2
}

// Response (200)
{
  "success": true,
  "message": "Successfully joined route",
  "route": {
    "id": 3,
    "currentMembers": 2,
    // ... updated route data
  }
}
```

### Authentication Flow

1. **Frontend sends login request** to Auth Service
2. **Auth Service validates credentials** against database
3. **JWT token generated** with user information and expiration
4. **Frontend stores token** in localStorage
5. **Subsequent requests include** `Authorization: Bearer <token>` header
6. **Services validate token** before processing protected endpoints

### Database Schema Requirements

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  home_area VARCHAR(255),
  preferred_departure_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Routes Table

```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  status ENUM('proposed', 'active', 'completed', 'cancelled') DEFAULT 'proposed',
  schedule_days JSON NOT NULL,
  morning_time TIME NOT NULL,
  evening_time TIME NOT NULL,
  semester VARCHAR(50) NOT NULL,
  current_members INT DEFAULT 1,
  required_members INT DEFAULT 15,
  estimated_cost DECIMAL(10,2),
  description TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Route Members Table

```sql
CREATE TABLE route_members (
  id SERIAL PRIMARY KEY,
  route_id INT REFERENCES routes(id),
  user_id INT REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, user_id)
);
```

## CORS Configuration

Make sure your microservices have CORS enabled:

```javascript
// In each microservice
const cors = require("cors");
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Development
      "http://<your-app-domain>.com", // Production
    ],
  })
);
```

## Google Cloud VM Access Guide 🌐

1. **View the Live Frontend:** The production frontend is hosted on a Google Cloud Compute Engine VM. URL: http://34.170.21.219/
2. **SSH into the VM:**

- Go to 👉 https://console.cloud.google.com/compute/instances
- Select the project name: WeCloud
- Locate the instance named frontend-vm
- Click the SSH button in the right column — it opens a browser terminal.
- You’re now inside the VM (Ubuntu 22.04 LTS running Nginx).

- **💡 If you don’t see the SSH button:**
  Ask the VM owner (Jessica Liu) to add your Google account under
  IAM & Admin → IAM → Grant Access → Role: Compute Instance Admin (v1).

3. **Deploying Code Changes**: Whenever new commits are merged into the repo, follow these steps on the VM:

```
# 1. SSH into the VM
cd ~/Web-Application

# 2. Pull the latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Rebuild the production bundle
npm run build

# 5. Redeploy to Nginx
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/
sudo systemctl reload nginx
```

After a few seconds, the updated site will appear at http://34.170.21.219/

## Troubleshooting

### Can't connect to microservices

1. **Check service URLs** in `.env` file
2. **Verify CORS** is enabled on backend services
3. **Check firewall rules** allow traffic on microservice ports
4. **Test endpoints** directly with curl/Postman

Example test:

```bash
curl http://localhost:3001/api/users
curl http://localhost:3002/api/orders
curl http://localhost:3003/api/notifications
```

### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Page not found on refresh (when deployed)

Configure your web server to redirect all routes to `index.html` (see Nginx config above)

## Future Enhancements

The following features are planned or in development:

### 🎫 My Subscription Page

- [ ] Current semester subscriptions display
- [ ] Upcoming trip schedules (morning/evening)
- [ ] Trip cancellation functionality
- [ ] Subscription status and payment information
- [ ] Integration with Subscription & Trip Service

### 🔧 Technical Improvements

- [ ] Real-time route updates (WebSockets)
- [ ] Advanced route search and filtering
- [ ] Seat availability tracking
- [ ] Payment integration for subscriptions
- [ ] Trip history and analytics
- [ ] Email/SMS notifications for trip updates
- [ ] Unit tests with Jest and React Testing Library

## Key Features Implemented

### 🚌 Route Management System

- **Route Proposals**: Comprehensive form for proposing new shuttle routes
- **Group Formation**: Users can join proposed routes to reach minimum member threshold
- **Route Filtering**: Filter by all, proposed, or active routes
- **Route Details**: Schedule, member count, cost estimation, contact information

### 🔐 Authentication & User Management

- **JWT Authentication**: Secure token-based authentication system
- **Session Persistence**: Maintains login state across browser sessions
- **Profile Management**: Users can update personal information and preferences
- **Protected Actions**: Authentication required for route proposals and joining

### 🎨 User Experience

- **Columbia Branding**: Custom blue color scheme matching Columbia University
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Real-time Validation**: Form validation with immediate user feedback
- **Loading States**: Proper loading indicators and error handling
- **Text-only Navigation**: Clean, emoji-enhanced navigation buttons

### 🏗️ Architecture & Integration

- **Microservice Ready**: Integrates with composite service architecture
- **HTTPS API Calls**: Secure communication with backend services
- **Component Separation**: JSX and CSS files separated for better maintainability
- **Context API**: Centralized state management for authentication

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The app is optimized for performance:

- Code splitting with React Router
- Production build minification
- Gzip compression (when served via Nginx)
- Lazy loading for images

## Scripts

```bash
npm start       # Start development server
npm run build   # Create production build
npm test        # Run tests
npm run eject   # Eject from Create React App (careful!)
```

## Demo & Testing

### Authentication

Use these test credentials:

- **Email**: `demo@columbia.edu`
- **Password**: `password`

### Route Features

- Browse existing shuttle routes (Columbia ↔ Flushing, Jersey City, Brooklyn Heights, Astoria)
- Filter routes by status (All, Proposed, Active)
- Propose new routes with detailed form validation
- Join proposed routes (authentication required)
- Subscribe to active routes (authentication required)

### API Integration

The frontend integrates with the Columbia Point2Point microservice architecture:

- **Composite Service**: Main orchestrator service
- **Auth & User Service**: User management and authentication
- **Route & Group Service**: Route proposals and member management
- **Subscription & Trip Service**: Semester subscriptions and daily trips

## Additional Documentation

For backend developers, see these comprehensive guides:

### 📋 [BACKEND-SETUP.md](./BACKEND-SETUP.md)

Complete setup guide for the Columbia Point2Point microservices backend:

- Architecture overview with service interaction diagrams
- Step-by-step local development environment setup
- Database configuration and migration scripts
- Docker and GCP deployment instructions
- Troubleshooting guide and common issues

### 📚 [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

Detailed API reference documentation:

- Complete endpoint specifications for all microservices
- Request/response examples with actual JSON payloads
- Authentication flow and JWT token handling
- Database schema definitions and relationships
- Postman collection and cURL testing examples
- Error handling and validation rules

## License

MIT - Columbia University CS4153 WeCloud Team Project
