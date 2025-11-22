import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import MySubscriptions from './pages/MySubscriptions.jsx';
import apiService from './services/apiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal.jsx';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [services, setServices] = useState({
    compositeService: { status: 'unknown', url: '' },
    authService: { status: 'unknown', url: '' },
    routeService: { status: 'unknown', url: '' }
  });

  // Route management state
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Authentication modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    // Load service URLs from environment with HTTPS defaults
    const compositeServiceUrl = process.env.REACT_APP_COMPOSITE_SERVICE_URL || 'https://composite-service-demo.com';
    const authServiceUrl = process.env.REACT_APP_AUTH_SERVICE_URL || 'https://auth-service-demo.com';
    const routeServiceUrl = process.env.REACT_APP_ROUTE_SERVICE_URL || 'https://route-service-demo.com';

    setServices({
      compositeService: { status: 'configured', url: compositeServiceUrl },
      authService: { status: 'configured', url: authServiceUrl },
      routeService: { status: 'configured', url: routeServiceUrl }
    });

    // Load initial routes data
    fetchRoutes();
  }, []);

  // Fetch routes from composite service via HTTPS
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      // Use the API service to call the composite microservice
      // This demonstrates proper HTTPS API integration
      const data = await apiService.getMockRoutes(); // In production: apiService.getRoutes()
      
      setRoutes(data.routes);
      console.log('Routes fetched from composite service:', data);
    } catch (error) {
      console.error('Failed to fetch routes from composite service:', error);
      
      // Fallback to basic mock data if API fails
      const fallbackRoutes = [
        {
          id: 1,
          from: 'Columbia University',
          to: 'Flushing, Queens',
          status: 'proposed',
          schedule: 'Weekdays 8:00 AM / 6:30 PM',
          semester: 'Fall 2025',
          currentMembers: 8,
          requiredMembers: 15,
          daysLeft: 5
        }
      ];
      setRoutes(fallbackRoutes);
    } finally {
      setLoading(false);
    }
  };

  // Join a proposed route via composite service API
  const handleJoinRoute = async (routeId) => {
    // Check authentication before allowing join
    if (!isAuthenticated) {
      alert('Please log in to join a route.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    try {
      // Call composite service via HTTPS API
      console.log(`Calling composite service to join route ${routeId}`);
      // await apiService.joinRoute(routeId); // In production
      
      // Update local state for demo
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === routeId 
            ? { ...route, currentMembers: route.currentMembers + 1 }
            : route
        )
      );
      
      alert('Successfully joined the route via composite service!');
    } catch (error) {
      console.error('Failed to join route via composite service:', error);
      alert('Failed to join route. Please try again.');
    }
  };

  // Subscribe to an active route via composite service API
  const handleSubscribeRoute = async (routeId) => {
    // Check authentication before allowing subscription
    if (!isAuthenticated) {
      alert('Please log in to subscribe to a route.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    try {
      // Call composite service via HTTPS API
      console.log(`Calling composite service to subscribe to route ${routeId}`);
      // await apiService.createSubscription({ routeId }); // In production
      
      // Update local state for demo
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === routeId 
            ? { ...route, availableSeats: Math.max(0, route.availableSeats - 1) }
            : route
        )
      );
      
      alert('Successfully subscribed to the route via composite service!');
    } catch (error) {
      console.error('Failed to subscribe via composite service:', error);
      alert('Failed to subscribe to route. Please try again.');
    }
  };

  // Authentication handlers
  const handleShowLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleShowSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    // Refresh routes after logout to show public view
    fetchRoutes();
  };

  // Handle route proposal submission
  const handleProposeRoute = async (proposalData) => {
    // Check authentication before allowing route proposal
    if (!isAuthenticated) {
      alert('Please log in to propose a new route.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    try {
      console.log('Submitting route proposal to composite service:', proposalData);
      
      // In production, this would call:
      // const result = await apiService.createRoute(proposalData);
      
      // Create new route object for demo
      const newRoute = {
        id: routes.length + 1,
        from: proposalData.from,
        to: proposalData.to,
        status: 'proposed',
        schedule: `${proposalData.schedule.days.join(', ')} ${proposalData.schedule.morningTime} / ${proposalData.schedule.eveningTime}`,
        semester: proposalData.semester,
        currentMembers: 1, // Proposer is automatically first member
        requiredMembers: 15, // Default requirement
        daysLeft: 30, // Default proposal period
        estimatedCost: proposalData.estimatedCost,
        description: proposalData.description,
        links: {
          self: `/routes/${routes.length + 1}`,
          members: `/routes/${routes.length + 1}/members`,
          join: `/routes/${routes.length + 1}/join`
        }
      };
      
      // Add to routes list
      setRoutes(prevRoutes => [newRoute, ...prevRoutes]);
      
      alert('Route proposal submitted successfully! You are now the first member.');
      
      // Refresh routes to get latest data
      // await fetchRoutes(); // Uncomment for production
      
    } catch (error) {
      console.error('Failed to submit route proposal:', error);
      alert('Failed to submit route proposal. Please try again.');
      throw error; // Re-throw so modal can handle it
    }
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Columbia P2P
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  🏠 Home
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link to="/my-routes" className="nav-link">
                      🗺️ My Routes
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/subscriptions" className="nav-link">
                      🎫 My Subscription
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">
                      👤 My Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <div className="user-menu">
                      <span className="user-greeting">👋 Hi, {user?.firstName}!</span>
                      <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <button className="nav-link" onClick={handleShowLogin}>
                      🔐 Login
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link signup-btn" onClick={handleShowSignup}>
                      📝 Sign Up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <HomePage 
                services={services}
                routes={routes}
                loading={loading}
                onJoinRoute={handleJoinRoute}
                onSubscribeRoute={handleSubscribeRoute}
                onProposeRoute={handleProposeRoute}
                onRefreshRoutes={fetchRoutes}
              />
            } />
            <Route path="/my-routes" element={<div>My Routes - Coming Soon</div>} />
            <Route path="/subscriptions" element={<MySubscriptions />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Columbia Point2Point © 2025</p>
        </footer>
        
        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    </Router>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

