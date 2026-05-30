import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextInstance';
import { type AuthResponse, type User } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const joinDate = localStorage.getItem('joinDate');
    const rolesStr = localStorage.getItem('roles');
    
    if (token && username && email && joinDate) {
      try {
        const roles = JSON.parse(rolesStr || '[]');
        return { username, email, joinDate, roles };
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [isLoading] = useState(false);

  useEffect(() => {
    // Initial check done in useState
  }, []);

  const login = (authData: AuthResponse) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('username', authData.username);
    localStorage.setItem('email', authData.email);
    localStorage.setItem('joinDate', authData.joinDate);
    localStorage.setItem('roles', JSON.stringify(authData.roles));
    setUser({ 
      username: authData.username, 
      email: authData.email, 
      joinDate: authData.joinDate, 
      roles: authData.roles 
    });
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      if (userData.username) localStorage.setItem('username', userData.username);
      if (userData.email) localStorage.setItem('email', userData.email);
      if (userData.roles) localStorage.setItem('roles', JSON.stringify(userData.roles));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('joinDate');
    localStorage.removeItem('roles');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
