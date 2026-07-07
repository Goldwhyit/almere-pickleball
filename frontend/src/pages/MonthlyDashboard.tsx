import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { membershipsAPI } from '../lib/membershipsApi';
import { settingsApi } from '../lib/settingsApi';
import Modal from '../components/Modal';

export default function MonthlyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [discountPercentage, setDiscountPercentage] = useState('10');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.member?.membershipPlan !== 'MONTHLY') {
      navigate('/dashboard');
      return;
    }

    fetchStatus();
    settingsApi
      .getSetting('yearly_discount_percentage')
      .then((res) => {
        if (res.value) setDiscountPercentage(res.value);
      })
      .catch(() => {});
  }, [user, navigate]);

  const fetchStatus = async () => {
    try {
      const res = await membershipsAPI.getMyMembership();
      setData(res);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => navigate('/');

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Laden...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-screen">Kan gegevens niet laden</div>;
  }

  const firstName = user?.member?.firstName || 'lid';
  const membership = data.membership;
  const isPaymentOutstanding = Boolean(data.isPaymentOutstanding);
  const monthlyPrice = data.monthlyPrice ?? 15.75;
  const signupDate = membership?.startDate || null;
  const currentPeriodEnd = membership?.currentPeriodEnd;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleBackToHome}
              className="text-primary-100 hover:text-white text-sm font-semibold underline"
            >
              ← Terug naar home
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                👤 Mijn account
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
          </div>
          <h1 className="text-4xl font-bold mb-2">📅 Mijn Maandabonnement</h1>
          <p className="text-primary-100">Welkom, {firstName}!</p>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Abonnementsgegevens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Inschrijfdatum</p>
              <p className="text-lg font-bold text-gray-900">
                {signupDate
                  ? new Date(signupDate).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div
              className={`border rounded-lg p-4 ${
                isPaymentOutstanding ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Vervaldatum</p>
              <p className={`text-lg font-bold ${isPaymentOutstanding ? 'text-red-700' : 'text-gray-900'}`}>
                {currentPeriodEnd
                  ? new Date(currentPeriodEnd).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
              {isPaymentOutstanding && (
                <p className="text-xs text-red-600 mt-1 font-semibold">⚠️ Betaling openstaand</p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              💡 Bij een jaarabonnement profiteer je van <strong>{discountPercentage}% korting</strong> ten
              opzichte van maandelijks betalen.{' '}
              <button onClick={() => navigate('/word-lid')} className="underline font-semibold">
                Bekijk jaarabonnement
              </button>
            </p>
          </div>
        </div>
      </div>

      {isPaymentOutstanding && (
        <Modal open={true} title="⚠️ Betaling openstaand" onClose={() => {}}>
          <div className="space-y-4">
            <p>
              Je hebt een openstaand bedrag van <strong>€{monthlyPrice.toFixed(2).replace('.', ',')}</strong> voor
              je maandabonnement.
            </p>
            <p className="text-sm text-gray-600">
              Zodra de betaling door de beheerder is verwerkt, verdwijnt deze melding automatisch.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
