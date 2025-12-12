import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

function MySubscriptions() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  
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

        // Try to get subscriptions from real API
        let subs = [];
        let trips = [];
        
        try {
          // Get user's subscriptions
          const subsResult = await apiService.getSubscriptions({ userId: user?.id || 1 });
          subs = subsResult.subscriptions || [];
          console.log('Subscriptions loaded:', subs);
          
          // Get user's trips
          try {
            const tripsResult = await apiService.getTrips({ userId: user?.id || 1 });
            trips = tripsResult.data || tripsResult.trips || [];
            console.log('Trips loaded:', trips);
          } catch (tripError) {
            console.warn('Failed to load trips:', tripError);
          }
          
          // Enrich subscriptions with route data
          for (let sub of subs) {
            if (sub.routeId && !sub.route?.from) {
              try {
                const routeData = await apiService.getRoute(sub.routeId);
                sub.route = {
                  from: routeData.from || routeData.from_location || 'Columbia University',
                  to: routeData.to || routeData.to_location || 'Unknown',
                  schedule: routeData.schedule || `${routeData.morningTime || '08:00'} / ${routeData.eveningTime || '18:00'}`,
                  semester: routeData.semester || sub.semester
                };
              } catch (routeError) {
                console.warn(`Failed to load route ${sub.routeId}:`, routeError);
              }
            }
          }
        } catch (e) {
          console.warn('Real API failed, using mock instead:', e);
          const overview = await apiService.mockGetSemesterOverview();
          subs = overview.subscriptions || [];
          trips = overview.upcomingTrips || [];
        }

        setSubscriptions(subs);
        setUpcomingTrips(trips.map(trip => ({
          ...trip,
          bookingId: trip.bookingId || trip.id,
          route: trip.route || { from: 'Columbia University', to: 'Loading...' }
        })));
      } catch (e) {
        console.error(e);
        setError('Failed to load subscriptions.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user]);

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Cancel this semester subscription?')) return;

    try {
      await apiService.cancelSubscription(id);
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: 'CANCELLED' } : s
        )
      );
    } catch (e) {
      alert('Failed to cancel subscription.');
    }
  };

  const handleCancelTrip = async (bookingId) => {
    if (!window.confirm('Cancel this ride?')) return;

    try {
      await apiService.cancelTripBooking(bookingId);
      setUpcomingTrips((prev) =>
        prev.filter((t) => t.bookingId !== bookingId)
      );
    } catch (e) {
      alert('Failed to cancel ride.');
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
          {/* Subscriptions */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Semester Subscriptions</h2>
            </div>

            {subscriptions.length === 0 ? (
              <p>No subscriptions yet.</p>
            ) : (
              <div className="routes-grid">
                {subscriptions.map((sub) => {
                  const route = sub.route || {};
                  return (
                    <div key={sub.id} className="route-card">
                      <div className="route-header">
                        <div className="route-status">{sub.status}</div>
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
                      </div>

                      {sub.status === 'ACTIVE' && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleCancelSubscription(sub.id)}
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Trips */}
          <div className="routes-container">
            <div className="section-header">
              <h2>Upcoming Rides</h2>
            </div>

            {upcomingTrips.length === 0 ? (
              <p>No upcoming rides.</p>
            ) : (
              <div className="routes-grid">
                {upcomingTrips.map((trip) => {
                  const route = trip.route || {};
                  return (
                    <div key={trip.bookingId} className="route-card active">
                      <div className="route-header">
                        <div className="route-status">
                          {trip.type}
                        </div>
                      </div>

                      <div className="route-path">
                        <div className="location">🏫 {route.from}</div>
                        <div className="arrow">↔️</div>
                        <div className="location">🏠 {route.to}</div>
                      </div>

                      <div className="route-details">
                        <div className="detail-item">
                          <span>Date:</span> {trip.date}
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
