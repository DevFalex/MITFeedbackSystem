import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface UserType {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: UserType | null;
  setAuth: (token: string | null, user: UserType | null) => void;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );
  const [user, setUser] = useState<UserType | null>(
    localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // On mount, optionally validate token and fetch user profile
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get<UserType>(
            'https://mitfeedbacksystem.onrender.com/api/users/me',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setUser(res.data);
        } catch {
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [token, user]);

  const setAuth = (newToken: string | null, newUser: UserType | null) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setAuth, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
