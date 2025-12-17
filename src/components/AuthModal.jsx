/**
 * AuthModal - Login and Signup Component
 * Provides unified authentication interface for Columbia Point2Point Shuttle
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

// Google OAuth endpoint - User Service
const GOOGLE_OAUTH_URL = 'https://user-service-1081353560639.us-central1.run.app/api/auth/google';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, signup, loading } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [mode, setMode] = useState(initialMode); // Can be either 'login' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    homeArea: '',
    preferredDepartureTime: '08:00'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing to correct previous mistakes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Signup-specific validation
    if (mode === 'signup') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.homeArea.trim()) {
        newErrors.homeArea = 'Home area is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    let result;
    if (mode === 'login') {
      result = await login({
        email: formData.email,
        password: formData.password
      });
    } else {
      result = await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        homeArea: formData.homeArea,
        preferredDepartureTime: formData.preferredDepartureTime
      });
    }

    if (result.success) {
      onClose();
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        homeArea: '',
        preferredDepartureTime: '08:00'
      });
      setErrors({});
    } else {
      setErrors({ general: result.error });
    }
  };

  const switchMode = () => { // Switch between login and signup modes
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Welcome!'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="John"
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Home Area *</label>
                <input
                  type="text"
                  value={formData.homeArea}
                  onChange={(e) => handleInputChange('homeArea', e.target.value)}
                  className={`form-input ${errors.homeArea ? 'error' : ''}`}
                  placeholder="e.g., Flushing, Queens"
                />
                {errors.homeArea && <span className="error-text">{errors.homeArea}</span>}
              </div>

              <div className="form-group">
                <label>Preferred Departure Time</label>
                <input
                  type="time"
                  value={formData.preferredDepartureTime}
                  onChange={(e) => handleInputChange('preferredDepartureTime', e.target.value)}
                  className="form-input"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your.email@columbia.edu"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          {/* OAuth Divider */}
          <div className="oauth-divider">
            <span>or</span>
          </div>

          {/* Google OAuth Login Button */}
          <button
            type="button"
            className="btn btn-google btn-full"
            onClick={() => {
              setOauthLoading(true);
              // Redirect to Google OAuth endpoint
              window.location.href = GOOGLE_OAUTH_URL;
            }}
            disabled={oauthLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="link-button" onClick={switchMode}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>


      </div>
    </div>
  );
};

export default AuthModal;