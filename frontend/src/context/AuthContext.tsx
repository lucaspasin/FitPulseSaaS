import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'STUDENT';
  gymId: string;
  trainerId?: string;
  inviteCode?: string;
  tags?: string[];
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  gym: Gym | null;
  originalLoginRole: 'ADMIN' | 'TRAINER' | 'STUDENT' | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, inviteCode?: string) => Promise<void>;
  logout: () => void;
  setGym: (gym: Gym) => void;
  switchDemoRole: (role: 'ADMIN' | 'TRAINER' | 'STUDENT') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fitpulse_token') || null;
  });

  const [gym, setGymState] = useState<Gym | null>(() => {
    const saved = localStorage.getItem('fitpulse_gym');
    return saved ? JSON.parse(saved) : null;
  });

  const [originalLoginRole, setOriginalLoginRole] = useState<'ADMIN' | 'TRAINER' | 'STUDENT' | null>(() => {
    return (localStorage.getItem('fitpulse_orig_role') as any) || null;
  });

  // Apply whitelabel CSS custom properties when gym changes
  useEffect(() => {
    if (gym) {
      document.documentElement.style.setProperty('--brand-primary', gym.primaryColor || '#0f172a');
      document.documentElement.style.setProperty('--brand-secondary', gym.secondaryColor || '#2563eb');
    }
  }, [gym]);

  const setGym = (newGym: Gym) => {
    setGymState(newGym);
    localStorage.setItem('fitpulse_gym', JSON.stringify(newGym));
  };

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    setGym(data.gym);

    const origRole = data.user.role;
    setOriginalLoginRole(origRole);

    localStorage.setItem('fitpulse_user', JSON.stringify(data.user));
    localStorage.setItem('fitpulse_token', data.token);
    localStorage.setItem('fitpulse_orig_role', origRole);
  };

  const register = async (name: string, email: string, pass: string, inviteCode?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, inviteCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    setGym(data.gym);

    setOriginalLoginRole('STUDENT');
    localStorage.setItem('fitpulse_user', JSON.stringify(data.user));
    localStorage.setItem('fitpulse_token', data.token);
    localStorage.setItem('fitpulse_orig_role', 'STUDENT');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setGymState(null);
    setOriginalLoginRole(null);
    localStorage.removeItem('fitpulse_user');
    localStorage.removeItem('fitpulse_token');
    localStorage.removeItem('fitpulse_gym');
    localStorage.removeItem('fitpulse_orig_role');
  };

  const switchDemoRole = async (role: 'ADMIN' | 'TRAINER' | 'STUDENT') => {
    let email = 'lucas@pasin.com';
    let pass = 'student123';
    if (role === 'ADMIN') {
      email = 'admin@fitpulse.com';
      pass = 'admin123';
    } else if (role === 'TRAINER') {
      email = 'treinador@dutra12.com';
      pass = 'trainer123';
    }
    
    // Perform login while preserving original Admin role session if original was ADMIN
    const currentOrig = originalLoginRole;
    await login(email, pass);
    if (currentOrig === 'ADMIN') {
      setOriginalLoginRole('ADMIN');
      localStorage.setItem('fitpulse_orig_role', 'ADMIN');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, gym, originalLoginRole, login, register, logout, setGym, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
