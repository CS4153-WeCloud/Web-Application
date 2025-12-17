/**
 * API Service for Columbia Point2Point Shuttle
 * Handles all communication with the Composite Microservice via HTTPS
 */

class ShuttleAPIService {
  constructor() {
    // Use real Composite Service URL
    this.baseURL = process.env.REACT_APP_COMPOSITE_SERVICE_URL || 'https://composite-service-1081353560639.us-central1.run.app';
  }

  /**
   * Generic HTTP request handler with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      // Get response text first
      const responseText = await response.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }
      
      if (!response.ok) {
        console.error(`API Error ${response.status}:`, data);
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Routes API - Composite Service Endpoints
   */
  
  // GET /api/routes - Get all routes with pagination
  async getRoutes(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.pageSize) queryParams.set('page_size', params.pageSize);
    if (params.status && params.status !== 'all') queryParams.set('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/routes?${queryString}` : '/routes';
    
    const response = await this.request(endpoint);
    
    // Normalize the response to handle different API formats
    const routes = response.routes || response.data || [];
    return {
      routes: routes.map(route => {
        // Format schedule - handle both string and object formats
        let scheduleStr = '';
        if (typeof route.schedule === 'string') {
          scheduleStr = route.schedule;
        } else if (route.schedule && typeof route.schedule === 'object') {
          const days = Array.isArray(route.schedule.days) ? route.schedule.days.join(', ') : '';
          const morning = route.schedule.morningTime || '08:00';
          const evening = route.schedule.eveningTime || '18:00';
          scheduleStr = `${days} ${morning} / ${evening}`;
        } else {
          scheduleStr = `${route.morningTime || '08:00'} / ${route.eveningTime || '18:00'}`;
        }
        
        return {
          id: route.id,
          from: route.from || route.from_location || 'Unknown',
          to: route.to || route.to_location || 'Unknown',
          status: route.status || 'proposed',
          schedule: scheduleStr,
          semester: route.semester || 'Fall 2025',
          currentMembers: route.currentMembers || route.current_members || 0,
          requiredMembers: route.requiredMembers || route.required_members || 15,
          availableSeats: route.availableSeats || Math.max(0, (route.requiredMembers || 15) - (route.currentMembers || 0)),
          daysLeft: route.daysLeft || 30,
          estimatedCost: route.estimatedCost || route.estimated_cost || 0,
          description: route.description || '',
          createdBy: route.createdBy || route.created_by,
          createdAt: route.createdAt || route.created_at,
          links: route.links || {}
        };
      }),
      pagination: response.pagination || {}
    };
  }

  // GET /api/routes/{id} - Get route details with ETag support
  async getRoute(routeId, etag = null) {
    const headers = {};
    if (etag) {
      headers['If-None-Match'] = etag;
    }
    
    return this.request(`/routes/${routeId}`, { headers });
  }

  // POST /api/routes - Create new route proposal
  async createRoute(routeData, userId) {
    return this.request('/routes', {
      method: 'POST',
      body: JSON.stringify({
        from: routeData.from,
        to: routeData.to,
        schedule: {
          days: routeData.schedule.days,
          morningTime: routeData.schedule.morningTime,
          eveningTime: routeData.schedule.eveningTime
        },
        semester: routeData.semester,
        estimatedCost: parseFloat(routeData.estimatedCost) || 100,
        description: routeData.description || '',
        requiredMembers: 15,
        createdBy: userId || 1
      }),
    });
  }

  // POST /api/routes/{id}/join - Join a proposed route
  async joinRoute(routeId, userId) {
    return this.request(`/routes/${routeId}/join`, {
      method: 'POST',
      body: JSON.stringify({
        userId: userId || 1
      }),
    });
  }

  // POST /api/v1/routes/{id}/activate - Activate a route (async operation)
  async activateRoute(routeId) {
    return this.request(`/routes/${routeId}/activate`, {
      method: 'POST',
    });
  }

  // GET /api/v1/route-activations/{taskId} - Poll activation status
  async getActivationStatus(taskId) {
    return this.request(`/route-activations/${taskId}`);
  }

  /**
   * Subscriptions API - Semester subscriptions to active routes
   */
  
  // GET /api/subscriptions - Get user's subscriptions
  async getSubscriptions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/subscriptions?${queryString}` : '/subscriptions';
    const response = await this.request(endpoint);
    
    // Normalize response
    const subscriptions = response.data || response.subscriptions || [];
    return {
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId || sub.user_id,
        routeId: sub.routeId || sub.route_id,
        status: sub.status,
        semester: sub.semester,
        route: sub.route || {
          from: 'Columbia University',
          to: 'Loading...',
          schedule: 'Loading...',
          semester: sub.semester
        }
      })),
      pagination: response.pagination || {}
    };
  }

  // GET /api/subscriptions/user/{userId} - Get user's subscriptions
  async getUserSubscriptions(userId) {
    return this.request(`/subscriptions?userId=${userId}`);
  }

  // POST /api/subscriptions - Create semester subscription
  async createSubscription(subscriptionData) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        userId: subscriptionData.userId || 1,
        routeId: subscriptionData.routeId,
        semester: subscriptionData.semester || 'Fall 2025'
      }),
    });
  }

  // POST /api/subscriptions/{id}/cancel - Cancel semester subscription
  async cancelSubscription(id) {
    return this.request(`/subscriptions/${id}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Trips API
   */

