import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi FE khởi động, gọi API lấy user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userAPI.getProfile(); // hoặc getMe()
        setUser(res.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    await authAPI.login(credentials); // BE sẽ set cookie
    console.log('login', credentials);
    // Sau khi login, gọi lại API lấy user info
    const res = await userAPI.getProfile();
    setUser(res.data);
  };

  const loginWithToken = async (tokens) => {
    // Lưu tokens vào localStorage tạm thời cho Google login
    if (tokens.access_token) {
      localStorage.setItem('token', tokens.access_token);
    }
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    
    // Sau khi login, gọi lại API lấy user info
    const res = await userAPI.getProfile();
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    // Xóa tokens khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout, isAuthenticated: !!user }}>
      {!loading && children}
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