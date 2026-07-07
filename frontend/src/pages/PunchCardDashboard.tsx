import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { punchCardApi } from '../lib/punchCardApi';
import Modal from '../components/Modal';

const TOTAL_STRIPS = 10;

export default function PunchCardDashboard() {
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  const token = accessToken || localStorage.getItem('accessToken') || localStorage.getItem('token') || '';

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (user.member?.membershipPlan !== 'PUNCH_CARD') {
      navigate('/dashboard');
      return;
    }

    fetchStatus();
  }, [user, token, navigate]);

  const fetchStatus = async () => {
    try {
      const data = await punchCardApi.getMyStatus(token);
      setStatus(data);
      if (data.remaining === 1 && !upsellDismissed) {
        setShowUpsellModal(true);
      }
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

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const getAvailableDates = (expiryDate: string, bookedDates: string[]) => {
    const result: string[] = [];
    if (!expiryDate) return result;
    const end = new Date(expiryDate);
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor.getTime() <= end.getTime()) {
      const day = cursor.getDay();
      if (day === 2 || day === 4) {
        const dateStr = toLocalDateStr(cursor);
        if (!bookedDates.includes(dateStr)) {
          result.push(dateStr);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  };

  const startPicking = (index: number) => {
    setPickingIndex(index);
    setSelectedDate('');
  };

  const cancelPicking = () => {
    setPickingIndex(null);
    setSelectedDate('');
  };

  const confirmPicking = async (session: any) => {
    if (!selectedDate) return;
    try {
      if (session) {
        await punchCardApi.rescheduleSession(token, session.id, selectedDate);
      } else {
        await punchCardApi.bookDate(token, selectedDate);
      }
      cancelPicking();
      await fetchStatus();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          (session ? 'Er is een fout opgetreden bij het wijzigen' : 'Er is een fout opgetreden bij het inplannen')
      );
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!confirm('Weet je zeker dat je deze sessie wilt annuleren?')) return;
    try {
      await punchCardApi.cancelSession(token, sessionId);
      await fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Er is een fout opgetreden bij het annuleren');
    }
  };

  const handleBackToHome = () => navigate('/');

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Laden...</div>;
  }

  if (!status) {
    return <div className="flex items-center justify-center h-screen">Kan gegevens niet laden</div>;
  }

  const sessions = status.sessions || [];
  const remaining = status.remaining ?? 0;
  const bookedDates = sessions.map((s: any) => new Date(s.scheduledDate).toISOString().split('T')[0]);
  const availableDates = getAvailableDates(status.expiryDate, bookedDates);
  const firstName = user?.member?.firstName || 'lid';

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎟️ Mijn Strippenkaart</h1>
              <p className="text-primary-100">Welkom, {firstName}!</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-white">
                {remaining}/{TOTAL_STRIPS}
              </div>
              <p className="text-primary-100 mt-1">Strippen resterend</p>
            </div>
          </div>
        </div>

        {/* Alles in één venster */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Jouw strippenkaart</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: TOTAL_STRIPS }).map((_, i) => {
              const stripLabel = TOTAL_STRIPS - i;
              const session = sessions[i];
              const isPicking = pickingIndex === i;

              // Datumkeuze rechtstreeks in het vakje zelf
              if (isPicking) {
                return (
                  <div
                    key={session ? session.id : `empty-${i}`}
                    className="relative border-2 border-primary-500 bg-primary-50 rounded-lg p-3 flex flex-col items-center justify-center gap-2 min-h-28 col-span-2"
                  >
                    <span className="text-xs font-bold text-primary-700">Strip #{stripLabel} — kies datum</span>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">Kies een dinsdag/donderdag...</option>
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {formatDate(date)}
                        </option>
                      ))}
                    </select>
                    {availableDates.length === 0 && (
                      <p className="text-xs text-gray-600">Geen data meer beschikbaar binnen je geldigheidsperiode.</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmPicking(session)}
                        disabled={!selectedDate}
                        className="text-xs bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold py-1.5 px-3 rounded transition-colors"
                      >
                        Bevestig
                      </button>
                      <button
                        onClick={cancelPicking}
                        className="text-xs text-gray-600 hover:text-gray-800 underline"
                      >
                        Annuleer
                      </button>
                    </div>
                  </div>
                );
              }

              if (!session) {
                return (
                  <button
                    key={`empty-${i}`}
                    onClick={() => remaining > 0 && startPicking(i)}
                    disabled={remaining <= 0}
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 h-28 hover:border-primary-400 hover:text-primary-500 disabled:hover:border-gray-300 disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="absolute top-2 left-2 text-xs font-bold text-gray-400">#{stripLabel}</span>
                    <span className="text-2xl">+</span>
                    <span className="text-xs mt-1">Kies datum</span>
                  </button>
                );
              }

              const scheduledDate = new Date(session.scheduledDate);
              const isPast = scheduledDate.getTime() <= Date.now();

              return (
                <div
                  key={session.id}
                  className={`relative rounded-lg p-4 flex flex-col items-center justify-center text-center h-28 ${
                    isPast ? 'bg-gray-100 border border-gray-200' : 'bg-green-50 border-2 border-green-500'
                  }`}
                >
                  <span className="absolute top-2 left-2 text-xs font-bold text-gray-400">#{stripLabel}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {isPast ? '✅ Genomen' : '🟢 Gepland'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 mt-1">
                    {scheduledDate.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  {!isPast && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => startPicking(i)}
                        className="text-xs text-primary-600 hover:text-primary-800 underline"
                      >
                        Wijzigen
                      </button>
                      <button
                        onClick={() => handleCancel(session.id)}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Annuleren
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {remaining <= 0 && (
            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded">
              <p className="text-yellow-900 font-semibold">Je strippenkaart is op.</p>
              <button
                onClick={() => navigate('/word-lid')}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Nieuwe strippenkaart of ander abonnement kiezen →
              </button>
            </div>
          )}
        </div>
      </div>

      {showUpsellModal && (
        <Modal
          open={true}
          title="🎟️ Nog maar 1 strip over!"
          onClose={() => {
            setShowUpsellModal(false);
            setUpsellDismissed(true);
          }}
        >
          <div className="space-y-4">
            <p>Je strippenkaart is bijna op. Wil je een nieuwe kaart kopen, of overstappen op een abonnement?</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="font-semibold text-primary-900">✨ Tip: een jaarabonnement geeft 10% korting</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/word-lid')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Nieuwe strippenkaart kopen →
              </button>
              <button
                onClick={() => navigate('/word-lid')}
                className="w-full border border-primary-600 text-primary-700 font-bold py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Ander abonnement bekijken →
              </button>
              <button
                onClick={() => {
                  setShowUpsellModal(false);
                  setUpsellDismissed(true);
                }}
                className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Niet nu, misschien later
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
