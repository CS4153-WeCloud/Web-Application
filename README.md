# Web Application - Frontend

React-based web application for the microservices architecture.

## Demo of the Page on Google Cloud VM
Access this URL for the demo video: https://drive.google.com/file/d/18by95S6iBg8_qLioCvhKD2ylgRO5PMv9/view?usp=drive_link

## Features

- ✅ Modern React 18 with Hooks
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Responsive design
- ✅ Beautiful gradient UI
- ✅ Service health monitoring
- ✅ Error handling and retry logic

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your microservice URLs
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env` file:

```bash
REACT_APP_USER_SERVICE_URL=http://localhost:3001
REACT_APP_ORDER_SERVICE_URL=http://localhost:3002
REACT_APP_NOTIFICATION_SERVICE_URL=http://localhost:3003
```

For production with GCP VMs:
```bash
REACT_APP_USER_SERVICE_URL=http://<user-service-external-ip>:3001
REACT_APP_ORDER_SERVICE_URL=http://<order-service-external-ip>:3002
REACT_APP_NOTIFICATION_SERVICE_URL=http://<notification-service-external-ip>:3003
```

## Pages

### 🏠 Home Page
- Overview of all microservices
- Service status display
- Architecture information

### 👥 Users Page
- List all users from User Service
- Display user details (name, email, phone, status)
- Real-time data fetching
- Error handling

### 📦 Orders Page
- List all orders from Order Service
- Display order details (items, total, status)
- Order status badges
- Date information

### 🔔 Notifications Page
- List all notifications from Notification Service
- Display notification details (type, recipient, message)
- Status tracking
- Timestamp information

## Project Structure

```
web-application/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── UsersPage.js
│   │   ├── OrdersPage.js
│   │   └── NotificationsPage.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env.example
├── package.json
└── README.md
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
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',           // Development
    'http://<your-app-domain>.com'     // Production
  ]
}));
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

## Features to Add

This is a **placeholder application**. Suggested enhancements:

- [ ] User authentication
- [ ] Create/Edit/Delete operations
- [ ] Forms for creating users/orders/notifications
- [ ] Search and filtering
- [ ] Pagination
- [ ] Real-time updates (WebSockets)
- [ ] Dark mode toggle
- [ ] Charts and analytics
- [ ] File uploads
- [ ] Toast notifications
- [ ] Loading skeletons
- [ ] Unit tests with Jest
- [ ] E2E tests with Cypress

## Development Team Notes

- This is a **placeholder/starter application**
- Focus on adding your own features and functionality
- The UI uses modern CSS with gradients and animations
- All pages include error handling and loading states
- The app is fully responsive (mobile, tablet, desktop)
- Service URLs are configurable via environment variables

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

## License

MIT


