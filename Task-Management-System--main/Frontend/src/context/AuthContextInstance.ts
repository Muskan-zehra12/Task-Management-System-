import { createContext } from 'react';
import { type User, type AuthResponse } from '../types';

export interface AuthContextType {
  user: User | null;
  login: (authData: AuthResponse) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
