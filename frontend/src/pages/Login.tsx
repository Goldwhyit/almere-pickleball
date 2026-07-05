import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../lib/authApi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{email: boolean; password: boolean}>({email: false, password: false});
  const [showWelcome, setShowWelcome] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Auth state changed
  useEffect(() => {
    // No auto-redirect
  }, [isAuthenticated]);

  // Don't auto-redirect if already logged in - let user stay on login page
  // This fixes the back-to-home issue

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Force clear everything and do hard navigation
    localStorage.clear();
    sessionStorage.clear();
    // Add cache buster to force fresh load
    window.location.href = '/?t=' + Date.now();
  };

  const validateEmail = (val: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({email: true, password: true});
    if (!isFormValid) {
      if (!isEmailValid) emailRef.current?.focus();
      else if (!isPasswordValid) passwordRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password);
      
      login(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        // Redirect based on account type
        const accountType = data.user.member?.accountType || data.user.accountType || 'MEMBER';
        if (accountType === 'TRIAL') {
          navigate('/trial-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err: any) {
      console.error('🔴 Login failed:', err);
      setError(err.response?.data?.message || 'Login mislukt. Probeer opnieuw.');
      passwordRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      {/* Toasts */}
      {showWelcome && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-primary-200 text-primary-700 px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          Welkom terug!
        </div>
      )}
      {/* Login Card */}
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Almere Pickleball
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                ref={emailRef}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({...t, email: true}))}
                required
                autoComplete="username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${touched.email && !isEmailValid ? 'border-accent-500' : 'border-gray-300'}`}
                placeholder="je@email.nl"
                aria-invalid={touched.email && !isEmailValid}
                aria-describedby="email-error"
              />
              {touched.email && !isEmailValid && (
                <div id="email-error" className="text-accent-600 text-xs mt-1">Voer een geldig e-mailadres in</div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                ref={passwordRef}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(t => ({...t, password: true}))}
                required
                autoComplete="current-password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${touched.password && !isPasswordValid ? 'border-accent-500' : 'border-gray-300'}`}
                placeholder="••••••••"
                aria-invalid={touched.password && !isPasswordValid}
                aria-describedby="password-error"
                minLength={8}
              />
              {touched.password && !isPasswordValid && (
                <div id="password-error" className="text-accent-600 text-xs mt-1">Minimaal 8 tekens</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Inloggen...' : 'Inloggen'}
            </button>
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Wachtwoord vergeten?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Nog geen account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Registreer hier
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={handleBackToHome}
            className="text-gray-600 hover:text-gray-800 cursor-pointer bg-transparent border-none underline"
          >
            ← Terug naar home
          </button>
        </div>
      </div>
    </div>
  );
}