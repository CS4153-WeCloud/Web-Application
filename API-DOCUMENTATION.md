# Columbia Point2Point API Documentation

Complete API reference for the Columbia Point2Point microservices architecture.

## Base URLs

- **Development**: http://localhost:8080 (Composite Service)
- **Production**: https://composite-service.columbia-shuttle.com

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": {...},          // Present on success
  "error": "message",     // Present on error
  "timestamp": "2025-11-19T10:30:00Z"
}
```

## Error Codes

| Code | Message               | Description               |
| ---- | --------------------- | ------------------------- |
| 400  | Bad Request           | Invalid request data      |
| 401  | Unauthorized          | Authentication required   |
| 403  | Forbidden             | Insufficient permissions  |
| 404  | Not Found             | Resource not found        |
| 409  | Conflict              | Resource already exists   |
| 422  | Validation Error      | Request validation failed |
| 500  | Internal Server Error | Server error              |

---

# Auth & User Service Endpoints

## Authentication

### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "student@columbia.edu",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "homeArea": "Flushing, Queens",
  "preferredDepartureTime": "08:00"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@columbia.edu",
      "firstName": "John",
      "lastName": "Doe",
      "homeArea": "Flushing, Queens",
      "preferredDepartureTime": "08:00",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**

- `email`: Must be valid Columbia email (@columbia.edu)
- `password`: Minimum 8 characters
- `firstName`, `lastName`: Required, max 100 characters
- `homeArea`: Optional, max 255 characters
- `preferredDepartureTime`: Optional, HH:MM format

### POST /api/auth/login

Authenticate existing user.

**Request Body:**

```json
{
  "email": "student@columbia.edu",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@columbia.edu",
      "firstName": "John",
      "lastName": "Doe",
      "homeArea": "Flushing, Queens",
      "preferredDepartureTime": "08:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/refresh

Refresh JWT token.

**Headers:** `Authorization: Bearer <current_token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/logout

Logout user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## User Management

### GET /api/users/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@columbia.edu",
      "firstName": "John",
      "lastName": "Doe",
      "homeArea": "Flushing, Queens",
      "preferredDepartureTime": "08:00",
      "joinedRoutes": 2,
      "activeSubscriptions": 1,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-20T14:30:00Z"
    }
  }
}
```

### PUT /api/users/profile

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "homeArea": "Jersey City, NJ",
  "preferredDepartureTime": "08:30"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@columbia.edu",
      "firstName": "John",
      "lastName": "Smith",
      "homeArea": "Jersey City, NJ",
      "preferredDepartureTime": "08:30",
      "updatedAt": "2025-01-20T15:45:00Z"
    }
  }
}
```

### GET /api/users/:id

Get user by ID (public profile).

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "homeArea": "Flushing, Queens",
      "joinedAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

# Route & Group Service Endpoints

## Route Management

### GET /api/routes

Get all routes with optional filtering.

**Query Parameters:**

- `status`: Filter by status (proposed, active, completed)
- `semester`: Filter by semester (e.g., "Fall 2025")
- `from`: Filter by origin location
- `to`: Filter by destination location
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Example:** `GET /api/routes?status=active&semester=Fall%202025`

**Response (200):**

```json
{
  "success": true,
  "data": {
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
        "createdBy": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-20T14:30:00Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /api/routes/:id

Get specific route details.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "route": {
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
      "createdBy": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "members": [
        {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "homeArea": "Flushing, Queens",
          "joinedAt": "2025-01-15T10:00:00Z"
        }
      ],
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### POST /api/routes

Create new route proposal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
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
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "route": {
      "id": 3,
      "from": "Columbia University",
      "to": "Brooklyn Heights, NY",
      "status": "proposed",
      "schedule": {
        "days": ["Monday", "Wednesday", "Friday"],
        "morningTime": "08:30",
        "eveningTime": "17:00"
      },
      "semester": "Spring 2025",
      "currentMembers": 1,
      "requiredMembers": 15,
      "estimatedCost": 100,
      "description": "Tri-weekly shuttle to Brooklyn Heights",
      "createdBy": 2,
      "createdAt": "2025-01-20T16:00:00Z"
    }
  }
}
```

**Validation Rules:**

- `from`, `to`: Required, max 255 characters
- `schedule.days`: Array of valid days (Monday-Sunday)
- `schedule.morningTime`, `schedule.eveningTime`: HH:MM format
- `semester`: Required, format "Season YYYY"
- `estimatedCost`: Positive number
- `description`: Optional, max 1000 characters

### PUT /api/routes/:id

Update route (only by creator or admin).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (partial update)

```json
{
  "description": "Updated description",
  "estimatedCost": 110
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "route": {
      // Updated route object
    }
  }
}
```

### DELETE /api/routes/:id

Delete route (only by creator or admin).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Route deleted successfully"
  }
}
```

## Group Management

### POST /api/routes/:id/join

Join a route.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Successfully joined route",
    "route": {
      "id": 3,
      "currentMembers": 2
      // ... other route data
    }
  }
}
```

### DELETE /api/routes/:id/leave

Leave a route.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Successfully left route",
    "route": {
      "id": 3,
      "currentMembers": 1
      // ... other route data
    }
  }
}
```

### GET /api/routes/:id/members

