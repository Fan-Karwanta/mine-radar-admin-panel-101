import axios from 'axios';
import { API_BASE_URL } from '../config';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Auth service functions
export const authService = {
  // Login admin
  login: async (username, password) => {
    try {
      console.log('Attempting login with:', { username });
      
      // Use the admin login endpoint with username
      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, {
        username,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Store token and user info in localStorage
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Logout admin
  logout: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await axios.post(`${API_BASE_URL}/api/admin/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },
  
  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return false;
      
      const response = await axios.get(`${API_BASE_URL}/api/admin/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.success;
    } catch (error) {
      return false;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    const userJson = localStorage.getItem('admin_user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Verify authentication
  verifyAuth: async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        localStorage.removeItem('admin_user');
        return null;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/admin/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
        return response.data.admin;
      }
      
      return null;
    } catch (error) {
      console.error('Auth verification error:', error.response?.data || error.message);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      return null;
    }
  }
};
