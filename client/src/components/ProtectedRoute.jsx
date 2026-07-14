import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingScreen from './LoadingScreen.jsx';

/**
 * Route wrapper component that enforces authentication and Role-Based Access Control (RBAC)
 * @param {string[]} allowedRoles - Optional list of authorized roles allowed to view this page
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  // 1. Render Loading Screen while auth state is being initialized
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. Redirect unauthenticated requests to Login Page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Enforce RBAC rules: Check if user's role has permission to access the current route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Authorized: Render child elements or the route Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
