/**
 * API Configuration
 * This file centralizes all API-related configuration
 */

const getApiUrl = () => {
  // Check if we're in production
  const isProd = import.meta.env.MODE === 'production';
  
  // Use different environment variables based on the environment
  if (isProd) {
    // In Vite, environment variables must be prefixed with VITE_
    const prodUrl = import.meta.env.VITE_API_URL;
    if (!prodUrl) {
      console.warn('VITE_API_URL environment variable is not set. Using fallback URL.');
      return 'https://ilnb-finance-backend.vercel.app/api';
    }
    console.log('Production API URL:', prodUrl);
    return prodUrl;
  }
  
  // Development environment
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

// Export other API-related configuration here
export const API_TIMEOUT = 30000; // 30 seconds
