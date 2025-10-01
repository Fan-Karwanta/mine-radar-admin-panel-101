// Mining App Admin Panel Configuration

// Get API base URL from environment variables
// In development: http://localhost:3000
// In production: your deployed backend URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// App configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Mine Radar Admin Panel',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_NODE_ENV || 'development'
};

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('Admin Panel Config:', {
    API_BASE_URL,
    environment: APP_CONFIG.environment
  });
}
