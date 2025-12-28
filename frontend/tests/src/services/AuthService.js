// services/AuthService.js
const API_BASE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';

export const AuthService = {
  /**
   * Login user
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<{success: boolean, token?: string, userId?: string, username?: string, message?: string}>}
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },

  /**
   * Create new account
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<{success: boolean, userId?: string, message?: string}>}
   */
  async createAccount(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create account error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },

  /**
   * Verify token
   * @param {string} token 
   * @returns {Promise<{success: boolean, userId?: string, username?: string, message?: string}>}
   */
  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify token error:', error);
      return {
        success: false,
        message: 'Token verification failed'
      };
    }
  },

  /**
   * Logout user (client-side token removal)
   * @returns {{success: boolean}}
   */
  logout() {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage
    return { success: true };
  }
};

