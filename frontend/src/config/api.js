/**
 * API Configuration
 * This file centralizes all API-related configuration
 */

// Use API_URL without VITE_ prefix for Vercel compatibility
export const API_URL = import.meta.env.API_URL || 'http://localhost:5000/api';

// Export other API-related configuration here
export const API_TIMEOUT = 30000; // 30 seconds
