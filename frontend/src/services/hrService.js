/**
 * HR Service for ILNB Finance CRM
 * Handles API calls to the backend for HR-related operations
 */

import axios from 'axios';
import { API_URL } from '../config/api';

// Leave Management
const applyLeave = async (leaveData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Applying for leave with data:', leaveData);
    const response = await axios.post(`${API_URL}/leave/apply`, leaveData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Leave application response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error applying for leave:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const getMyLeaveRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Fetching my leave requests');
    const response = await axios.get(`${API_URL}/leave/my-requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('My leave requests response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching my leave requests:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const getAllLeaveRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Fetching all leave requests');
    const response = await axios.get(`${API_URL}/leave/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('All leave requests response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const getPendingLeaveRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/leave/pending`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending leave requests:', error);
    throw error;
  }
};

const updateLeaveStatus = async (leaveId, statusData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/leave/${leaveId}/status`, statusData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating leave status:', error);
    throw error;
  }
};

const getApprovedByMeLeaveRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Fetching leave requests approved by me');
    const response = await axios.get(`${API_URL}/leave/approved-by-me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Leave requests approved by me response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching approved leave requests:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const getUserHierarchy = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Fetching user hierarchy data');
    const response = await axios.get(`${API_URL}/leave/debug/hierarchy`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('User hierarchy data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user hierarchy:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const fixLeaveApprovers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Running leave approver fix utility');
    const response = await axios.get(`${API_URL}/leave/debug/fix-approvers`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Fix result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fixing leave approvers:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const bulkFixApprovers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Running bulk fix for managers and approvers');
    const response = await axios.get(`${API_URL}/leave/debug/bulk-fix`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Bulk fix result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error running bulk fix:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

// Employee Management
const getEmployees = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/employees`, {
      params: filters,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

const addSubordinate = async (userData) => {
  try {
    // Get token and verify
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    console.log('Sending create subordinate request with data:', userData);
    console.log('Using authentication token:', token.substring(0, 10) + '...');  // Log part of the token for debugging
    
    // Validate required fields before sending to server
    const requiredFields = ['username', 'email', 'designation', 'department', 'location', 'dateOfJoining', 'role'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Include Authorization header with Bearer prefix
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Request headers:', JSON.stringify(headers));
    
    // Use axios.defaults.headers to ensure headers are set properly
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const response = await axios.post(`${API_URL}/auth/create-subordinate`, userData, { headers });
    
    console.log('Create subordinate response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding subordinate:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Enhanced error handling
      if (error.response.data && error.response.data.errors) {
        // Format validation errors in a more user-friendly way
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        error.message = `Validation errors: ${validationErrors}`;
      } else if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    }
    throw error;
  }
};

const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/auth/change-password`, passwordData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Test auth function for debugging
const testAuthentication = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log('Running authentication test with token:', token.substring(0, 10) + '...');
    
    const response = await axios.get(`${API_URL}/debug/auth-test`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Authentication test result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Authentication test error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw error.response.data;
    }
    throw error;
  }
};

const hrService = {
  // Leave Management
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  getPendingLeaveRequests,
  updateLeaveStatus,
  getApprovedByMeLeaveRequests,
  getUserHierarchy,
  fixLeaveApprovers,
  bulkFixApprovers,
  
  // Employee Management
  getEmployees,
  addSubordinate,
  changePassword,
  
  // Debug tools
  testAuthentication
};

export default hrService;
