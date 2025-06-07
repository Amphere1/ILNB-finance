import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const attendanceService = {
    // Daily Login
    login: async (latitude, longitude, accuracy) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/attendance/login`, { latitude, longitude, accuracy }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Daily Logout
    logout: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/attendance/logout`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Get current user's monthly attendance report
    getMyMonthlyReport: async (month, year) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/attendance/my-monthly-report`, {
            params: { month, year },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Get all employees' monthly attendance reports (for managers)
    getAllMonthlyReports: async (month, year) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/attendance/all-monthly-reports`, {
            params: { month, year },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Get out-of-range logins for review (for managers)
    getOutOfRangeLogins: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/attendance/out-of-range-logins`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Regularize an out-of-range login
    regularizeLogin: async (id) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/attendance/regularize-login/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Add/Update company registered location (Admin only)
    setCompanyLocation: async (name, latitude, longitude, radius) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/attendance/company-location`, { name, latitude, longitude, radius }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Get company registered location
    getCompanyLocation: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/attendance/company-location`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
};

export default attendanceService;