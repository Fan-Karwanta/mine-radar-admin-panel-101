import { API_BASE_URL } from '../config';

class AdminService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/admin`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('adminToken');
  }

  // Create headers with auth token
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Dashboard Analytics
  async getDashboardAnalytics() {
    try {
      const response = await fetch(`${this.baseURL}/dashboard/analytics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard analytics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      throw error;
    }
  }

  // Reports Management
  async getReports(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/reports?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  }

  async getReportById(id) {
    try {
      const response = await fetch(`${this.baseURL}/reports/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get report error:', error);
      throw error;
    }
  }

  async updateReportStatus(id, status) {
    try {
      const response = await fetch(`${this.baseURL}/reports/${id}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update report status error:', error);
      throw error;
    }
  }

  async deleteReport(id) {
    try {
      const response = await fetch(`${this.baseURL}/reports/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/users?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async updateUserRole(id, role) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  async updateUserStatus(id, status) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
}

export default new AdminService();
