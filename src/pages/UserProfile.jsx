/**
 * UserProfile Component
 * Displays and allows editing of user profile information
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    homeArea: user?.homeArea || '',
    preferredDepartureTime: user?.preferredDepartureTime || '08:00'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSave = async () => {
    // Validate
    const newErrors = {};
    if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profileData.homeArea.trim()) newErrors.homeArea = 'Home area is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await updateProfile(profileData);
    if (result.success) {
      setEditing(false);
      setErrors({});
    } else {
      setErrors({ general: result.error });
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      homeArea: user?.homeArea || '',
      preferredDepartureTime: user?.preferredDepartureTime || '08:00'
    });
    setErrors({});
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {errors.general && (
        <div className="error-banner">
          {errors.general}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          
          <div className="profile-grid">
            <div className="profile-field">
              <label>First Name</label>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </>
              ) : (
                <div className="profile-value">{user.firstName}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Last Name</label>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </>
              ) : (
                <div className="profile-value">{user.lastName}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Email</label>
              <div className="profile-value">{user.email}</div>
              <small className="field-note">Email cannot be changed</small>
            </div>

            <div className="profile-field">
              <label>Home Area</label>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={profileData.homeArea}
                    onChange={(e) => handleInputChange('homeArea', e.target.value)}
                    className={`form-input ${errors.homeArea ? 'error' : ''}`}
                    placeholder="e.g., Flushing, Queens"
                  />
                  {errors.homeArea && <span className="error-text">{errors.homeArea}</span>}
                </>
              ) : (
                <div className="profile-value">{user.homeArea}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Preferred Departure Time</label>
              {editing ? (
                <input
                  type="time"
                  value={profileData.preferredDepartureTime}
                  onChange={(e) => handleInputChange('preferredDepartureTime', e.target.value)}
                  className="form-input"
                />
              ) : (
                <div className="profile-value">{user.preferredDepartureTime}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Member Since</label>
              <div className="profile-value">
                {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'Recently joined'}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Activity Summary</h2>
          <div className="activity-stats">
            <div className="stat-item">
              <div className="stat-number">{user.joinedRoutes?.length || 0}</div>
              <div className="stat-label">Routes Joined</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.activeSubscriptions?.length || 0}</div>
              <div className="stat-label">Active Subscriptions</div>
            </div>
          </div>
        </div>

        {editing && (
          <div className="profile-actions">
            <button 
              className="btn btn-secondary" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>


    </div>
  );
};

export default UserProfile;