/**
 * AuthModal - Login and Signup Component
 * Provides unified authentication interface for Columbia Point2Point Shuttle
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, signup, loading } = useAuth();
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