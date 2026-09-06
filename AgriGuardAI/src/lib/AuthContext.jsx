import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const SUPA_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ptnlnpcycionjciuodep.supabase.co';
const SUPA_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DTMpMtKdF346pVGIQ8XMjw_FAeBcaIz';
const isSupabase = !!(SUPA_URL && SUPA_KEY && SUPA_KEY.length > 10);

function supaHeaders() {
  return {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function supaFindUser(email) {
  if (!isSupabase) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/UserAccount?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
      { headers: supaHeaders() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch (err) {
    console.warn('Mobile supaFindUser failed:', err.message);
    return null;
  }
}

async function supaCreateUser(userData) {
  if (!isSupabase) return null;
  const res = await fetch(`${SUPA_URL}/rest/v1/UserAccount`, {
    method: 'POST',
    headers: supaHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Mobile supaCreateUser failed:', res.status, errText);
    throw new Error(`Cloud user creation failed (${res.status}): ${errText}`);
  }
  const rows = await res.json();
  return rows[0] || userData;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('local_user');
        const isLoggedIn = (await AsyncStorage.getItem('is_logged_in')) === 'true';

        if (isLoggedIn && storedUser && storedUser !== 'null') {
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
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase cloud auth check first
    let foundUser = await supaFindUser(cleanEmail);

    // 2. Fallback to AsyncStorage database if offline or user not in cloud
    if (!foundUser) {
      try {
        const dbRaw = await AsyncStorage.getItem('users_database');
        const users = dbRaw ? JSON.parse(dbRaw) : [];
        foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
      } catch {}
    }

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
      crops: foundUser.crops || [],
    };

    setUser(loggedUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('local_user', JSON.stringify(loggedUser));
    await AsyncStorage.setItem('is_logged_in', 'true');
    return { success: true };
  };

  const register = async (fullName, email, password) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Check if account exists in Supabase
    let exists = await supaFindUser(cleanEmail);

    if (!exists) {
      try {
        const dbRaw = await AsyncStorage.getItem('users_database');
        const users = dbRaw ? JSON.parse(dbRaw) : [];
        exists = users.some(u => u.email.toLowerCase() === cleanEmail);
      } catch {}
    }

    if (exists) {
      throw new Error('An account already exists with this email.');
    }

    const userId = 'user_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const newUser = {
      id: userId,
      full_name: fullName,
      email: cleanEmail,
      password: password,
      region: 'Not Specified',
      crops: [],
    };

    // Save to Supabase Cloud
    await supaCreateUser(newUser);

    // Save to local storage as fallback
    try {
      const dbRaw = await AsyncStorage.getItem('users_database');
      const users = dbRaw ? JSON.parse(dbRaw) : [];
      users.push(newUser);
      await AsyncStorage.setItem('users_database', JSON.stringify(users));
    } catch {}

    const loggedUser = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      region: newUser.region,
      crops: newUser.crops,
    };

    setUser(loggedUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('local_user', JSON.stringify(loggedUser));
    await AsyncStorage.setItem('is_logged_in', 'true');
    return { success: true };
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

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      login,
      register,
      logout,
      deleteAccount,
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
