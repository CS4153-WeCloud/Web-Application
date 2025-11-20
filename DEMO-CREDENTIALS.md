# Columbia Point2Point Shuttle - Demo Credentials

## Test Account for Development

Use these credentials to test the authentication system:

**Email:** demo@columbia.edu  
**Password:** password

## Features Available After Login:

### 1. Route Management

- **Propose New Routes**: Create route proposals (requires authentication)
- **Join Routes**: Join proposed routes to help them reach minimum member threshold
- **Subscribe to Routes**: Subscribe to active routes for semester-long service

### 2. Profile Management

- **View Profile**: See personal information and activity summary
- **Edit Profile**: Update name, home area, and preferred departure time
- **Activity Stats**: Track joined routes and active subscriptions

### 3. Enhanced Navigation

- **Personalized Menu**: "Hi, [Name]!" greeting in navigation
- **Protected Actions**: Route actions require login (with friendly prompts)
- **Secure Logout**: Clean session management

## Authentication Flow:

### Login Process

1. Click "Login" in navigation
2. Enter demo credentials above
3. System validates with composite service
4. JWT token stored for session management
5. User redirected to authenticated experience

### Signup Process

1. Click "Sign Up" in navigation
2. Fill out registration form:
   - First Name, Last Name
   - Email (must be valid format)
   - Password (min 6 characters)
   - Home Area (e.g., "Flushing, Queens")
   - Preferred Departure Time
3. Account created and auto-login
4. Welcome experience with profile setup

## API Integration:

### Composite Service Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/signup` - User registration
- `GET /api/v1/me/profile` - Get user profile
- `PUT /api/v1/me/profile` - Update user profile

### Security Features

- **JWT Tokens**: Secure session management
- **Authorization Headers**: Bearer token authentication
- **Route Protection**: Login required for sensitive actions
- **Input Validation**: Client and server-side validation

## Demo Scenarios:

### Happy Path Testing

1. **New User Registration**: Test signup flow with form validation
2. **Existing User Login**: Use demo credentials for quick access
3. **Profile Management**: Edit and save profile information
4. **Route Interaction**: Propose, join, and subscribe to routes

### Error Handling

1. **Invalid Login**: Try wrong password to see error handling
2. **Form Validation**: Submit empty forms to test validation
3. **Network Errors**: Handled gracefully with user feedback

This authentication system integrates seamlessly with the Columbia Point2Point shuttle service while maintaining security best practices for microservice architecture.
