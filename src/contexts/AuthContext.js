/**
 * Authentication Context for Columbia Point2Point Shuttle
 * Manages user authentication state and integrates with Auth & User Service via composite service
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

// Create a React context for auth state
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth status: whether user is logged in

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage or session)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Try to find user by email in the real API
      const response = await apiService.getUserByEmail(credentials.email);
      
      if (response && response.id) {
        // User found - store in localStorage
        const userData = {
          id: response.id,
          email: response.email,
          firstName: response.firstName || response.first_name || '',
          lastName: response.lastName || response.last_name || '',
          homeArea: response.homeArea || response.home_area || '',
          preferredDepartureTime: response.preferredDepartureTime || '08:00'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'User not found. Please sign up first.' 
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Ensure error is always a string
      const errorMsg = typeof error === 'string' ? error : 
                       (error?.message || 'Login failed. Please check your credentials.');
      return { 
        success: false, 
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      
      // Create user via real API
      const response = await apiService.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        homeArea: userData.homeArea,
        preferredDepartureTime: userData.preferredDepartureTime
      });
      
      if (response && (response.id || response.userId)) {
        const newUser = {
          id: response.id || response.userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          homeArea: userData.homeArea,
          preferredDepartureTime: userData.preferredDepartureTime
        };
        
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Failed to create account.' 
        };
      }
    } catch (error) {
      console.error('Signup failed:', error);
      // Ensure error is always a string
      const errorMsg = typeof error === 'string' ? error : 
                       (error?.message || 'Signup failed. Please try again.');
      return { 
        success: false, 
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const updatedUser = {
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        homeArea: profileData.homeArea,
        preferredDepartureTime: profileData.preferredDepartureTime,
      };

      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update failed (mock):', error);
      return {
        success: false,
        error: 'Failed to update profile.',
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};