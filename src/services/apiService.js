/**
 * API Service for Columbia Point2Point Shuttle
 * Handles all communication with the Composite Microservice via HTTPS
 */

class ShuttleAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_COMPOSITE_SERVICE_URL || 'https://composite-service-demo.columbia-shuttle.com';
    this.apiVersion = process.env.REACT_APP_API_VERSION || 'v1';
  }

  /**
   * Generic HTTP request handler with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/${this.apiVersion}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Routes API - Composite Service Endpoints
   */
  
  // GET /api/v1/routes - Get all routes with pagination
  async getRoutes(params = {}) {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      page_size: params.pageSize || 20,
      status: params.status || 'all',
      ...params
    }).toString();
    
    return this.request(`/routes?${queryString}`);
  }

  // GET /api/v1/routes/{id} - Get route details with ETag support
  async getRoute(routeId, etag = null) {
    const headers = {};
    if (etag) {
      headers['If-None-Match'] = etag;
    }
    
    return this.request(`/routes/${routeId}`, { headers });
  }

  // POST /api/v1/routes - Create new route proposal
  async createRoute(routeData) {
    return this.request('/routes', {
      method: 'POST',
      body: JSON.stringify({
        from: routeData.from,
        to: routeData.to,
        schedule: {
          days: routeData.schedule.days,
          morning_time: routeData.schedule.morningTime,
          evening_time: routeData.schedule.eveningTime
        },
        semester: routeData.semester,
        estimated_cost_per_person: parseFloat(routeData.estimatedCost),
        description: routeData.description,
        contact_info: routeData.contactInfo,
        proposer_id: 'current_user' // Would be from auth context in production
      }),
    });
  }

  // POST /api/v1/routes/{id}/join - Join a proposed route
  async joinRoute(routeId) {
    return this.request(`/routes/${routeId}/join`, {
      method: 'POST',
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
  
  // GET /api/v1/subscriptions - Get user's subscriptions
  async getSubscriptions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/subscriptions?${queryString}`);
  }

  // POST /api/v1/subscriptions - Create semester subscription
  async createSubscription(subscriptionData) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  /**
   * Authentication API - Delegated to Auth & User Service
   */
  
  // POST /api/v1/auth/login - User login
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });
  }

  // POST /api/v1/auth/signup - User registration
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        home_area: userData.homeArea,
        preferred_departure_time: userData.preferredDepartureTime
      }),
    });
  }

  // POST /api/v1/auth/logout - User logout
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * User Profile API - Delegated to Auth Service
   */
  
  // GET /api/v1/me/profile - Get user profile
  async getUserProfile() {
    const token = localStorage.getItem('authToken');
    return this.request('/me/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // PUT /api/v1/me/profile - Update user profile
  async updateUserProfile(profileData) {
    const token = localStorage.getItem('authToken');
    return this.request('/me/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
  }

  // GET /api/v1/me/semester-overview - Get semester overview (parallel execution)
  async getSemesterOverview() {
    return this.request('/me/semester-overview');
  }

  // GET /api/v1/me/today-trips - Get today's trip information
  async getTodayTrips() {
    return this.request('/me/today-trips');
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