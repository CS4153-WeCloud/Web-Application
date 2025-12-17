import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import './MyRoutes.css';

function MyRoutes() {
  const { user, isAuthenticated } = useAuth();
  const [myRoutes, setMyRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would fetch user-specific routes from the API
      // For now, we'll use mock data filtered by user's joined routes
      const response = await apiService.getMockRoutes();
      
      // Filter routes that the user has joined (from user profile)
      const userJoinedRouteIds = user?.joinedRoutes || [];
      const userRoutes = response.routes.filter(route => 
        userJoinedRouteIds.includes(route.id)
      );
      
      setMyRoutes(userRoutes);
    } catch (err) {
      console.error('Failed to fetch user routes:', err);
      setError('Failed to load your routes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.joinedRoutes]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyRoutes();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchMyRoutes]);

  if (!isAuthenticated) {
    return (
      <div className="my-routes-page">
        <div className="auth-required">
          <h2>🔐 Authentication Required</h2>
          <p>Please log in to view your routes.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-routes-page">
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading your routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-routes-page">
        <div className="error-section">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchMyRoutes}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-routes-page">
      <div className="page-header">
        <h1>🗺️ My Routes</h1>
        <p className="page-subtitle">
          Routes you've joined or proposed
        </p>
      </div>

      {myRoutes.length === 0 ? (
        <div className="no-routes">
          <div className="empty-state">
            <h2>No routes yet</h2>
            <p>You haven't joined any routes yet. Browse available routes on the home page to get started!</p>
            <a href="/" className="btn btn-primary">
              Browse Routes
            </a>
          </div>
        </div>
      ) : (
        <div className="routes-grid">
          {myRoutes.map(route => (
            <div key={route.id} className={`route-card ${route.status}`}>
              <div className="route-header">
                <div className="route-status">{route.status}</div>
                {route.status === 'proposed' && route.daysLeft && (
                  <div className="route-urgency">{route.daysLeft} days left</div>
                )}
                {route.status === 'active' && route.availableSeats && (
                  <div className="route-seats">Available seats: {route.availableSeats}</div>
                )}
              </div>
              
              <div className="route-path">
                <div className="location">🏫 {route.from}</div>
                <div className="arrow">↔️</div>
                <div className="location">🏠 {route.to}</div>
              </div>
              
              <div className="route-details">
                <div className="detail-item">
                  <span>Schedule:</span> {route.schedule}
                </div>
                <div className="detail-item">
                  <span>Semester:</span> {route.semester}
                </div>
                <div className="detail-item">
                  <span>Members:</span> {route.currentMembers} / {route.requiredMembers}
                </div>
                {route.status === 'proposed' && (
                  <div className="detail-item">
                    <span>Status:</span> Need {route.requiredMembers - route.currentMembers} more members
                  </div>
                )}
              </div>
              
              <div className="route-actions">
                {route.status === 'proposed' ? (
                  <button className="btn btn-secondary" disabled>
                    ✓ Joined
                  </button>
                ) : (
                  <button className="btn btn-success" disabled>
                    ✓ Subscribed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="routes-summary">
        <div className="summary-card">
          <h3>{myRoutes.filter(r => r.status === 'proposed').length}</h3>
          <p>Proposed Routes</p>
        </div>
        <div className="summary-card">
          <h3>{myRoutes.filter(r => r.status === 'active').length}</h3>
          <p>Active Routes</p>
        </div>
        <div className="summary-card">
          <h3>{myRoutes.length}</h3>
          <p>Total Routes</p>
        </div>
      </div>
    </div>
  );
}

export default MyRoutes;
