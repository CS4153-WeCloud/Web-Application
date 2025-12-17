import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function MyRoutes() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myRoutes, setMyRoutes] = useState([]);
  const [proposedRoutes, setProposedRoutes] = useState([]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get user's subscriptions to find their routes
        const subsResult = await apiService.getSubscriptions({ userId: user?.id });
        const subscriptions = subsResult.subscriptions || subsResult.data || [];
        
        // Get all routes
        const routesResult = await apiService.getRoutes();
        const allRoutes = routesResult.routes || [];
        
        // Filter routes user has subscribed to
        const subscribedRouteIds = subscriptions.map(sub => sub.routeId);
        const userRoutes = allRoutes.filter(route => subscribedRouteIds.includes(route.id));
        
        // Filter routes created by user (proposed routes)
        const userProposedRoutes = allRoutes.filter(route => route.createdBy === user?.id);
        
        setMyRoutes(userRoutes);
        setProposedRoutes(userProposedRoutes);
        
        console.log('User routes loaded:', userRoutes);
        console.log('Proposed routes loaded:', userProposedRoutes);
      } catch (e) {
        console.error('Failed to load routes:', e);
        setError('Failed to load your routes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user]);

  const handleLeaveRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to leave this route?')) return;
    
    try {
      // Find subscription for this route and cancel it
      const subsResult = await apiService.getSubscriptions({ userId: user?.id });
      const subscription = (subsResult.subscriptions || []).find(s => s.routeId === routeId);
      
      if (subscription) {
        await apiService.cancelSubscription(subscription.id);
        setMyRoutes(prev => prev.filter(r => r.id !== routeId));
        alert('Successfully left the route.');
      }
    } catch (e) {
      console.error('Failed to leave route:', e);
      alert('Failed to leave route.');
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
        <p className="hero-subtitle">Routes you've joined and proposed</p>
      </div>

      {loading ? (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading your routes...</p>
        </div>
      ) : error ? (
        <div className="error-section">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Routes I've Proposed */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Routes I've Proposed</h2>
            </div>

            {proposedRoutes.length === 0 ? (
              <p>You haven't proposed any routes yet.</p>
            ) : (
              <div className="routes-grid">
                {proposedRoutes.map((route) => (
                  <div key={route.id} className={`route-card ${route.status}`}>
                    <div className="route-header">
                      <div className={`route-status ${route.status}`}>
                        {route.status.toUpperCase()}
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

          {/* Routes I've Joined */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Routes I've Joined</h2>
            </div>

            {myRoutes.length === 0 ? (
              <p>You haven't joined any routes yet. Browse available routes to join one!</p>
            ) : (
              <div className="routes-grid">
                {myRoutes.map((route) => (
                  <div key={route.id} className={`route-card ${route.status}`}>
                    <div className="route-header">
                      <div className={`route-status ${route.status}`}>
                        {route.status.toUpperCase()}
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
                      Leave Route
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
