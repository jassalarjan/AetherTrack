import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Rendering for path:', location.pathname, {
    loading,
    hasUser: !!user,
    user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
    allowedRoles,
  });

  if (loading) {
    console.log('[ProtectedRoute] Loading state, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin-fast rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-primary-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.error('[ProtectedRoute] No user found, redirecting to login from:', location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  // '*' means all authenticated users are allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes('*') && !allowedRoles.includes(user.role)) {
    console.error('[ProtectedRoute] User role not allowed', { 
      userRole: user.role, 
      allowedRoles,
      path: location.pathname 
    });
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[ProtectedRoute] ✅ Access granted for:', location.pathname, { userRole: user.role });
  return children;
};