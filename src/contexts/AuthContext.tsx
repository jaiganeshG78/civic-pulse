import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for different roles
const demoUsers: Record<string, User> = {
  'citizen@demo.com': {
    id: '1',
    email: 'citizen@demo.com',
    name: 'John Citizen',
    role: 'citizen',
    trust_score: 85,
    created_at: new Date().toISOString(),
  },
  'staff@demo.com': {
    id: '2',
    email: 'staff@demo.com',
    name: 'Sarah Staff',
    role: 'department_staff',
    department: 'Public Works',
    created_at: new Date().toISOString(),
  },
  'admin@demo.com': {
    id: '3',
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const storedUser = localStorage.getItem('civic_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('civic_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In production, this would call your backend API
      // For demo, we'll use predefined users
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const demoUser = demoUsers[email.toLowerCase()];
      if (demoUser) {
        setUser(demoUser);
        localStorage.setItem('civic_user', JSON.stringify(demoUser));
        localStorage.setItem('civic_token', 'demo_jwt_token');
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: 'citizen',
        trust_score: 100,
        created_at: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem('civic_user', JSON.stringify(newUser));
      localStorage.setItem('civic_token', 'demo_jwt_token');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civic_user');
    localStorage.removeItem('civic_token');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('civic_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to check if user has a specific role
export function useHasRole(role: UserRole | UserRole[]) {
  const { user } = useAuth();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}

// Hook to require authentication
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}
