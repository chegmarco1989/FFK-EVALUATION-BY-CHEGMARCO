/**
 * =============================================================================
 * LOGIN PAGE
 * =============================================================================
 * Beautiful authentication page with pixel-perfect design.
 * Implements the maquette with smooth animations and transitions.
 */

'use client';

import { useState, SubmitEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SOCIAL_PROVIDERS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
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
      await login({ username: username.trim(), password });
    } catch (err) {
      // Error is handled by AuthContext
      setFormError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-3xl z-0" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-300 rounded-full opacity-20 blur-3xl z-0" />

      {/* Login card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold text-white drop-shadow-lg">
            Gallery
          </h1>
          <p className="text-white/90 mt-2 drop-shadow-md">Welcome back</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-hard">
          {/* Title */}
          <h2 className="font-playfair text-3xl font-bold text-neutral-900 mb-2">
            Login Your Account
          </h2>
          <p className="text-neutral-600 text-sm mb-8">
            Hey, Enter your details to get sign in to your account
          </p>

          {/* Error message */}
          {(formError || error) && (
            <div className="mb-6 p-4 bg-error-light border border-error-DEFAULT rounded-lg animate-shake">
              <p className="text-error-dark text-sm font-medium">
                {formError || error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full relative overflow-hidden group"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">
                — Or Sign in with —
              </span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-3 gap-4">
            {SOCIAL_PROVIDERS.map((provider) => (
              <button
                key={provider.name}
                type="button"
                className="btn-secondary py-3 px-3 text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                disabled
              >
                <img
                  src={provider.icon}
                  alt={provider.name}
                  className="w-4 h-4 object-contain flex-shrink-0"
                />
                <span className="text-xs">{provider.name}</span>
              </button>
            ))}
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-neutral-600 mt-8">
            Not Registered Yet?{' '}
            <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Create an account
            </button>
          </p>
        </div>

        {/* Test credentials hint */}
        <div className="mt-6 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-lg">
          <p className="text-xs text-neutral-800 text-center mb-2 font-semibold">
            Test Credentials:
          </p>
          <div className="text-xs text-neutral-700 space-y-1 font-medium">
            <p>✅ muser1 / mpassword1</p>
            <p>✅ muser2 / mpassword2</p>
            <p>❌ muser3 / mpassword3 (blocked)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
