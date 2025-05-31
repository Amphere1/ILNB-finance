import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import * as authService from '../services/authService';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if we have a user in localStorage
        const storedUser = authService.getCurrentUser();
        
        if (storedUser) {
          // If we have a stored user, verify the token
          try {
            await authService.verifyToken();
            setUser(storedUser);
          } catch (error) {
            // If token verification fails, clear the stored user
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      setUser(response.user);
      
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/dashboard');
      
      return response;
    } catch (error) {
      setError(error.message);
      enqueueSnackbar(error.message || 'Login failed', { variant: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      setUser(response.user);
      
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      navigate('/dashboard');
      
      return response;
    } catch (error) {
      setError(error.message);
      enqueueSnackbar(error.message || 'Registration failed', { variant: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
    navigate('/login');
  };

  // Check if user has a specific role
  const hasRole = (requiredRoles) => {
    return authService.hasRole(requiredRoles);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;