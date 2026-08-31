import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (storedToken) {
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
            
            // Sync user data back to the same storage
            if (localStorage.getItem('token')) {
              localStorage.setItem('user', JSON.stringify(data.user));
            } else {
              sessionStorage.setItem('user', JSON.stringify(data.user));
            }
          } else {
            // Token invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          }
        } catch (err) {
          console.error("Auth init error:", err);
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setUser(data.user);
      setToken(data.token);
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(data.user));
      storage.setItem('token', data.token);
      
      // Clean up the other storage just in case
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('user');
      otherStorage.removeItem('token');
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setUser(data.user);
      setToken(data.token);
      
      // Default to localStorage for register
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };
  
  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (localStorage.getItem('token')) {
      localStorage.setItem('user', JSON.stringify(newUserData));
    } else {
      sessionStorage.setItem('user', JSON.stringify(newUserData));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
