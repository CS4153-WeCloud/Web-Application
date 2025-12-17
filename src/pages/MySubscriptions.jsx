import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function MySubscriptions() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [routeCache, setRouteCache] = useState({});

  // Load all routes once to avoid multiple API calls
  const loadRoutes = async () => {
    try {
      const routesResult = await apiService.getRoutes();
      const routes = routesResult.routes || [];
      const cache = {};
      routes.forEach(route => {
        cache[route.id] = route;
      });
      setRouteCache(cache);
      return cache;
    } catch (e) {
      console.error('Failed to load routes:', e);
      return {};
    }
  };

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      // Load routes first
      const routes = await loadRoutes();

      // Get user's subscriptions
      const subsResult = await apiService.getSubscriptions({ userId: user.id });
      const subs = subsResult.subscriptions || subsResult.data || [];
      
      // Enrich subscriptions with route data from cache
      const enrichedSubs = subs.map(sub => {
        const route = routes[sub.routeId];
        return {
          ...sub,
          route: route ? {
            from: route.from || 'Columbia University',
            to: route.to || 'Unknown',
            schedule: formatSchedule(route),
            semester: route.semester || sub.semester
          } : {
            from: 'Columbia University',
            to: `Route #${sub.routeId}`,
            schedule: 'N/A',
            semester: sub.semester
          }
        };
      });
      
      setSubscriptions(enrichedSubs);
      
      // Get user's trips
      try {
        const tripsResult = await apiService.getTrips({ userId: user.id });
        const trips = tripsResult.data || tripsResult.trips || [];
        setUpcomingTrips(trips.map(trip => ({
          ...trip,
          bookingId: trip.bookingId || trip.id,
          route: routes[trip.routeId] || { from: 'Columbia University', to: 'Unknown' }
        })));
      } catch (tripError) {
        console.warn('Failed to load trips:', tripError);
        setUpcomingTrips([]);
      }
    } catch (e) {
      console.error('Failed to load subscriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (route) => {
    if (!route) return 'N/A';
    if (typeof route.schedule === 'string') return route.schedule;
    if (route.schedule && typeof route.schedule === 'object') {
      const days = Array.isArray(route.schedule.days) ? route.schedule.days.join(', ') : '';
      const morning = route.schedule.morningTime || '08:00';
      const evening = route.schedule.eveningTime || '18:00';
      return `${days} ${morning} / ${evening}`;
    }
    return 'Schedule TBD';
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadData();
  }, [authLoading, isAuthenticated, user]);

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Cancel this semester subscription?')) return;

    try {
      await apiService.cancelSubscription(id);
      // Update local state immediately
      setSubscriptions(prev =>
        prev.map(s =>
          s.id === id ? { ...s, status: 'cancelled' } : s
        )
      );
      alert('Subscription cancelled successfully!');
    } catch (e) {
      console.error('Failed to cancel subscription:', e);
      alert('Failed to cancel subscription: ' + e.message);
    }
  };

  const handleCancelTrip = async (bookingId) => {
    if (!window.confirm('Cancel this ride?')) return;

    try {
      await apiService.cancelTripBooking(bookingId);
      setUpcomingTrips(prev => prev.filter(t => t.bookingId !== bookingId));
      alert('Ride cancelled successfully!');
    } catch (e) {
      console.error('Failed to cancel ride:', e);
      alert('Failed to cancel ride: ' + e.message);
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
        <h2>Please log in to view your subscriptions.</h2>
      </div>
    );
  }

  // Separate active and cancelled subscriptions
  const activeSubscriptions = subscriptions.filter(
    s => s.status === 'active' || s.status === 'ACTIVE'
  );
  const cancelledSubscriptions = subscriptions.filter(
    s => s.status === 'cancelled' || s.status === 'CANCELLED'
  );

  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">My Subscriptions</h1>
        <p className="hero-subtitle">Your semester shuttle passes & upcoming rides</p>
      </div>

      {loading ? (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Active Subscriptions */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Active Subscriptions ({activeSubscriptions.length})</h2>
            </div>

            {activeSubscriptions.length === 0 ? (
              <p>No active subscriptions. Browse routes on the home page to subscribe!</p>
            ) : (
              <div className="routes-grid">
                {activeSubscriptions.map((sub) => {
                  const route = sub.route || {};
                  return (
                    <div key={sub.id} className="route-card active">
                      <div className="route-header">
                        <div className="route-status active">ACTIVE</div>
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
                          <span>Semester:</span> {sub.semester || route.semester}
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancelSubscription(sub.id)}
                      >
                        Cancel Subscription
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cancelled Subscriptions */}
          {cancelledSubscriptions.length > 0 && (
            <div className="routes-container">
              <div className="section-header">
                <h2>Cancelled Subscriptions ({cancelledSubscriptions.length})</h2>
              </div>

              <div className="routes-grid">
                {cancelledSubscriptions.map((sub) => {
                  const route = sub.route || {};
                  return (
                    <div key={sub.id} className="route-card" style={{opacity: 0.6}}>
                      <div className="route-header">
                        <div className="route-status" style={{background: '#999'}}>CANCELLED</div>
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
                          <span>Semester:</span> {sub.semester || route.semester}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Trips */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Upcoming Rides ({upcomingTrips.length})</h2>
            </div>

            {upcomingTrips.length === 0 ? (
              <p>No upcoming rides scheduled.</p>
            ) : (
              <div className="routes-grid">
                {upcomingTrips.map((trip) => {
                  const route = trip.route || {};
                  return (
                    <div key={trip.bookingId} className="route-card active">
                      <div className="route-header">
                        <div className="route-status">
                          {trip.type || 'RIDE'}
                        </div>
                      </div>

                      <div className="route-path">
                        <div className="location">🏫 {route.from}</div>
                        <div className="arrow">↔️</div>
                        <div className="location">🏠 {route.to}</div>
                      </div>

                      <div className="route-details">
                        <div className="detail-item">
                          <span>Date:</span> {trip.date || 'TBD'}
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancelTrip(trip.bookingId)}
                      >
                        Cancel Ride
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MySubscriptions;
