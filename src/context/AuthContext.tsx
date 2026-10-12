'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentProfile } from '@/types';
import { db } from '@/lib/db';
import { INITIAL_USERS } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, role: UserRole, department?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  quickDemoLogin: (role: UserRole) => void;
  refreshUserData: () => void;
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'skillpassport_current_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage or default to demo student
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsedUser: User = JSON.parse(stored);
        const liveUser = db.getUserById(parsedUser.id) || parsedUser;
        setUser(liveUser);
        if (liveUser.role === 'student') {
          const profile = db.getStudentByUserId(liveUser.id);
          setStudentProfile(profile || null);
        }
      } else {
        // Default to demo student on first load
        const defaultStudent = INITIAL_USERS.find((u) => u.role === 'student') || INITIAL_USERS[0];
        setUser(defaultStudent);
        const profile = db.getStudentByUserId(defaultStudent.id);
        setStudentProfile(profile || null);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultStudent));
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      const fallback = INITIAL_USERS[0];
      setUser(fallback);
    } finally {
      setIsLoading(false);
    }

    // Listen to db update events across components
    const handleDbUpdate = () => {
      refreshUserData();
    };
    window.addEventListener('skillpassport_data_updated', handleDbUpdate);
    return () => window.removeEventListener('skillpassport_data_updated', handleDbUpdate);
  }, []);

  const refreshUserData = () => {
    if (!user) return;
    const freshUser = db.getUserById(user.id);
    if (freshUser) {
      setUser(freshUser);
      if (freshUser.role === 'student') {
        const prof = db.getStudentByUserId(freshUser.id);
        setStudentProfile(prof || null);
      }
    }
  };

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const existing = db.getUserByEmail(email);
    if (!existing) {
      return { success: false, message: 'No account found with this email. Please register.' };
    }
    setUser(existing);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existing));
    if (existing.role === 'student') {
      const prof = db.getStudentByUserId(existing.id);
      setStudentProfile(prof || null);
    } else {
      setStudentProfile(null);
    }
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    role: UserRole,
    department: string = 'Computer Science'
  ): Promise<{ success: boolean; message?: string }> => {
    const existing = db.getUserByEmail(email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    db.saveUser(newUser);

    if (role === 'student') {
      const newStudentProfile: StudentProfile = {
        id: `student-prof-${Date.now()}`,
        userId: newUser.id,
        fullName: name,
        email,
        collegeName: 'National Institute of Technology',
        department,
        rollNumber: `NIT-${Math.floor(1000 + Math.random() * 9000)}`,
        graduationYear: 2026,
        cgpa: 8.0,
        skills: [
          { name: 'JavaScript', level: 'Intermediate', verified: true },
          { name: 'React', level: 'Beginner', verified: false },
          { name: 'Git', level: 'Intermediate', verified: true },
        ],
        projects: [],
        certifications: [],
        careerInterests: ['Software Engineer'],
        bio: 'Aspiring engineering graduate exploring opportunities.',
      };
      db.saveStudentProfile(newStudentProfile);
      setStudentProfile(newStudentProfile);
    } else {
      setStudentProfile(null);
    }

    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setStudentProfile(null);
  };

  const quickDemoLogin = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(targetUser));
      if (targetUser.role === 'student') {
        const prof = db.getStudentByUserId(targetUser.id);
        setStudentProfile(prof || null);
      } else {
        setStudentProfile(null);
      }
    }
  };

  const switchRole = (newRole: UserRole) => {
    quickDemoLogin(newRole);
  };

  const updateStudentProfile = (partial: Partial<StudentProfile>) => {
    if (!studentProfile) return;
    const updated: StudentProfile = { ...studentProfile, ...partial };
    db.saveStudentProfile(updated);
    setStudentProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        quickDemoLogin,
        refreshUserData,
        updateStudentProfile,
      }}
    >
      {children}
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
