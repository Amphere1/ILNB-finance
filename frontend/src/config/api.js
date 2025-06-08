/**
 * API Configuration
 * This file centralizes all API-related configuration
 */

const getApiUrl = () => {
  // Check if we're in production
  const isProd = import.meta.env.MODE === 'production';
  
  // Use different environment variables based on the environment
  if (isProd) {
    // Try different environment variable formats that Vercel might use
    const prodUrl = import.meta.env.API_URL || 
                   import.meta.env.NEXT_PUBLIC_API_URL || 
                   'https://ilnb-finance-backend.vercel.app/api';
    console.log('Production API URL:', prodUrl);
    return prodUrl;
  }
  
  // Development environment
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

// Export other API-related configuration here
export const API_TIMEOUT = 30000; // 30 seconds
