import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { trialApi } from '../lib/trialApi';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export default function TrialDashboard() {
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'book-date' | 'lessons'>(
    'overview'
  );
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionChoice, setCompletionChoice] = useState<'convert' | 'decline' | null>(
    null
  );
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackReason, setFeedbackReason] = useState('');

  const token = accessToken || localStorage.getItem('accessToken') || localStorage.getItem('token') || '';

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (user.member?.accountType !== 'TRIAL') {
      navigate('/dashboard');
      return;
    }

    fetchTrialStatus();
  }, [user, token, navigate, logout]);

  const fetchTrialStatus = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const [status, lessonsResponse] = await Promise.all([
        trialApi.getMyStatus(token),
        trialApi.getMyLessons(token),
      ]);
      const member = status?.member || status || {};
      const trialStartDate = status?.trialStartDate || member?.trialStartDate;
      const trialEndDate = status?.trialEndDate || member?.trialEndDate;
      const fallbackStartDate = new Date();
      const fallbackEndDate = new Date();
      fallbackEndDate.setDate(fallbackEndDate.getDate() + 21);

      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(trialEndDate || fallbackEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      );

      const normalizedStatus = {
        ...status,
        member,
        firstName: member?.firstName || status?.firstName || user?.member?.firstName || 'deelnemer',
        lessonCount: status?.lessonCount ?? status?.lessonsBooked ?? member?.trialLessonsBooked ?? 0,
        completedLessons: status?.completedLessons ?? status?.lessonsCompleted ?? member?.trialLessonsCompleted ?? 0,
        lessons: lessonsResponse?.lessons || status?.lessons || [],
        trialStartDate: trialStartDate || fallbackStartDate.toISOString(),
        trialEndDate: trialEndDate || fallbackEndDate.toISOString(),
        isTrialEnded: Boolean(
          status?.isTrialEnded ||
            status?.status === 'COMPLETED' ||
            member?.trialStatus === 'COMPLETED' ||
            member?.trialStatus === 'DECLINED' ||
            member?.trialStatus === 'EXPIRED' ||
            daysLeft <= 0
        ),
        trialStatus: status?.status || member?.trialStatus || 'ACTIVE',
      };

      setTrialStatus(normalizedStatus);

      if (normalizedStatus.isTrialEnded) {
        setShowCompletionModal(true);
      }
    } catch (error: any) {
      console.error('Failed to fetch trial status:', error);
      if (error?.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookDate = async (date: string) => {
    try {
      await trialApi.bookDate(token, date);
      await fetchTrialStatus();
      setActiveTab('lessons');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Er is een fout opgetreden bij het inplannen van deze proefles'
      );
    }
  };

  const handleCancelLesson = async (lessonId: string) => {
    if (!confirm('Weet je zeker dat je deze proefles wilt annuleren?')) return;
    try {
      await trialApi.cancelLesson(token, lessonId);
      await fetchTrialStatus();
    } catch (error: any) {
      alert(
        error.response?.data?.message || 'Er is een fout opgetreden bij het annuleren'
      );
    }
  };

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getAvailableTuesdays = (trialEndDate: string, bookedDates: string[]) => {
    const result: string[] = [];
    const end = new Date(trialEndDate);
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor.getDay() !== 2) {
      cursor.setDate(cursor.getDate() + 1);
    }
    while (cursor.getTime() <= end.getTime()) {
      const dateStr = toLocalDateStr(cursor);
      if (!bookedDates.includes(dateStr)) {
        result.push(dateStr);
      }
      cursor.setDate(cursor.getDate() + 7);
    }
    return result;
  };

  const handleConvertToMember = () => {
    navigate('/word-lid');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDeclineMembership = async () => {
    if (!feedbackReason) {
      alert('Selecteer een reden alstublieft');
      return;
    }

    try {
      await trialApi.declineMembership(token, feedbackReason, feedbackText);
      alert('Bedankt voor je feedback! Tot ziens!');
      logout();
      navigate('/');
    } catch (error) {
      alert('Er is een fout opgetreden');
    }
  };

  const calculateDaysLeft = () => {
    if (!trialStatus?.trialEndDate) return 0;
    const today = new Date();
    const endDate = new Date(trialStatus.trialEndDate);
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const daysLeft = calculateDaysLeft();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Laden...</div>;
  }

  if (!trialStatus) {
    return <div className="flex items-center justify-center h-screen">Kan gegevens niet laden</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleBackToHome}
              className="text-green-100 hover:text-white text-sm font-semibold underline"
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
              <h1 className="text-4xl font-bold mb-2">🎾 Mijn Proeflessen</h1>
              <p className="text-green-100">Welkom, {trialStatus.firstName}!</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-green-200">{daysLeft}</div>
              <p className="text-green-100 mt-1">Dagen over</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Lessons */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">📅 Geboekte Lessen</h3>
            <p className="text-3xl font-bold text-green-600">
              {trialStatus.lessonCount}
            </p>
            <p className="text-xs text-gray-500 mt-2">proeflessen geboekt</p>
          </div>

          {/* Card 2: Completed */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">✅ Voltooid</h3>
            <p className="text-3xl font-bold text-blue-600">
              {trialStatus.completedLessons}
            </p>
            <p className="text-xs text-gray-500 mt-2">lessen afgerond</p>
          </div>

          {/* Card 3: Status */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">🎯 Status</h3>
            <p className="text-2xl font-bold text-purple-600">
              {trialStatus.isTrialEnded ? '🔴 Verlopen' : '🟢 Actief'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {trialStatus.isTrialEnded
                ? 'Je proefperiode is verlopen'
                : 'Je bent nog aan het proberen'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Overzicht
          </button>
          {!trialStatus.isTrialEnded && (
            <button
              onClick={() => setActiveTab('book-date')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'book-date'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Les Inplannen
            </button>
          )}
          {trialStatus.lessonCount > 0 && (
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'lessons'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎾 Mijn Lessen
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                ✨ Welkom bij je gratis proeflessen!
              </h3>
              <p className="text-green-800 mb-3">
                Je kunt tot 21 dagen na aanmelding gratis proeflessen inplannen op dinsdagavond. Na de
                proeflessen kun je beslissen of je lid wilt worden.
              </p>
              <ul className="text-green-800 space-y-1 text-sm">
                <li>✓ Gratis proeflessen, elke dinsdag 19:30 - 21:30 uur</li>
                <li>✓ Materiaal inbegrepen (paddle, ballen)</li>
                <li>✓ Begeleiding van trainers</li>
                <li>✓ Geen verplichting</li>
              </ul>
            </div>

            {!trialStatus.isTrialEnded && (
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">📅 Volgende Stap</h3>
                <p className="text-yellow-800 mb-4">
                  Plan een proefles in op een beschikbare dinsdag. Je hebt tot{' '}
                  <strong>{daysLeft} dagen</strong> om dit te doen.
                </p>
                <button
                  onClick={() => setActiveTab('book-date')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Plan een proefles in →
                </button>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📍 Locatie</h3>
              <p className="text-gray-700 mb-2">
                <strong>Sportcomplex Almere</strong>
              </p>
              <p className="text-gray-700 mb-2">Parkwerf 138</p>
              <p className="text-gray-700 mb-4">1354 EB Almere</p>
              <p className="text-gray-600 text-sm">
                Meld je 15 minuten voor het begin van de les aan bij de beheerder van het sportcomplex.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'book-date' && !trialStatus.isTrialEnded && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan een Proefles In</h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Let op:</strong> Proeflessen zijn elke dinsdag van 19:30 tot 21:30 uur. Kies
                hieronder een beschikbare dinsdag binnen je proefperiode.
              </p>
            </div>

            {(() => {
              const bookedDates = (trialStatus.lessons || []).map((l: any) =>
                new Date(l.scheduledDate).toISOString().split('T')[0]
              );
              const availableTuesdays = getAvailableTuesdays(trialStatus.trialEndDate, bookedDates);

              if (availableTuesdays.length === 0) {
                return (
                  <p className="text-gray-600">
                    Er zijn geen beschikbare dinsdagen meer binnen je proefperiode.
                  </p>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTuesdays.map((date) => (
                    <div
                      key={date}
                      className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(`${date}T00:00:00`).toLocaleDateString('nl-NL', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">19:30 - 21:30 uur</p>
                      </div>
                      <button
                        onClick={() => handleBookDate(date)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Inschrijven
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'lessons' && trialStatus.lessons && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mijn Geboekte Lessen</h2>

            <div className="space-y-4">
              {trialStatus.lessons.map((lesson: any, idx: number) => {
                const scheduledDate = new Date(lesson.scheduledDate);
                const isPast = scheduledDate.getTime() <= Date.now();
                const displayStatus = lesson.completed
                  ? 'COMPLETED'
                  : isPast
                    ? 'PAST'
                    : 'SCHEDULED';

                return (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {displayStatus === 'COMPLETED' ? '✅' : '📅'} Proefles {idx + 1}
                        </h3>
                        <p className="text-gray-600 mt-2">
                          {scheduledDate.toLocaleDateString('nl-NL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          om 19:30 - 21:30 uur
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            displayStatus === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : displayStatus === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {displayStatus === 'SCHEDULED'
                            ? '🟢 Gepland'
                            : displayStatus === 'COMPLETED'
                              ? '✅ Voltooid'
                              : '⏳ Verstreken'}
                        </span>
                        {displayStatus === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCancelLesson(lesson.id)}
                            className="block text-sm text-red-600 hover:text-red-800 font-semibold underline"
                          >
                            Annuleren
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <Modal
          open={true}
          onClose={() => {}}
          title="🎾 Je Proeflessen zijn Afgelopen!"
        >
          <div className="text-center py-6">
            {!completionChoice ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Hoe beviel je pickleball?
                </h2>
                <p className="text-gray-700 mb-6">
                  Je hebt je proeflessen afgerond! Kies nu wat je wilt doen:
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setCompletionChoice('convert')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    ✨ Ik wil lid worden!
                  </button>
                  <button
                    onClick={() => setCompletionChoice('decline')}
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    👋 Ik stop voorlopig
                  </button>
                </div>
              </>
            ) : completionChoice === 'convert' ? (
              <>
                <div className="text-6xl mb-4">💚</div>
                <h2 className="text-2xl font-bold text-green-600 mb-3">
                  Welkom als lid!
                </h2>
                <p className="text-gray-700 mb-6">
                  Super! Hou je van pickleball? Kies nu je abonnement en start je avontuur!
                </p>
                <button
                  onClick={handleConvertToMember}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3"
                >
                  Bekijk Abonnementen →
                </button>
                <button
                  onClick={() => setCompletionChoice(null)}
                  className="w-full border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Terug
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💭</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Bedankt voor je feedback!
                </h2>
                <p className="text-gray-700 mb-6">
                  We hopen je snel terug te zien. Help ons verbeteren:
                </p>
                <div className="text-left mb-6 space-y-3">
                  <label className="block">
                    <input
                      type="radio"
                      name="reason"
                      value="too-expensive"
                      checked={feedbackReason === 'too-expensive'}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      className="mr-2"
                    />
                    💰 Te duur
                  </label>
                  <label className="block">
                    <input
                      type="radio"
                      name="reason"
                      value="no-time"
                      checked={feedbackReason === 'no-time'}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      className="mr-2"
                    />
                    ⏰ Geen tijd
                  </label>
                  <label className="block">
                    <input
                      type="radio"
                      name="reason"
                      value="not-interested"
                      checked={feedbackReason === 'not-interested'}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      className="mr-2"
                    />
                    🎾 Sport bevalt niet
                  </label>
                  <label className="block">
                    <input
                      type="radio"
                      name="reason"
                      value="too-far"
                      checked={feedbackReason === 'too-far'}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      className="mr-2"
                    />
                    📍 Te ver weg
                  </label>
                  <label className="block">
                    <input
                      type="radio"
                      name="reason"
                      value="other"
                      checked={feedbackReason === 'other'}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      className="mr-2"
                    />
                    ❓ Anders
                  </label>
                </div>

                {feedbackReason && (
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Optioneel: vertel ons meer..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
                    rows={3}
                  />
                )}

                <button
                  onClick={handleDeclineMembership}
                  disabled={!feedbackReason}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3"
                >
                  Verstuur Feedback
                </button>
                <button
                  onClick={() => setCompletionChoice(null)}
                  className="w-full border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Terug
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
