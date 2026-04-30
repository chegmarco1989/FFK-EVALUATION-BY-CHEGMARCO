/**
 * =============================================================================
 * LOGIN FORM COMPONENT
 * =============================================================================
 * Reusable login form with validation.
 */

'use client';

import { useState, FormEvent } from 'react';
import { LoginCredentials } from '@/types';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    
    // Validation
    if (!username.trim()) {
      setFormError('Email or username is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    try {
      await onSubmit({ username: username.trim(), password });
    } catch (err) {
      // Error is handled by parent
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error message */}
      {(formError || error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
          <p className="text-red-700 text-sm font-medium">
            {formError || error}
          </p>
        </div>
      )}
      
      {/* Email/Username input */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
          Email or Username
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your email or username"
            className={cn(
              'input',
              (formError || error) && 'input-error'
            )}
            disabled={isLoading}
            autoComplete="username"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-600 text-sm">👤</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={cn(
              'input pr-24',
              (formError || error) && 'input-error'
            )}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      
      {/* Forgot password link */}
      <div className="text-right">
        <button
          type="button"
          className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
        >
          Having trouble in sign in?
        </button>
      </div>
      
      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
