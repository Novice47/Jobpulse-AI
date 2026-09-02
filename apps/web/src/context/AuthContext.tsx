import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
}

export interface Profile {
  _id?: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  education: string;
  degree: string;
  graduationYear?: number;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  currentRole: string;
  targetRoles: string[];
  skills: string[];
  preferredLocations: string[];
  remotePreference: 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
  salaryExpectation: number;
  yearsOfExperience: number;
  profileVisibility: 'PUBLIC' | 'PRIVATE';
  profileCompleteness: number;
}

interface SignupParams {
  email: string;
  password: string;
  name: string;
  currentRole?: string;
  skills?: string[];
  experienceLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
}

interface GoogleAuthParams {
  credential?: string;
  email?: string;
  name?: string;
  picture?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (params: SignupParams) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (params: GoogleAuthParams) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user || null);
          setProfile(json.data.profile || null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('[Auth] Fetch session error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const signup = async (params: SignupParams) => {
    const res = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create account');
    }

    setUser(json.data.user);
    setProfile(json.data.profile);
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Invalid email or password');
    }

    setUser(json.data.user);
    setProfile(json.data.profile);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (params: GoogleAuthParams) => {
    const res = await fetch('/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Google authentication failed');
    }

    setUser(json.data.user);
    setProfile(json.data.profile);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const res = await fetch('/api/v1/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update profile');
    }

    setProfile(json.data);
    if (json.data.name && user) {
      setUser({ ...user, name: json.data.name });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: Boolean(user),
        signup,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser: fetchSession,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
