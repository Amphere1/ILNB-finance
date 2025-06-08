import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/company-settings`;

// Get company settings
const getCompanySettings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    throw error;
  }
};

// Update company settings
const updateCompanySettings = async (settingsData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(API_URL, settingsData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw error;
  }
};

// Get all office locations
const getOfficeLocations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/office-locations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching office locations:', error);
    throw error;
  }
};

// Add a new office location
const addOfficeLocation = async (locationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/office-locations`, 
      locationData, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding office location:', error);
    throw error;
  }
};

// Update an existing office location
const updateOfficeLocation = async (locationId, locationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/office-locations/${locationId}`, 
      locationData, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating office location:', error);
    throw error;
  }
};

// Delete an office location
const deleteOfficeLocation = async (locationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `${API_URL}/office-locations/${locationId}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting office location:', error);
    throw error;
  }
};

const companySettingsService = {
  getCompanySettings,
  updateCompanySettings,
  getOfficeLocations,
  addOfficeLocation,
  updateOfficeLocation,
  deleteOfficeLocation
};

export default companySettingsService;
