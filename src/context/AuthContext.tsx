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

  // Load user from localStorage on mount and validate token
  useEffect(() => {
    const validateToken = async () => {
      const savedUserRaw = localStorage.getItem('auto_app_user');
      if (savedUserRaw) {
        try {
          const savedUser = JSON.parse(savedUserRaw) as User;
          if (savedUser.token) {
            const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${savedUser.token}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              const loggedUser: User = {
                ...data.user,
                token: savedUser.token
              };
              setUser(loggedUser);
              localStorage.setItem('auto_app_user', JSON.stringify(loggedUser));
            } else {
              localStorage.removeItem('auto_app_user');
              setUser(null);
            }
          } else {
            localStorage.removeItem('auto_app_user');
            setUser(null);
          }
        } catch (e) {
          localStorage.removeItem('auto_app_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const loggedUser: User = {
          ...data.user,
          token: data.token,
        };
        setUser(loggedUser);
        localStorage.setItem('auto_app_user', JSON.stringify(loggedUser));
        setIsLoading(false);
        return true;
      }
    } catch (e) {
      console.error('Login error:', e);
    }
    setIsLoading(false);
    return false;
  };

  const register = async (username: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });
      if (response.ok) {
        const data = await response.json();
        const newUser: User = {
          ...data.user,
          token: data.token,
        };
        setUser(newUser);
        localStorage.setItem('auto_app_user', JSON.stringify(newUser));
        setIsLoading(false);
        return true;
      }
    } catch (e) {
      console.error('Registration error:', e);
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
