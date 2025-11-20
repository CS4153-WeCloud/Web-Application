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

### 🎫 My Subscription Page (In Development by Teammate)

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
- [ ] Offline support with service workers
- [ ] Unit tests with Jest and React Testing Library
- [ ] E2E tests with Cypress

### 🎨 User Experience Enhancements

- [ ] Dark mode toggle
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Progressive Web App (PWA) capabilities
- [ ] Advanced form validation with real-time feedback
- [ ] Toast notifications for better user feedback
- [ ] Loading skeletons for improved perceived performance

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

## License

MIT - Columbia University CS4153 WeCloud Team Project
