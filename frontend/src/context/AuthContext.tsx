import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TRAINER' | 'STUDENT';
  gymId?: string;
  trainerId?: string;
  inviteCode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  tags?: string[];
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  gym: Gym | null;
  originalLoginRole: 'ADMIN' | 'TRAINER' | 'STUDENT' | null;
  trainersList: User[];
  studentsList: User[];
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, inviteCode?: string) => Promise<void>;
  logout: () => void;
  setGym: (gym: Gym | null) => void;
  switchDemoRole: (role: 'ADMIN' | 'TRAINER' | 'STUDENT') => void;
  selectTrainerUser: (trainer: User) => void;
  selectStudentUser: (student: User) => void;
  updateUserGymAffiliation: (userId: string, gymId?: string) => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    return (localStorage.getItem('fitpulse_orig_role') as 'ADMIN' | 'TRAINER' | 'STUDENT' | null) || null;
  });

  const [adminSnapshot, setAdminSnapshot] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitpulse_admin_snapshot');
    return saved ? JSON.parse(saved) : null;
  });

  const [trainersList, setTrainersList] = useState<User[]>([]);
  const [studentsList, setStudentsList] = useState<User[]>([]);

  const persistSession = (nextUser: User, nextToken: string, nextGym: Gym | null, origRole: User['role']) => {
    setUser(nextUser);
    setToken(nextToken);
    setGym(nextGym);
    setOriginalLoginRole(origRole);
    localStorage.setItem('fitpulse_user', JSON.stringify(nextUser));
    localStorage.setItem('fitpulse_token', nextToken);
    localStorage.setItem('fitpulse_orig_role', origRole);
    if (origRole === 'ADMIN') {
      setAdminSnapshot(nextUser);
      localStorage.setItem('fitpulse_admin_snapshot', JSON.stringify(nextUser));
    }
  };

  const refreshUserLists = async () => {
    if (originalLoginRole !== 'ADMIN' && user?.role !== 'ADMIN') {
      setTrainersList([]);
      setStudentsList([]);
      return;
    }
    try {
      const combined = await apiFetch<User[]>('/api/users');
      setTrainersList(combined.filter((u) => u.role === 'TRAINER'));
      setStudentsList(combined.filter((u) => u.role === 'STUDENT'));
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  useEffect(() => {
    refreshUserLists();
  }, [user, originalLoginRole]);

  useEffect(() => {
    if (gym) {
      document.documentElement.style.setProperty('--brand-primary', gym.primaryColor || '#0f172a');
      document.documentElement.style.setProperty('--brand-secondary', gym.secondaryColor || '#2563eb');
    } else {
      document.documentElement.style.setProperty('--brand-primary', '#0f172a');
      document.documentElement.style.setProperty('--brand-secondary', '#2563eb');
    }
  }, [gym]);

  const setGym = (newGym: Gym | null) => {
    setGymState(newGym);
    if (newGym) {
      localStorage.setItem('fitpulse_gym', JSON.stringify(newGym));
    } else {
      localStorage.removeItem('fitpulse_gym');
    }
  };

  const syncGymForUser = async (u: User) => {
    if (!u.gymId) {
      setGym(null);
      return;
    }
    const gymsList = await apiFetch<Gym[]>('/api/gyms');
    setGym(gymsList.find((g) => g.id === u.gymId) || null);
  };

  const login = async (email: string, pass: string) => {
    const data = await apiFetch<{ token: string; user: User; gym: Gym | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    persistSession(data.user, data.token, data.gym, data.user.role);
  };

  const register = async (name: string, email: string, pass: string, inviteCode?: string) => {
    const data = await apiFetch<{ token: string; user: User; gym: Gym | null }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, inviteCode })
    });
    persistSession(data.user, data.token, data.gym, 'STUDENT');
    await refreshUserLists();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setGymState(null);
    setOriginalLoginRole(null);
    setAdminSnapshot(null);
    localStorage.removeItem('fitpulse_user');
    localStorage.removeItem('fitpulse_token');
    localStorage.removeItem('fitpulse_gym');
    localStorage.removeItem('fitpulse_orig_role');
    localStorage.removeItem('fitpulse_admin_snapshot');
  };

  const switchDemoRole = (role: 'ADMIN' | 'TRAINER' | 'STUDENT') => {
    if (originalLoginRole !== 'ADMIN') return;
    if (role === 'ADMIN' && adminSnapshot) {
      setUser(adminSnapshot);
      localStorage.setItem('fitpulse_user', JSON.stringify(adminSnapshot));
      syncGymForUser(adminSnapshot);
      return;
    }
    if (role === 'TRAINER' && trainersList[0]) {
      selectTrainerUser(trainersList[0]);
      return;
    }
    if (role === 'STUDENT' && studentsList[0]) {
      selectStudentUser(studentsList[0]);
    }
  };

  const selectTrainerUser = (trainer: User) => {
    setUser(trainer);
    syncGymForUser(trainer);
    localStorage.setItem('fitpulse_user', JSON.stringify(trainer));
  };

  const selectStudentUser = (student: User) => {
    setUser(student);
    syncGymForUser(student);
    localStorage.setItem('fitpulse_user', JSON.stringify(student));
  };

  const updateUserGymAffiliation = async (userId: string, gymId?: string) => {
    const updated = await apiFetch<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ gymId: gymId || null })
    });
    if (user && user.id === userId) {
      setUser(updated);
      localStorage.setItem('fitpulse_user', JSON.stringify(updated));
      await syncGymForUser(updated);
    }
    await refreshUserLists();
  };

  const deleteUserAccount = async (userId: string) => {
    await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
    await refreshUserLists();
    if (user && user.id === userId) {
      switchDemoRole('ADMIN');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      gym,
      originalLoginRole,
      trainersList,
      studentsList,
      login,
      register,
      logout,
      setGym,
      switchDemoRole,
      selectTrainerUser,
      selectStudentUser,
      updateUserGymAffiliation,
      deleteUserAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
