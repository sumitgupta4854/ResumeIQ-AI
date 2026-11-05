import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container section"><div className="skeleton" style={{ height: 120 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
