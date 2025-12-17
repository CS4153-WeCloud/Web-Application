import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function MyRoutes() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinedRoutes, setJoinedRoutes] = useState([]); // Routes user has joined (route_members)
  const [proposedRoutes, setProposedRoutes] = useState([]); // Routes user created

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');

      const userId = parseInt(user.id, 10);

      // Get routes user has joined (via route_members table)
      const joinedResult = await apiService.getUserJoinedRoutes(userId);
      const allJoinedRoutes = joinedResult.routes || [];
      
      // Separate into proposed (created by user) and joined (joined by user but not created)
      const myProposed = allJoinedRoutes.filter(route => parseInt(route.createdBy, 10) === userId);
      const myJoined = allJoinedRoutes.filter(route => parseInt(route.createdBy, 10) !== userId);
      
      setProposedRoutes(myProposed);
      setJoinedRoutes(myJoined);
      
      console.log('My proposed routes:', myProposed);
      console.log('Routes I joined (not mine):', myJoined);
    } catch (e) {
      console.error('Failed to load routes:', e);
      setError('Failed to load your routes. Please try again.');
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
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
=======
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user]);

  const handleLeaveRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to leave this route?')) return;
    
    try {
      // Call leave route API (removes from route_members)
      const userId = parseInt(user?.id, 10);
      if (!userId) {
        alert('Please log in to leave a route.');
        return;
      }
      await apiService.leaveRoute(routeId, userId);
      // Remove from local state immediately
      setJoinedRoutes(prev => prev.filter(r => r.id !== routeId));
      alert('Successfully left the route.');
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
>>>>>>> 000066825a8367c7b89b9eed909159f01438e45d
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  if (loading) {
    return (
      <div className="my-routes-page">
=======
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
        <p className="hero-subtitle">Routes you've created and joined</p>
      </div>

      {loading ? (
>>>>>>> 000066825a8367c7b89b9eed909159f01438e45d
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading your routes...</p>
        </div>
<<<<<<< HEAD
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
=======
      ) : error ? (
        <div className="error-section">
          <p style={{color: 'red'}}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>Retry</button>
        </div>
      ) : (
        <>
          {/* Routes I've Proposed (Created by me) */}
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
                      <div className="route-badge">👤 Creator</div>
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
                        {route.status === 'proposed' && route.currentMembers < route.requiredMembers && (
                          <span style={{color: '#f39c12', marginLeft: '8px'}}>
                            (Need {route.requiredMembers - route.currentMembers} more to activate)
                          </span>
                        )}
                      </div>
                      {route.estimatedCost > 0 && (
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

          {/* Routes I've Joined (Not created by me) */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Routes I've Joined ({joinedRoutes.length})</h2>
            </div>

            {joinedRoutes.length === 0 ? (
              <p>You haven't joined any routes yet. Browse routes on the home page to join!</p>
            ) : (
              <div className="routes-grid">
                {joinedRoutes.map((route) => (
                  <div key={route.id} className={`route-card ${route.status}`}>
                    <div className="route-header">
                      <div className={`route-status ${route.status}`}>
                        {(route.status || 'proposed').toUpperCase()}
                      </div>
                      <div className="route-badge">✓ Member</div>
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
>>>>>>> 000066825a8367c7b89b9eed909159f01438e45d
    </div>
  );
}

export default MyRoutes;
