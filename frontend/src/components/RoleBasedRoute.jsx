import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccessDenied from './AccessDenied';

const RoleBasedRoute = ({ children, requiredRoles, redirectTo = '/dashboard', showAccessDenied = true }) => {
  const { user, hasRole } = useAuth();

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have required role
  if (!hasRole(requiredRoles)) {
    // Either show access denied component or redirect
    return showAccessDenied ? <AccessDenied /> : <Navigate to={redirectTo} replace />;
  }

  // User has required role, render children
  return children;
};

export default RoleBasedRoute;