import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Admin' | 'User';

export interface User {
  username: string;
  email: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auto_app_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('auto_app_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (email && password.length >= 4) {
      // Find or create user
      let username = email.split('@')[0];
      username = username.charAt(0).toUpperCase() + username.slice(1);
      
      // Check if user exists in local database or set a default role
      const role: UserRole = email.toLowerCase().includes('admin') ? 'Admin' : 'User';
      
      const loggedUser: User = {
        username,
        email,
        role,
        token: 'mock-jwt-token-xyz'
      };

      setUser(loggedUser);
      localStorage.setItem('auto_app_user', JSON.stringify(loggedUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (username: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (username && email && password.length >= 4) {
      const newUser: User = {
        username,
        email,
        role,
        token: 'mock-jwt-token-xyz'
      };

      setUser(newUser);
      localStorage.setItem('auto_app_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auto_app_user');
  };

  const updateRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('auto_app_user', JSON.stringify(updated));
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
