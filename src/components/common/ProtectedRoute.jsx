import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { API_BASE_URL } from "../../config";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use correct localStorage keys that match LoginPage.jsx
        const token = localStorage.getItem('admin_token');
        const adminUser = localStorage.getItem('admin_user');
        
        if (!token || !adminUser) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify token with server
        const response = await fetch(`${API_BASE_URL}/api/admin/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setIsAuthenticated(false);
          }
        } else {
          // Server error or token invalid
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear potentially invalid tokens
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
