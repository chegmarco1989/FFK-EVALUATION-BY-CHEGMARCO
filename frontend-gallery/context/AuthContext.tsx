/**
 * =============================================================================
 * AUTHENTICATION CONTEXT
 * =============================================================================
 * Provides authentication state and methods throughout the application.
 * Manages login, logout, and user session persistence.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthContextType, User, LoginCredentials } from '@/types';
import { login as apiLogin, getCurrentUser } from '@/lib/api';
import { STORAGE_KEYS, ROUTES, TEST_CREDENTIALS, ERROR_MESSAGES } from '@/lib/constants';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/utils';

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component
 * Wraps the application to provide auth state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  /**
   * Check if user is authenticated on mount
   * Restores session from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getLocalStorage<string | null>(STORAGE_KEYS.ACCESS_TOKEN, null);
        const savedUser = getLocalStorage<User | null>(STORAGE_KEYS.USER_DATA, null);
        
        if (token && savedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          } catch (err) {
            // Token expired or invalid, clear storage
            removeLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
            removeLocalStorage(STORAGE_KEYS.USER_DATA);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  /**
   * Login user with credentials
   * Handles test credentials and blocked account logic
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Check for blocked account (muser3)
      if (
        credentials.username === TEST_CREDENTIALS.BLOCKED_USER.username &&
        credentials.password === TEST_CREDENTIALS.BLOCKED_USER.password
      ) {
        throw new Error(ERROR_MESSAGES.ACCOUNT_BLOCKED);
      }
      
      // Check for valid test credentials
      const isValidTestUser = 
        (credentials.username === TEST_CREDENTIALS.VALID_USER_1.username &&
         credentials.password === TEST_CREDENTIALS.VALID_USER_1.password) ||
        (credentials.username === TEST_CREDENTIALS.VALID_USER_2.username &&
         credentials.password === TEST_CREDENTIALS.VALID_USER_2.password);
      
      if (!isValidTestUser) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
      
      // In a real app, we'd call the backend API here
      // For this demo, we simulate a successful login
      const mockUser: User = {
        id: credentials.username === TEST_CREDENTIALS.VALID_USER_1.username ? 1 : 2,
        firstName: credentials.username === TEST_CREDENTIALS.VALID_USER_1.username ? 'User' : 'Test',
        lastName: credentials.username === TEST_CREDENTIALS.VALID_USER_1.username ? 'One' : 'Two',
        birthDate: '1990-01-01T00:00:00.000Z',
        city: 'Paris',
        country: 'FR',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`,
        company: 'Demo Company',
        jobPosition: 'Developer',
        mobile: '+33 6 12 34 56 78',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockToken = `mock-jwt-token-${credentials.username}-${Date.now()}`;
      
      // Save to localStorage
      setLocalStorage(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
      setLocalStorage(STORAGE_KEYS.USER_DATA, mockUser);
      
      // Update state
      setUser(mockUser);
      
      // Redirect to gallery
      router.push(ROUTES.GALLERY);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SOMETHING_WENT_WRONG;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  /**
   * Logout user
   * Clears session and redirects to login
   */
  const logout = useCallback(() => {
    // Clear storage
    removeLocalStorage(STORAGE_KEYS.ACCESS_TOKEN);
    removeLocalStorage(STORAGE_KEYS.USER_DATA);
    
    // Clear state
    setUser(null);
    setError(null);
    
    // Redirect to login
    router.push(ROUTES.LOGIN);
  }, [router]);
  
  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    error,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
