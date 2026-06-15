import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'local', public_settings: {} });

  // Seed default farmer credentials in localStorage on load if missing
  useEffect(() => {
    try {
      const db = localStorage.getItem('users_database');
      if (!db) {
        const defaultUsers = [
          {
            id: 'demo-farmer-id',
            full_name: 'Demo Farmer',
            email: 'farmer@agriguard.com',
            password: 'password123',
            region: 'Punjab, India',
            crops: ['Wheat', 'Rice']
          }
        ];
        localStorage.setItem('users_database', JSON.stringify(defaultUsers));
      }
    } catch (e) {
      console.error('Failed to seed users database:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem('local_user');
        const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
        
        if (isLoggedIn && storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error('Local auth error:', e);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      // Dynamic simulated delay for visual excellence (loading spinner)
      await new Promise(resolve => setTimeout(resolve, 800));

      const dbRaw = localStorage.getItem('users_database');
      const users = dbRaw ? JSON.parse(dbRaw) : [];
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        throw new Error('No account found with this email. Please sign up!');
      }

      if (foundUser.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }

      // Successful login
      const loggedUser = {
        id: foundUser.id,
        email: foundUser.email,
        full_name: foundUser.full_name,
        region: foundUser.region || 'Not Specified',
        crops: foundUser.crops || []
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem('local_user', JSON.stringify(loggedUser));
      localStorage.setItem('is_logged_in', 'true');
      return { success: true };
    } catch (e) {
      setAuthError({ type: 'login_error', message: e.message });
      throw e;
    }
  };

  const register = async (fullName, email, password) => {
    setAuthError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const dbRaw = localStorage.getItem('users_database');
      const users = dbRaw ? JSON.parse(dbRaw) : [];
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        throw new Error('An account already exists with this email.');
      }

      const newUser = {
        id: 'user_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
        full_name: fullName,
        email: email,
        password: password,
        region: 'Not Specified',
        crops: []
      };

      users.push(newUser);
      localStorage.setItem('users_database', JSON.stringify(users));

      // Automatic login after successful registration
      const loggedUser = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        region: newUser.region,
        crops: newUser.crops
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      localStorage.setItem('local_user', JSON.stringify(loggedUser));
      localStorage.setItem('is_logged_in', 'true');
      return { success: true };
    } catch (e) {
      setAuthError({ type: 'register_error', message: e.message });
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.setItem('is_logged_in', 'false');
  };

  const navigateToLogin = () => {
    setIsAuthenticated(false);
  };

  const checkUserAuth = async () => {
    const storedUser = localStorage.getItem('local_user');
    const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (isLoggedIn && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  };

  const checkAppState = async () => {
    await checkUserAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      login,
      register,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
