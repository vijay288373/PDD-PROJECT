import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'local', public_settings: {} });

  // Seed default farmer credentials in AsyncStorage on load if missing
  useEffect(() => {
    const seed = async () => {
      try {
        const db = await AsyncStorage.getItem('users_database');
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
          await AsyncStorage.setItem('users_database', JSON.stringify(defaultUsers));
        }
      } catch (e) {
        console.error('Failed to seed users database:', e);
      }
    };
    seed();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('local_user');
        const isLoggedIn = await AsyncStorage.getItem('is_logged_in') === 'true';
        
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
      await new Promise(resolve => setTimeout(resolve, 800));

      const dbRaw = await AsyncStorage.getItem('users_database');
      const users = dbRaw ? JSON.parse(dbRaw) : [];
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        throw new Error('No account found with this email. Please sign up!');
      }

      if (foundUser.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }

      const loggedUser = {
        id: foundUser.id,
        email: foundUser.email,
        full_name: foundUser.full_name,
        region: foundUser.region || 'Not Specified',
        crops: foundUser.crops || []
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('local_user', JSON.stringify(loggedUser));
      await AsyncStorage.setItem('is_logged_in', 'true');
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

      const dbRaw = await AsyncStorage.getItem('users_database');
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
      await AsyncStorage.setItem('users_database', JSON.stringify(users));

      const loggedUser = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        region: newUser.region,
        crops: newUser.crops
      };

      setUser(loggedUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('local_user', JSON.stringify(loggedUser));
      await AsyncStorage.setItem('is_logged_in', 'true');
      return { success: true };
    } catch (e) {
      setAuthError({ type: 'register_error', message: e.message });
      throw e;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('local_user');
      await AsyncStorage.setItem('is_logged_in', 'false');
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const deleteAccount = async () => {
    try {
      if (user?.email) {
        const dbRaw = await AsyncStorage.getItem('users_database');
        if (dbRaw) {
          const users = JSON.parse(dbRaw);
          const filtered = users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
          await AsyncStorage.setItem('users_database', JSON.stringify(filtered));
        }
      }
      await AsyncStorage.removeItem('local_user');
      await AsyncStorage.setItem('is_logged_in', 'false');
      await AsyncStorage.removeItem('agriguard_profile');
      await AsyncStorage.removeItem('agriguard_scans');
    } catch (e) {
      console.error('Delete account error:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    setIsAuthenticated(false);
  };

  const checkUserAuth = async () => {
    const storedUser = await AsyncStorage.getItem('local_user');
    const isLoggedIn = await AsyncStorage.getItem('is_logged_in') === 'true';
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
      deleteAccount,
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