Get route members.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "homeArea": "Flushing, Queens",
        "preferredDepartureTime": "08:00",
        "joinedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

# Subscription & Trip Service Endpoints

## Subscription Management

### POST /api/subscriptions

Create semester subscription for active route.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "routeId": 1,
  "semester": "Fall 2025",
  "paymentMethod": "credit_card"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "userId": 1,
      "routeId": 1,
      "semester": "Fall 2025",
      "status": "active",
      "totalCost": 120,
      "paymentStatus": "paid",
      "createdAt": "2025-01-20T16:30:00Z",
      "expiresAt": "2025-05-15T23:59:59Z"
    }
  }
}
```

### GET /api/subscriptions/user/:userId

Get user subscriptions.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "route": {
          "id": 1,
          "from": "Columbia University",
          "to": "Flushing, Queens",
          "schedule": {
            "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "morningTime": "08:00",
            "eveningTime": "18:30"
          }
        },
        "semester": "Fall 2025",
        "status": "active",
        "totalCost": 120,
        "paymentStatus": "paid",
        "upcomingTrips": 15,
        "createdAt": "2025-01-20T16:30:00Z"
      }
    ]
  }
}
```

### PUT /api/subscriptions/:id

Update subscription.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "status": "paused"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "subscription": {
      // Updated subscription object
    }
  }
}
```

### DELETE /api/subscriptions/:id

Cancel subscription.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Subscription cancelled successfully",
    "refund": {
      "amount": 60,
      "status": "processing"
    }
  }
}
```

## Trip Management

### GET /api/trips

Get trips for user subscriptions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `date`: Filter by date (YYYY-MM-DD)
- `status`: Filter by status (scheduled, completed, cancelled)
- `direction`: Filter by direction (to_columbia, from_columbia)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": 1,
        "subscriptionId": 1,
        "route": {
          "from": "Flushing, Queens",
          "to": "Columbia University"
        },
        "date": "2025-01-21",
        "departureTime": "08:00",
        "arrivalTime": "09:00",
        "status": "scheduled",
        "direction": "to_columbia",
        "seatNumber": "A12",
        "driverInfo": {
          "name": "Mike Johnson",
          "phone": "+1-555-0123",
          "vehicle": "Blue Toyota Hiace"
        }
      }
    ]
  }
}
```

### POST /api/trips

Create new trip (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "routeId": 1,
  "date": "2025-01-21",
  "departureTime": "08:00",
  "direction": "to_columbia",
  "driverId": 5,
  "maxSeats": 15
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "trip": {
      "id": 1,
      "routeId": 1,
      "date": "2025-01-21",
      "departureTime": "08:00",
      "direction": "to_columbia",
      "status": "scheduled",
      "availableSeats": 15,
      "createdAt": "2025-01-20T17:00:00Z"
    }
  }
}
```

### PUT /api/trips/:id/status

Update trip status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "status": "completed",
  "arrivalTime": "09:05"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "trip": {
      // Updated trip object
    }
  }
}
```

---

# Composite Service Endpoints

## Health Check

### GET /health

Check service health and dependencies.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "auth-service": "healthy",
      "route-service": "healthy",
      "subscription-service": "healthy"
    },
    "timestamp": "2025-01-20T17:30:00Z"
  }
}
```

## Aggregated Endpoints

### GET /api/dashboard

Get user dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      // User profile data
    },
    "activeRoutes": [
      // Routes user has joined
    ],
    "subscriptions": [
      // Active subscriptions
    ],
    "upcomingTrips": [
      // Next 5 scheduled trips
    ],
    "statistics": {
      "totalRoutes": 2,
      "totalTrips": 25,
      "moneySaved": 300
    }
  }
}
```

---

# Testing Examples

## Postman Collection

Import this collection for API testing:

```json
{
  "info": {
    "name": "Columbia Point2Point API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@columbia.edu\",\n  \"password\": \"testpassword\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\",\n  \"homeArea\": \"Manhattan, NY\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

## cURL Examples

### Complete Authentication Flow

```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@columbia.edu",
    "password": "testpassword",
    "firstName": "Test",
    "lastName": "User",
    "homeArea": "Manhattan, NY"
  }'

# 2. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@columbia.edu",
    "password": "testpassword"
  }' | jq -r '.data.token')

# 3. Use token for protected endpoints
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Route Management Flow

```bash
# Create route
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
    "estimatedCost": 110
  }'

# Join route
curl -X POST http://localhost:3002/api/routes/1/join \
  -H "Authorization: Bearer $TOKEN"

# Get route details
curl -X GET http://localhost:3002/api/routes/1
```

---

# Error Handling

## Common Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid request data",
  "details": {
    "field": "email",
    "message": "Must be a valid Columbia email address"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required",
  "details": {
    "message": "JWT token missing or invalid"
  }
}
```

### 422 Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "errors": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      },
      {
        "field": "schedule.days",
        "message": "At least one day must be selected"
      }
    ]
  }
}
```

---

# Rate Limiting

All endpoints are rate limited:

- **Authentication endpoints**: 5 requests per minute per IP
- **Route creation**: 10 requests per hour per user
- **General endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

---

# Webhooks (Future)

Webhook endpoints for external integrations:

### POST /api/webhooks/stripe

Payment processing webhook for subscription payments.

### POST /api/webhooks/sms

SMS delivery status webhook for notifications.
