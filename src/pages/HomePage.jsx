import React, { useState } from 'react';
import './HomePage.css';

function HomePage({ 
  services,          // Available microservices info
  routes,            // List of shuttle routes
  loading,           // Loading state for route data
  onJoinRoute,       // Handler for joining a route
  onSubscribeRoute,  // Handler for subscribing to route updates
  onProposeRoute,    // Handler for proposing a new route
  onRefreshRoutes,   // Handler for refreshing route data
  currentUser,       // Current logged in user
  userSubscriptions  // User's active subscriptions
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    routeType: 'to-columbia', // 'to-columbia' or 'from-home'
    from: 'Columbia University',
    to: '',
    schedule: {
      morningTime: '08:00',
      eveningTime: '18:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    semester: 'Fall 2025',
    estimatedCost: '',
    description: '',
    contactInfo: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Filter routes based on selected filter
  const filteredRoutes = routes.filter(route => {
    if (activeFilter === 'all') return true;
    return route.status === activeFilter;
  });

  // Handle route proposal form submission
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateProposalForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Call the parent handler with form data
      await onProposeRoute(proposalForm);
      
      // Reset form and close modal on success
      setProposalForm({
        routeType: 'to-columbia',
        from: 'Columbia University',
        to: '',
        schedule: {
          morningTime: '08:00',
          eveningTime: '18:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        semester: 'Fall 2025',
        estimatedCost: '',
        description: '',
        contactInfo: ''
      });
      setFormErrors({});
      setShowProposalModal(false);
    } catch (error) {
      console.error('Failed to submit route proposal:', error);
    }
  };

  // Validate proposal form
  const validateProposalForm = () => {
    const errors = {};
    
    if (proposalForm.routeType === 'to-columbia') {
      if (!proposalForm.to.trim()) {
        errors.to = 'Destination is required';
      }
    } else {
      if (!proposalForm.from.trim()) {
        errors.from = 'Origin location is required';
      }
    }
    
    if (!proposalForm.estimatedCost) {
      errors.estimatedCost = 'Estimated monthly cost is required';
    } else if (isNaN(proposalForm.estimatedCost) || proposalForm.estimatedCost <= 0) {
      errors.estimatedCost = 'Please enter a valid cost amount';
    }
    
    if (!proposalForm.contactInfo.trim()) {
      errors.contactInfo = 'Contact information is required';
    }
    
    if (proposalForm.schedule.days.length === 0) {
      errors.days = 'Please select at least one day';
    }
    
    return errors;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProposalForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProposalForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle day selection
  const handleDayToggle = (day) => {
    const currentDays = proposalForm.schedule.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleInputChange('schedule.days', newDays);
  };

  // Handle route type change
  const handleRouteTypeChange = (routeType) => {
    setProposalForm(prev => ({
      ...prev,
      routeType,
      from: routeType === 'to-columbia' ? 'Columbia University' : '',
      to: routeType === 'from-home' ? 'Columbia University' : ''
    }));
    
    // Clear related errors
    setFormErrors(prev => ({
      ...prev,
      from: undefined,
      to: undefined
    }));
  };
  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">Columbia Point2Point</h1>
        <p className="hero-subtitle">
          Semester shuttle service connecting Columbia to NYC residential areas
        </p>
        <p className="hero-caption">Direct routes • Shared costs • Reliable schedule</p>
      </div>

      {/* Action Buttons Section */}
      <div className="actions-section">
        <button 
          className="btn btn-primary btn-large"
          onClick={() => setShowProposalModal(true)}
        >
          🚌 Propose New Route
        </button>
        <button 
          className="btn btn-secondary btn-large"
          onClick={onRefreshRoutes}
          disabled={loading}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh Routes'}
        </button>
      </div>

      {/* Routes Section */}
      <div className="routes-container">
        <div className="section-header">
          <h2>Available Routes</h2>
          <div className="route-filters">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Routes ({routes.length})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'proposed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('proposed')}
            >
              Proposed ({routes.filter(r => r.status === 'proposed').length})
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active ({routes.filter(r => r.status === 'active').length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading routes from composite service...</p>
          </div>
        )}

        {/* Routes Grid */}
        {!loading && (
          <div className="routes-grid">
            {filteredRoutes.length === 0 ? (
              <div className="no-routes">
                <p>No routes found for the selected filter.</p>
                <button className="btn btn-primary" onClick={onProposeRoute}>
                  Be the first to propose a route!
                </button>
              </div>
            ) : (
              filteredRoutes.map(route => (
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
                  </div>
                  {route.status === 'proposed' ? (
                    // Check if user is creator or already a member
                    currentUser && route.createdBy === currentUser.id ? (
                      <button className="btn btn-disabled" disabled>
                        ✓ Your Route
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => onJoinRoute(route.id)}
                      >
                        Join Route
                      </button>
                    )
                  ) : (
                    // Check if user already has active subscription
                    userSubscriptions?.some(s => s.routeId === route.id && s.status === 'active') ? (
                      <button className="btn btn-disabled" disabled>
                        ✓ Subscribed
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success"
                        onClick={() => onSubscribeRoute(route.id)}
                        disabled={route.availableSeats === 0}
                      >
                        {route.availableSeats === 0 ? 'Full' : 'Subscribe'}
                      </button>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Route Proposal Modal */}
      {showProposalModal && (
        <div className="modal-overlay" onClick={() => setShowProposalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Propose New Shuttle Route</h2>
              <button 
                className="modal-close"
                onClick={() => setShowProposalModal(false)}
              >
                ×
              </button>
            </div>
            
            <form className="proposal-form" onSubmit={handleProposalSubmit}>
              {/* Route Type Selection */}
              <div className="form-section">
                <h3>Route Type</h3>
                <div className="route-type-selector">
                  <label className="route-type-option">
                    <input
                      type="radio"
                      name="routeType"
                      value="to-columbia"
                      checked={proposalForm.routeType === 'to-columbia'}
                      onChange={(e) => handleRouteTypeChange(e.target.value)}
                    />
                    <span className="route-type-label">Home → Columbia</span>
                    <small>Morning commute to campus</small>
                  </label>
                  <label className="route-type-option">
                    <input
                      type="radio"
                      name="routeType"
                      value="from-home"
                      checked={proposalForm.routeType === 'from-home'}
                      onChange={(e) => handleRouteTypeChange(e.target.value)}
                    />
                    <span className="route-type-label">Columbia → Home</span>
                    <small>Evening commute from campus</small>
                  </label>
                </div>
              </div>
              
              {/* Route Details */}
              <div className="form-section">
                <h3>Route Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      {proposalForm.routeType === 'to-columbia' ? 'From (Your Home Area)' : 'From'}
                    </label>
                    <input
                      type="text"
                      value={proposalForm.from}
                      onChange={(e) => handleInputChange('from', e.target.value)}
                      className={`form-input ${formErrors.from ? 'error' : ''}`}
                      placeholder={proposalForm.routeType === 'to-columbia' ? 'e.g., Flushing, Queens' : 'Starting location'}
                      readOnly={proposalForm.routeType === 'to-columbia'}
                    />
                    {formErrors.from && <span className="error-text">{formErrors.from}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      {proposalForm.routeType === 'from-home' ? 'To (Your Home Area) *' : 'To *'}
                    </label>
                    <input
                      type="text"
                      value={proposalForm.to}
                      onChange={(e) => handleInputChange('to', e.target.value)}
                      className={`form-input ${formErrors.to ? 'error' : ''}`}
                      placeholder={proposalForm.routeType === 'from-home' ? 'e.g., Flushing, Queens' : 'Destination'}
                      readOnly={proposalForm.routeType === 'from-home'}
                    />
                    {formErrors.to && <span className="error-text">{formErrors.to}</span>}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="form-section">
                <h3>Schedule</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Morning Departure</label>
                    <input
                      type="time"
                      value={proposalForm.schedule.morningTime}
                      onChange={(e) => handleInputChange('schedule.morningTime', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Evening Return</label>
                    <input
                      type="time"
                      value={proposalForm.schedule.eveningTime}
                      onChange={(e) => handleInputChange('schedule.eveningTime', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Operating Days *</label>
                  <div className="days-selector">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${proposalForm.schedule.days.includes(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {formErrors.days && <span className="error-text">{formErrors.days}</span>}
                </div>
              </div>

              {/* Additional Info */}
              <div className="form-section">
                <h3>Additional Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Semester</label>
                    <select
                      value={proposalForm.semester}
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                      className="form-input"
                    >
                      <option value="Fall 2025">Fall 2025</option>
                      <option value="Spring 2026">Spring 2026</option>
                      <option value="Summer 2026">Summer 2026</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Estimated Monthly Cost per Person ($) *</label>
                    <input
                      type="number"
                      value={proposalForm.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                      className={`form-input ${formErrors.estimatedCost ? 'error' : ''}`}
                      placeholder="e.g., 150"
                      min="0"
                    />
                    {formErrors.estimatedCost && <span className="error-text">{formErrors.estimatedCost}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={proposalForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="form-input"
                    placeholder="Any additional details about the route..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Your Contact Information *</label>
                  <input
                    type="text"
                    value={proposalForm.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    className={`form-input ${formErrors.contactInfo ? 'error' : ''}`}
                    placeholder="Email or phone number"
                  />
                  {formErrors.contactInfo && <span className="error-text">{formErrors.contactInfo}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProposalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

export default HomePage;

