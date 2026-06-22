import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { authAPI } from '../lib/authApi';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const [formData, _setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  const validateEmail = (val: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
  const isEmailValid = validateEmail(formData.email);
  const isPasswordValid = formData.password.length >= 8;
  const isConfirmValid = formData.password === formData.confirmPassword && formData.confirmPassword.length >= 8;
  const isFirstNameValid = formData.firstName.trim().length > 0;
  const isLastNameValid = formData.lastName.trim().length > 0;
  const isFormValid = isEmailValid && isPasswordValid && isConfirmValid && isFirstNameValid && isLastNameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isFormValid) {
      if (!isFirstNameValid) firstNameRef.current?.focus();
      else if (!isLastNameValid) passwordRef.current?.focus();
      else if (!isEmailValid) emailRef.current?.focus();
      else if (!isPasswordValid) passwordRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const data = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      setSuccess(true);
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        login(data.user, {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registratie mislukt. Probeer opnieuw.');
      passwordRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      {/* Toasts */}
      {showWelcome && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-primary-200 text-primary-700 px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          Welkom bij Almere Pickleball!
        </div>
      )}
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Almere Pickleball
          </h1>
          <p className="text-gray-600">Word lid van de club</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* ...existing code... */}
            <div className="grid grid-cols-2 gap-4">
              {/* ...existing code... */}
            </div>
            <div>
              {/* ...existing code... */}
            </div>
            <div>
              {/* ...existing code... */}
            </div>
            <div>
              {/* ...existing code... */}
            </div>
            <div>
              {/* ...existing code... */}
            </div>
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registreren...' : 'Registreren'}
            </button>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 text-center animate-fade-in">
                ✅ Je registratie is gelukt! Je wordt doorgestuurd...
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Al een account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Login hier
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
