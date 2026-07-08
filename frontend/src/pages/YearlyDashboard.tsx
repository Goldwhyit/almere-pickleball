import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { membershipsAPI } from '../lib/membershipsApi';
import { settingsApi } from '../lib/settingsApi';
import Modal from '../components/Modal';

const VARIANT_LABELS: Record<string, string> = {
  YEARLY: 'Automatische incasso (maandelijks)',
  YEARLY_UPFRONT: 'Ineens betaald',
};

export default function YearlyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [discountPercentage, setDiscountPercentage] = useState('10');
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.member?.membershipPlan !== 'YEARLY' && user.member?.membershipPlan !== 'YEARLY_UPFRONT') {
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

  const handleChooseRenewal = async (choice: 'YEARLY' | 'YEARLY_UPFRONT') => {
    if (!membership) return;
    setChoosing(true);
    try {
      await membershipsAPI.setRenewalChoice(membership.id, choice);
      await fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Er is een fout opgetreden');
    } finally {
      setChoosing(false);
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
  const isPaymentDueSoon = Boolean(data.isPaymentDueSoon);
  const isRenewalDue = Boolean(data.isRenewalDue);
  const remainingMonths = data.remainingMonths;
  const yearlyMonthlyInstallmentPrice = data.yearlyMonthlyInstallmentPrice ?? 15.58;
  const yearlyUpfrontPrice = data.yearlyUpfrontPrice ?? 168;
  const isYearly = membership?.plan === 'YEARLY';
  const variantLabel = membership?.plan ? VARIANT_LABELS[membership.plan] : '—';
  const showPaymentReminder = isYearly && (isPaymentDueSoon || isPaymentOutstanding);
  const showRenewalPopup = !isYearly && isRenewalDue;

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
          <h1 className="text-4xl font-bold mb-2">🏆 Mijn Jaarabonnement</h1>
          <p className="text-primary-100">Welkom, {firstName}!</p>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Abonnementsgegevens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Betaalvariant</p>
              <p className="text-lg font-bold text-gray-900">{variantLabel}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Resterend in huidig seizoen</p>
              <p className="text-lg font-bold text-gray-900">
                {remainingMonths !== null ? `${remainingMonths} maand${remainingMonths === 1 ? '' : 'en'}` : '—'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Inschrijfdatum</p>
              <p className="text-lg font-bold text-gray-900">
                {membership?.startDate
                  ? new Date(membership.startDate).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div
              className={`border rounded-lg p-4 ${
                showPaymentReminder || showRenewalPopup ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Einddatum seizoen</p>
              <p
                className={`text-lg font-bold ${
                  showPaymentReminder || showRenewalPopup ? 'text-red-700' : 'text-gray-900'
                }`}
              >
                {membership?.endDate
                  ? new Date(membership.endDate).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              ✨ Je jaarabonnement geeft je <strong>{discountPercentage}% korting</strong> ten opzichte van
              maandelijks betalen (€{yearlyMonthlyInstallmentPrice.toFixed(2).replace('.', ',')}/maand i.p.v.
              €15,75/maand).
            </p>
          </div>
        </div>
      </div>

      {showPaymentReminder && (
        <Modal
          open={true}
          title={isPaymentOutstanding ? '⚠️ Incasso openstaand' : '💳 Incasso komt eraan'}
          onClose={() => {}}
        >
          <div className="space-y-4">
            <p>
              {isPaymentOutstanding ? (
                <>
                  Je maandelijkse termijn van{' '}
                  <strong>€{yearlyMonthlyInstallmentPrice.toFixed(2).replace('.', ',')}</strong> voor je
                  jaarabonnement staat open.
                </>
              ) : (
                <>
                  Binnenkort wordt <strong>€{yearlyMonthlyInstallmentPrice.toFixed(2).replace('.', ',')}</strong>{' '}
                  automatisch afgeschreven voor je jaarabonnement.
                </>
              )}
            </p>
            <p className="text-sm text-gray-600">
              Zodra de incasso door de beheerder is verwerkt, verdwijnt deze melding automatisch.
            </p>
          </div>
        </Modal>
      )}

      {showRenewalPopup && (
        <Modal open={true} title="🏆 Nieuw seizoen komt eraan!" onClose={() => {}}>
          <div className="space-y-4">
            {membership?.pendingRenewalChoice ? (
              <>
                <p>
                  Je hebt gekozen voor{' '}
                  <strong>{VARIANT_LABELS[membership.pendingRenewalChoice]}</strong>.
                </p>
                <p className="text-sm text-gray-600">
                  De beheerder verwerkt je verlenging binnenkort. Deze melding verdwijnt automatisch zodra dat
                  is gebeurd.
                </p>
              </>
            ) : (
              <>
                <p>Je jaarabonnement loopt bijna af. Hoe wil je verlengen?</p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleChooseRenewal('YEARLY')}
                    disabled={choosing}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Verlengen via automatische incasso (€{yearlyMonthlyInstallmentPrice.toFixed(2).replace('.', ',')}
                    /maand)
                  </button>
                  <button
                    onClick={() => handleChooseRenewal('YEARLY_UPFRONT')}
                    disabled={choosing}
                    className="w-full border border-primary-600 text-primary-700 font-bold py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Verlengen via ineens betalen (€{yearlyUpfrontPrice})
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
