import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Set adminOnly={true} to restrict to admin users
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="loading">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
