import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { memberAPI } from '../lib/memberApi';
import Modal from '../components/Modal';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const data = await memberAPI.getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        street: data.street || '',
        houseNumber: data.houseNumber || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        emergencyName: data.emergencyName || '',
        emergencyPhone: data.emergencyPhone || '',
        emergencyRelation: data.emergencyRelation || '',
        iban: data.iban || '',
        ibanAccountHolder: data.ibanAccountHolder || '',
        sepaMandateConsent: data.sepaMandateConsent || false,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await memberAPI.updateProfile(form);
      setSuccess('Gegevens opgeslagen');
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Er is een fout opgetreden bij het opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await memberAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Er is een fout opgetreden');
      setDeactivating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Laden...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-primary-100 hover:text-white text-sm font-semibold underline"
            >
              ← Terug naar dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Uitloggen
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-2">👤 Mijn account</h1>
          <p className="text-primary-100">{profile?.user?.email}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>
          )}

          {/* Persoonlijke gegevens */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Persoonlijke gegevens</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Voornaam" name="firstName" value={form.firstName} onChange={handleChange} />
              <Field label="Achternaam" name="lastName" value={form.lastName} onChange={handleChange} />
              <Field label="Telefoonnummer" name="phone" value={form.phone} onChange={handleChange} />
              <Field label="Geboortedatum" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>
          </div>

          {/* Adres */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Adres</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Straat" name="street" value={form.street} onChange={handleChange} />
              <Field label="Huisnummer" name="houseNumber" value={form.houseNumber} onChange={handleChange} />
              <Field label="Postcode" name="postalCode" value={form.postalCode} onChange={handleChange} />
              <Field label="Plaats" name="city" value={form.city} onChange={handleChange} />
            </div>
          </div>

          {/* Noodcontact */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Noodcontact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Naam" name="emergencyName" value={form.emergencyName} onChange={handleChange} />
              <Field label="Telefoonnummer" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} />
              <Field label="Relatie" name="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} />
            </div>
          </div>

          {/* Bankgegevens */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bankgegevens</h2>
            <p className="text-sm text-gray-600 mb-6">
              Nodig voor automatische incasso van je abonnement.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="IBAN" name="iban" value={form.iban} onChange={handleChange} placeholder="NL00BANK0123456789" />
              <Field label="Naam rekeninghouder" name="ibanAccountHolder" value={form.ibanAccountHolder} onChange={handleChange} />
            </div>
            <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                name="sepaMandateConsent"
                checked={form.sepaMandateConsent}
                onChange={handleChange}
                className="mt-1 h-5 w-5"
              />
              <span className="text-sm text-gray-700">
                Ik machtig Almere Pickleball om het verschuldigde bedrag voor mijn abonnement automatisch
                van bovenstaande rekening af te schrijven, totdat ik deze machtiging intrek.
              </span>
            </label>
            {profile?.sepaMandateConsentDate && (
              <p className="text-xs text-gray-500 mt-2">
                Machtiging gegeven op{' '}
                {new Date(profile.sepaMandateConsentDate).toLocaleDateString('nl-NL')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {saving ? 'Opslaan...' : 'Gegevens opslaan'}
          </button>

          {/* Gevarenzone */}
          <div className="bg-white rounded-lg shadow p-8 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-2">Account deactiveren</h2>
            <p className="text-sm text-gray-600 mb-4">
              Hiermee wordt je account gedeactiveerd en kun je niet meer inloggen. Je gegevens blijven
              bewaard voor de administratie van de club. Je kunt dit niet zelf ongedaan maken — neem
              hiervoor contact op met een beheerder.
            </p>
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Account deactiveren
            </button>
          </div>
        </form>
      </div>

      <Modal
        open={showDeactivateModal}
        title="Weet je het zeker?"
        onClose={() => setShowDeactivateModal(false)}
      >
        <div className="space-y-4">
          <p>
            Je account wordt gedeactiveerd en je kunt niet meer inloggen. Dit kun je niet zelf ongedaan
            maken.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {deactivating ? 'Bezig...' : 'Ja, deactiveren'}
            </button>
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}
