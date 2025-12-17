# Columbia Point2Point Shuttle - Frontend

React web application for the Columbia Point2Point Semester Shuttle service with microservices architecture.

## Features

- React 18 with Hooks & Context API
- JWT-based authentication and user profile management
- Route proposal, filtering, and group formation
- Responsive design with Columbia University branding
- Form validation and error handling

## Quick Start

```bash
npm install
cp env.example .env
# Edit .env with your microservice URLs
npm start
```

Open [http://localhost:3000](http://localhost:3000) and login with:
- Email: `demo@columbia.edu`
- Password: `password`

## Environment Variables

```bash
# Development (local)
REACT_APP_COMPOSITE_SERVICE_URL=http://localhost:8080
REACT_APP_AUTH_SERVICE_URL=http://localhost:3001
REACT_APP_ROUTE_SERVICE_URL=http://localhost:3002
REACT_APP_SUBSCRIPTION_SERVICE_URL=http://localhost:3003

# Production (GCP)
REACT_APP_COMPOSITE_SERVICE_URL=https://<cloud-run-composite-url>
REACT_APP_AUTH_SERVICE_URL=https://<cloud-run-auth-url>
REACT_APP_ROUTE_SERVICE_URL=https://<vm-route-ip>:443
REACT_APP_SUBSCRIPTION_SERVICE_URL=https://<cloud-run-subscription-url>
```

## Project Structure

```
src/
├── components/
│   ├── AuthModal.jsx           # Login/Signup modal
│   └── AuthModal.css
├── contexts/
│   └── AuthContext.js          # Authentication state management
├── pages/
│   ├── HomePage.jsx            # Main shuttle route interface
│   ├── UserProfile.jsx         # User profile management
│   └── MyRoutes.jsx
├── services/
│   └── apiService.js           # HTTPS API integration
├── App.js                      # Main application with routing
└── index.js
```

## Building & Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

**Static Hosting** (Recommended): Netlify, Vercel, Firebase, AWS S3, GCP Cloud Storage

**GCP VM with Nginx**:
```bash
sudo apt-get install nginx -y
npm run build
sudo cp -r build/* /var/www/html/
```

Nginx config:
```nginx
server {
    listen 80;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
}
```

**Docker**:
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

## Backend API

### Microservices (via Composite Service on Port 8080)

- **Auth & User Service** (3001): Authentication, registration, profile management
- **Route & Group Service** (3002): Routes, proposals, group formation
- **Subscription & Trip Service** (3003): Semester subscriptions, trip scheduling

### Example API Requests

**Login**:
```bash
POST /api/auth/login
{"email": "student@columbia.edu", "password": "password"}
# Returns JWT token + user object
```

**Get Routes**:
```bash
GET /api/routes
# Returns array of routes with member counts, schedules, status
```

**Propose Route**:
```bash
POST /api/routes
Authorization: Bearer <token>
{
  "from": "Columbia University",
  "to": "Brooklyn Heights, NY",
  "schedule": {"days": ["Monday", "Wednesday"], "morningTime": "08:30"},
  "semester": "Spring 2025"
}
```

For detailed API documentation, see [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

### CORS Configuration

```javascript
app.use(cors({
  origin: ["http://localhost:3000", "http://<your-domain>.com"]
}));
```

## Live Deployment (GCP VM)

**Production URL**: http://34.170.21.219/

**SSH Access**: Go to https://console.cloud.google.com/compute/instances → Project: **WeCloud** → Instance: **frontend-vm** → Click SSH

**Deploy Updates**:
```bash
cd ~/Web-Application
git pull origin main
npm install
npm run build
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/
sudo systemctl reload nginx
```

## Troubleshooting

**Can't connect to microservices**: Check `.env` URLs, verify CORS enabled, test with curl

**Build errors**: `rm -rf node_modules package-lock.json && npm install`

**Page not found on refresh**: Configure server to redirect all routes to `index.html`

## Additional Documentation

- [BACKEND-SETUP.md](./BACKEND-SETUP.md) - Microservices setup and deployment
- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Complete API reference
- [DEMO-CREDENTIALS.md](./DEMO-CREDENTIALS.md) - Test accounts

## License

MIT - Columbia University CS4153 WeCloud Team Project
