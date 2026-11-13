import React, { createContext, useContext } from 'react';
import { UserProfile } from '../types';

interface AuthContextValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
