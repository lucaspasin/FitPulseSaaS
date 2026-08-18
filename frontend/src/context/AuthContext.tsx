import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'STUDENT';
  gymId?: string;
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
  trainersList: User[];
  studentsList: User[];
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, inviteCode?: string) => Promise<void>;
  logout: () => void;
  setGym: (gym: Gym | null) => void;
  switchDemoRole: (role: 'ADMIN' | 'TRAINER' | 'STUDENT') => Promise<void>;
  selectTrainerUser: (trainer: User) => void;
  selectStudentUser: (student: User) => void;
  updateUserGymAffiliation: (userId: string, gymId?: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_GYM: Gym = {
  id: 'gym-dutra12',
  name: 'DUTRA12 Treinamento Esportivo',
  slug: 'dutra12',
  logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  primaryColor: '#0f172a',
  secondaryColor: '#2563eb'
};

const DEFAULT_MOCK_USERS: Record<string, User> = {
  'admin@fitpulse.com': {
    id: 'usr-admin',
    email: 'admin@fitpulse.com',
    name: 'Dev System Admin (PO)',
    role: 'ADMIN',
    gymId: 'gym-dutra12'
  },
  'treinador@dutra12.com': {
    id: 'usr-trainer-dutra',
    email: 'treinador@dutra12.com',
    name: 'Coach Dutra',
    role: 'TRAINER',
    gymId: 'gym-dutra12',
    inviteCode: 'TRN-DUTRA12'
  },
  'lucas@pasin.com': {
    id: 'usr-student-lucas',
    email: 'lucas@pasin.com',
    name: 'Lucas Pasin',
    role: 'STUDENT',
    gymId: 'gym-dutra12',
    trainerId: 'usr-trainer-dutra',
    tags: ['Meia Maratona', 'Foco Bíceps', 'Avançado']
  }
};

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

  const [trainersList, setTrainersList] = useState<User[]>([]);
  const [studentsList, setStudentsList] = useState<User[]>([]);

  // Load trainers and students list from storage
  const refreshUserLists = async () => {
    const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    
    // Merge defaults
    const combined = [...Object.values(DEFAULT_MOCK_USERS)];
    localUsers.forEach((u: any) => {
      if (!combined.some(c => c.id === u.id || c.email === u.email)) {
        combined.push(u);
      }
    });

    setTrainersList(combined.filter(u => u.role === 'TRAINER'));
    setStudentsList(combined.filter(u => u.role === 'STUDENT'));
  };

  useEffect(() => {
    refreshUserLists();
  }, [user]);

  // Apply whitelabel CSS custom properties when gym changes
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

  const syncGymForUser = (targetUser: User | null) => {
    if (!targetUser || !targetUser.gymId || targetUser.gymId === 'independent') {
      setGym(null);
      return;
    }
    const localGyms: Gym[] = JSON.parse(localStorage.getItem('fitpulse_gyms') || '[]');
    const matched = localGyms.find(g => g.id === targetUser.gymId);
    if (matched) {
      setGym(matched);
    } else if (targetUser.gymId === 'gym-dutra12') {
      setGym(DEMO_GYM);
    } else {
      setGym(null);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setGym(data.gym);
        const origRole = data.user.role;
        setOriginalLoginRole(origRole);
        localStorage.setItem('fitpulse_user', JSON.stringify(data.user));
        localStorage.setItem('fitpulse_token', data.token);
        localStorage.setItem('fitpulse_orig_role', origRole);
        return;
      } else if (!res.ok && contentType && contentType.includes('application/json')) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('Unexpected end')) {
        throw err;
      }
    }

    // Client-Side Fallback for Static Web Apps
    const lowerEmail = email.toLowerCase().trim();
    const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    let matchedUser = localUsers.find((u: any) => u.email.toLowerCase() === lowerEmail);
    if (!matchedUser) {
      matchedUser = DEFAULT_MOCK_USERS[lowerEmail];
    }

    if (matchedUser) {
      setUser(matchedUser);
      setToken('mock-jwt-token-azure-static');
      syncGymForUser(matchedUser);
      setOriginalLoginRole(matchedUser.role);
      localStorage.setItem('fitpulse_user', JSON.stringify(matchedUser));
      localStorage.setItem('fitpulse_token', 'mock-jwt-token-azure-static');
      localStorage.setItem('fitpulse_orig_role', matchedUser.role);
    } else {
      throw new Error('E-mail ou senha incorretos');
    }
  };

  const register = async (name: string, email: string, pass: string, inviteCode?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, inviteCode })
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setGym(data.gym);
        setOriginalLoginRole('STUDENT');
        localStorage.setItem('fitpulse_user', JSON.stringify(data.user));
        localStorage.setItem('fitpulse_token', data.token);
        localStorage.setItem('fitpulse_orig_role', 'STUDENT');
        return;
      }
    } catch (err) {
      console.warn('Using client-side registration fallback:', err);
    }

    // Dynamic Trainer lookup by inviteCode
    const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    const allTrainers = [...Object.values(DEFAULT_MOCK_USERS), ...localUsers].filter((u: any) => u.role === 'TRAINER');
    const matchedTrainer = inviteCode ? allTrainers.find((u: any) => 
      u.inviteCode?.toUpperCase() === inviteCode.toUpperCase() || 
      `TRN-${u.name.toUpperCase().replace(/\s+/g, '')}` === inviteCode.toUpperCase()
    ) : null;

    const assignedTrainerId = matchedTrainer ? matchedTrainer.id : 'usr-trainer-dutra';

    const newSt: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'STUDENT',
      gymId: matchedTrainer ? matchedTrainer.gymId : undefined,
      trainerId: assignedTrainerId
    };

    localStorage.setItem('fitpulse_users', JSON.stringify([...localUsers, newSt]));

    setUser(newSt);
    setToken('mock-jwt-token-azure-static');
    syncGymForUser(newSt);
    setOriginalLoginRole('STUDENT');
    localStorage.setItem('fitpulse_user', JSON.stringify(newSt));
    localStorage.setItem('fitpulse_token', 'mock-jwt-token-azure-static');
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
    
    const currentOrig = originalLoginRole;
    await login(email, pass);
    if (currentOrig === 'ADMIN') {
      setOriginalLoginRole('ADMIN');
      localStorage.setItem('fitpulse_orig_role', 'ADMIN');
    }
  };

  const selectTrainerUser = (trainer: User) => {
    const currentOrig = originalLoginRole;
    setUser(trainer);
    syncGymForUser(trainer);
    localStorage.setItem('fitpulse_user', JSON.stringify(trainer));
    if (currentOrig === 'ADMIN') {
      setOriginalLoginRole('ADMIN');
      localStorage.setItem('fitpulse_orig_role', 'ADMIN');
    }
  };

  const selectStudentUser = (student: User) => {
    const currentOrig = originalLoginRole;
    setUser(student);
    syncGymForUser(student);
    localStorage.setItem('fitpulse_user', JSON.stringify(student));
    if (currentOrig === 'ADMIN') {
      setOriginalLoginRole('ADMIN');
      localStorage.setItem('fitpulse_orig_role', 'ADMIN');
    }
  };

  const updateUserGymAffiliation = (userId: string, gymId?: string) => {
    const localUsers = JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
    let userToUpdate = localUsers.find((u: any) => u.id === userId);

    if (userToUpdate) {
      userToUpdate.gymId = gymId;
      localStorage.setItem('fitpulse_users', JSON.stringify(localUsers));
    }

    if (user && user.id === userId) {
      const updated = { ...user, gymId };
      setUser(updated);
      syncGymForUser(updated);
      localStorage.setItem('fitpulse_user', JSON.stringify(updated));
    }

    refreshUserLists();
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
      updateUserGymAffiliation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
