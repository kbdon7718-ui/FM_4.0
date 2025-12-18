import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';

export default function RequireRole({ role, children }) {
  const user = getStoredUser();

  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
