import { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  signup as apiSignup, 
  logout as apiLogout, 
  getCurrentUser,
  isAuthenticated as checkAuth,
  getStoredUser 
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (checkAuth()) {
        try {
          // Try to get user from localStorage first
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Verify with backend
          const { user: currentUser } = await getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Auth initialization error:', err);
          // Token invalid, clear stored data
          apiLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: loggedInUser } = await apiLogin(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: newUser } = await apiSignup(name, email, password, role);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiLogout();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isSupervisor: user?.role === 'supervisor',
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