  // GET /api/trips - Get trips
  async getTrips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/trips?${queryString}` : '/trips';
    return this.request(endpoint);
  }

  // POST /api/trips - Create a trip
  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  // POST /api/trips/{id}/cancel - Cancel a trip (async 202)
  async cancelTripBooking(tripId) {
    return this.request(`/trips/${tripId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * User API - User management
   */
  
  // GET /api/users?email=xxx - Find user by email
  async getUserByEmail(email) {
    const response = await this.request(`/users?email=${encodeURIComponent(email)}`);
    // Response could be array or object with data array
    const users = response.data || response.users || response;
    if (Array.isArray(users) && users.length > 0) {
      return users[0];
    }
    return null;
  }

  // GET /api/users/{id} - Get user by ID
  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  // POST /api/users - Create new user
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        homeArea: userData.homeArea || 'New York',
        preferredDepartureTime: userData.preferredDepartureTime || '08:00',
        role: 'student',
        status: 'active'
      }),
    });
  }

  // PUT /api/users/{id} - Update user profile
  async updateUser(userId, profileData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Mock Data Methods (for development without backend)
   */
  
  /**
   * Mock Authentication Methods (for development without backend)
   */
  
  async mockLogin(credentials) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'demo@columbia.edu' && credentials.password === 'password') {
      return {
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          email: 'demo@columbia.edu',
          firstName: 'Demo',
          lastName: 'User',
          homeArea: 'Flushing, Queens',
          preferredDepartureTime: '08:00',
          joinedRoutes: [],
          activeSubscriptions: []
        }
      };
    } else {
      throw new Error('Invalid email or password');
    }
  }

  async mockSignup(userData) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock user creation
    return {
      token: 'mock-jwt-token-67890',
      user: {
        id: Math.floor(Math.random() * 1000) + 2,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        homeArea: userData.homeArea,
        preferredDepartureTime: userData.preferredDepartureTime,
        joinedRoutes: [],
        activeSubscriptions: []
      }
    };
  }

  async mockGetUserProfile() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: 1,
      email: 'demo@columbia.edu',
      firstName: 'Demo',
      lastName: 'User',
      homeArea: 'Flushing, Queens',
      preferredDepartureTime: '08:00',
      joinedRoutes: [1, 3],
      activeSubscriptions: [2],
      memberSince: '2024-09-01'
    };
  }

  // MOCK: /api/v1/me/semester-overview - for front-end demo
  async mockGetSemesterOverview() {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      subscriptions: [
        {
          id: 1,
          status: 'ACTIVE',
          route: {
            from: 'Columbia University',
            to: 'Flushing, Queens',
            schedule: 'Weekdays 8:00 AM / 6:30 PM',
            semester: 'Fall 2025'
          }
        },
        {
          id: 2,
          status: 'CANCELLED',
          route: {
            from: 'Columbia University',
            to: 'Jersey City, NJ',
            schedule: 'Weekdays 7:45 AM / 6:15 PM',
            semester: 'Fall 2025'
          }
        }
      ],
      upcomingTrips: [
        {
          bookingId: 101,
          type: 'MORNING',
          date: '2025-09-15',
          route: {
            from: 'Columbia University',
            to: 'Flushing, Queens'
          }
        },
        {
          bookingId: 102,
          type: 'EVENING',
          date: '2025-09-15',
          route: {
            from: 'Columbia University',
            to: 'Flushing, Queens'
          }
        }
      ]
    };
  }

  async getMockRoutes() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      routes: [
        {
          id: 1,
          from: 'Columbia University',
          to: 'Flushing, Queens',
          status: 'proposed',
          schedule: 'Weekdays 8:00 AM / 6:30 PM',
          semester: 'Fall 2025',
          currentMembers: 8,
          requiredMembers: 15,
          daysLeft: 5,
          links: {
            self: '/routes/1',
            members: '/routes/1/members',
            join: '/routes/1/join'
          }
        },
        {
          id: 2,
          from: 'Columbia University',
          to: 'Jersey City, NJ',
          status: 'active',
          schedule: 'Weekdays 7:45 AM / 6:15 PM',
          semester: 'Fall 2025',
          currentMembers: 17,
          requiredMembers: 20,
          availableSeats: 3,
          links: {
            self: '/routes/2',
            members: '/routes/2/members',
            subscribe: '/subscriptions'
          }
        },
        {
          id: 3,
          from: 'Columbia University',
          to: 'Brooklyn Heights',
          status: 'proposed',
          schedule: 'Weekdays 8:15 AM / 6:45 PM',
          semester: 'Fall 2025',
          currentMembers: 4,
          requiredMembers: 12,
          daysLeft: 12,
          links: {
            self: '/routes/3',
            members: '/routes/3/members',
            join: '/routes/3/join'
          }
        },
        {
          id: 4,
          from: 'Columbia University',
          to: 'Astoria, Queens',
          status: 'active',
          schedule: 'Weekdays 7:30 AM / 6:00 PM',
          semester: 'Fall 2025',
          currentMembers: 12,
          requiredMembers: 15,
          availableSeats: 1,
          links: {
            self: '/routes/4',
            members: '/routes/4/members',
            subscribe: '/subscriptions'
          }
        }
      ],
      pagination: {
        total_count: 4,
        page: 1,
        page_size: 20,
        total_pages: 1
      },
      links: {
        self: '/routes?page=1',
        first: '/routes?page=1',
        last: '/routes?page=1'
      }
    };
  }
}

// Export singleton instance
const apiService = new ShuttleAPIService();
export default apiService;