/**
 * User management service for ILNB Finance CRM
 * Handles API calls to the backend for user management operations
 */

import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:5000/api';

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} - List of users
 */
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} updateData.role - New role
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUserRole = async (userId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user role');
    }

    return await response.json();
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};

/**
 * Request role upgrade
 * @param {string} requestedRole - Role being requested
 * @param {string} justification - Reason for the request
 * @returns {Promise<Object>} - Request data
 */
export const requestRoleUpgrade = async (requestedRole, justification) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const user = getCurrentUser();
    if (!user || !user._id) {
      throw new Error('User information not found');
    }

    const response = await fetch(`${API_URL}/users/role-request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        currentRole: user.role,
        requestedRole,
        justification,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit role upgrade request');
    }

    return await response.json();
  } catch (error) {
    console.error('Role upgrade request error:', error);
    throw error;
  }
};

/**
 * Get role upgrade requests (admin only)
 * @returns {Promise<Array>} - List of role upgrade requests
 */
export const getRoleRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/role-requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch role requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Get role requests error:', error);
    throw error;
  }
};

/**
 * Approve or reject role upgrade request (admin only)
 * @param {string} requestId - Request ID
 * @param {boolean} approved - Whether the request is approved
 * @param {string} [comment] - Optional comment
 * @returns {Promise<Object>} - Updated request data
 */
export const processRoleRequest = async (requestId, approved, comment = '') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/role-requests/${requestId}`, {
      method: 'PUT', // Changed from PATCH to PUT to match backend route
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: approved ? 'approved' : 'rejected', // Changed to match backend expectation
        comment,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process role request');
    }

    return await response.json();
  } catch (error) {
    console.error('Process role request error:', error);
    throw error;
  }
};

/**
 * Get count of pending role upgrade requests (admin only)
 * @returns {Promise<number>} - Count of pending role requests
 */
export const getPendingRoleRequestsCount = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/role-requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch role requests');
    }

    const requests = await response.json();
    return requests.filter(request => request.status === 'pending').length;
  } catch (error) {
    console.error('Get pending role requests count error:', error);
    return 0; // Return 0 on error to avoid breaking the UI
  }
};