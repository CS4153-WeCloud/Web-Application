import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function MyRoutes() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinedRoutes, setJoinedRoutes] = useState([]);
  const [proposedRoutes, setProposedRoutes] = useState([]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');

      // Get user's ACTIVE subscriptions only
      const subsResult = await apiService.getSubscriptions({ userId: user.id });
      const allSubscriptions = subsResult.subscriptions || subsResult.data || [];
      
      // Only consider active subscriptions
      const activeSubscriptions = allSubscriptions.filter(
        sub => sub.status === 'active' || sub.status === 'ACTIVE'
      );
      
      // Get all routes
      const routesResult = await apiService.getRoutes();
      const allRoutes = routesResult.routes || [];
      
      // Filter routes user has ACTIVE subscriptions to
      const activeRouteIds = activeSubscriptions.map(sub => sub.routeId);
      const userJoinedRoutes = allRoutes.filter(route => activeRouteIds.includes(route.id));
      
      // Filter routes created by user
      const userId = parseInt(user.id, 10);
      const userProposedRoutes = allRoutes.filter(route => parseInt(route.createdBy, 10) === userId);
      
      setJoinedRoutes(userJoinedRoutes);
      setProposedRoutes(userProposedRoutes);
      
      console.log('Active subscriptions:', activeSubscriptions);
      console.log('Joined routes:', userJoinedRoutes);
      console.log('Proposed routes:', userProposedRoutes);
    } catch (e) {
      console.error('Failed to load routes:', e);
      setError('Failed to load your routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadData();
  }, [authLoading, isAuthenticated, user]);

  const handleLeaveRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to leave this route? This will cancel your subscription.')) return;
    
    try {
      // Find ACTIVE subscription for this route
      const subsResult = await apiService.getSubscriptions({ userId: user?.id });
      const allSubs = subsResult.subscriptions || subsResult.data || [];
      const subscription = allSubs.find(
        s => s.routeId === routeId && (s.status === 'active' || s.status === 'ACTIVE')
      );
      
      if (subscription) {
        await apiService.cancelSubscription(subscription.id);
        // Remove from local state immediately
        setJoinedRoutes(prev => prev.filter(r => r.id !== routeId));
        alert('Successfully left the route.');
      } else {
        alert('No active subscription found for this route.');
      }
    } catch (e) {
      console.error('Failed to leave route:', e);
      alert('Failed to leave route: ' + e.message);
    }
  };

  if (authLoading) {
    return (
      <div className="home-page">
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Checking login...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="home-page">
        <h2>Please log in to view your routes.</h2>
      </div>
    );
  }

  const formatSchedule = (route) => {
    if (typeof route.schedule === 'string') return route.schedule;
    if (route.schedule && typeof route.schedule === 'object') {
      const days = Array.isArray(route.schedule.days) ? route.schedule.days.join(', ') : '';
      const morning = route.schedule.morningTime || '08:00';
      const evening = route.schedule.eveningTime || '18:00';
      return `${days} ${morning} / ${evening}`;
    }
    return 'Schedule TBD';
  };

  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">My Routes</h1>
        <p className="hero-subtitle">Routes you've created and subscribed to</p>
      </div>

      {loading ? (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading your routes...</p>
        </div>
      ) : error ? (
        <div className="error-section">
          <p style={{color: 'red'}}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>Retry</button>
        </div>
      ) : (
        <>
          {/* Routes I've Proposed */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Routes I've Proposed ({proposedRoutes.length})</h2>
            </div>

            {proposedRoutes.length === 0 ? (
              <p>You haven't proposed any routes yet. Go to home page to propose a new route!</p>
            ) : (
              <div className="routes-grid">
                {proposedRoutes.map((route) => (
                  <div key={route.id} className={`route-card ${route.status}`}>
                    <div className="route-header">
                      <div className={`route-status ${route.status}`}>
                        {(route.status || 'proposed').toUpperCase()}
                      </div>
                    </div>

                    <div className="route-path">
                      <div className="location">🏫 {route.from}</div>
                      <div className="arrow">↔️</div>
                      <div className="location">🏠 {route.to}</div>
                    </div>

                    <div className="route-details">
                      <div className="detail-item">
                        <span>Schedule:</span> {formatSchedule(route)}
                      </div>
                      <div className="detail-item">
                        <span>Semester:</span> {route.semester}
                      </div>
                      <div className="detail-item">
                        <span>Members:</span> {route.currentMembers}/{route.requiredMembers}
                      </div>
                      {route.estimatedCost && (
                        <div className="detail-item">
                          <span>Est. Cost:</span> ${route.estimatedCost}/semester
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Routes I've Subscribed To */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Routes I've Subscribed To ({joinedRoutes.length})</h2>
            </div>

            {joinedRoutes.length === 0 ? (
              <p>You don't have any active subscriptions. Browse routes on the home page to subscribe!</p>
            ) : (
              <div className="routes-grid">
                {joinedRoutes.map((route) => (
                  <div key={route.id} className={`route-card ${route.status}`}>
                    <div className="route-header">
                      <div className={`route-status ${route.status}`}>
                        {(route.status || 'active').toUpperCase()}
                      </div>
                    </div>

                    <div className="route-path">
                      <div className="location">🏫 {route.from}</div>
                      <div className="arrow">↔️</div>
                      <div className="location">🏠 {route.to}</div>
                    </div>

                    <div className="route-details">
                      <div className="detail-item">
                        <span>Schedule:</span> {formatSchedule(route)}
                      </div>
                      <div className="detail-item">
                        <span>Semester:</span> {route.semester}
                      </div>
                      <div className="detail-item">
                        <span>Members:</span> {route.currentMembers}/{route.requiredMembers}
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleLeaveRoute(route.id)}
                    >
                      Cancel Subscription
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MyRoutes;
