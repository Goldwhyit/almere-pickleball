import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trialApi } from '../lib/trialApi';
import Modal from '../components/Modal';

export default function TrialSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'Voornaam is verplicht';
    if (!formData.lastName.trim()) errors.lastName = 'Achternaam is verplicht';
    if (!formData.email.includes('@')) errors.email = 'Geldig email adres verplicht';
    if (!formData.phone.trim()) errors.phone = 'Telefoonnummer is verplicht';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Geboortedatum is verplicht';
    if (formData.password.length < 8) errors.password = 'Wachtwoord moet minimaal 8 karakters zijn';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }
    if (!formData.agreedToTerms) errors.agreedToTerms = 'Je moet akkoord gaan met de voorwaarden';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const _result = await trialApi.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
        agreedToTerms: formData.agreedToTerms,
      });

      setSuccess(true);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            email: formData.email,
            message: 'Aanmelding geslaagd! Log in met je nieuwe account.',
          },
        });
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Er is een fout opgetreden. Probeer het opnieuw.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal
        open={true}
        onClose={() => {}}
        title="🎾 Welkom bij je gratis proeflessen!"
      >
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-3">
            Aanmelding voltooid!
          </h2>
          <p className="text-gray-700 mb-4">
            Je account is succesvol aangemaakt, {formData.firstName}!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-green-900 mb-2">Volgende stap:</h3>
            <p className="text-green-800 text-sm mb-2">
              1. Log in met je emailadres: <strong>{formData.email}</strong>
            </p>
            <p className="text-green-800 text-sm mb-2">
              2. Ga naar je proefles dashboard
            </p>
            <p className="text-green-800 text-sm">
              3. Kies <strong>3 datums</strong> voor je gratis proeflessen
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Je wordt automatisch doorgestuurd naar inloggen...
          </p>
          <button
            onClick={() =>
              navigate('/login', {
                state: { email: formData.email },
              })
            }
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Nu inloggen →
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 border-t-4 border-green-600">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎾</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gratis Proeflessen
          </h1>
          <p className="text-gray-600">
            Meld je aan voor 3 gratis pickleball sessies
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voornaam
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Jouw voornaam"
            />
            {validationErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Achternaam
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Jouw achternaam"
            />
            {validationErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="jouw@email.com"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefoonnummer
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="06 12345678"
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Geboortedatum
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Minimaal 8 karakters"
            />
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wachtwoord herhalen
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Herhaal je wachtwoord"
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 mt-6 pt-4 border-t">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-green-600 rounded cursor-pointer"
            />
            <label className="text-sm text-gray-700 cursor-pointer">
              Ik ga akkoord met de{' '}
              <a href="#" className="text-green-600 hover:underline font-semibold">
                algemene voorwaarden
              </a>{' '}
              en{' '}
              <a href="#" className="text-green-600 hover:underline font-semibold">
                privacybeleid
              </a>
            </label>
          </div>
          {validationErrors.agreedToTerms && (
            <p className="text-red-500 text-xs">{validationErrors.agreedToTerms}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Bezig met aanmelden...' : 'Meld je aan voor proeflessen →'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            Al ingelogd?{' '}
            <a href="/login" className="text-green-600 hover:underline font-semibold">
              Log hier in
            </a>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            <strong>💚 Wat je krijgt:</strong> 3 gratis proeflessen, materiaal inbegrepen,
            begeleiding van trainers, geen verplichting!
          </p>
        </div>
      </div>
    </div>
  );
}
