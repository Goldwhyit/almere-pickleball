import React, { useEffect, useState } from 'react';
import { memberAPI } from '../lib/memberApi';

export default function PlayDaysAdminPanel() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<any | null>(null);

  // Genereer volgende speeldagen (dinsdag en donderdag)
  const getUpcomingPlayDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Dinsdag (2) of Donderdag (4)
      if (dayOfWeek === 2 || dayOfWeek === 4) {
        const dateStr = date.toISOString().split('T')[0];
        const time = dayOfWeek === 2 ? '19:30-21:00' : '18:30-20:00';
        const location = dayOfWeek === 2 ? 'Haven, Sporthal Haven' : 'Stad, Noordenplassen Kraaiennest';
        
        days.push({
          date: dateStr,
          displayDate: `${date.toLocaleDateString('nl-NL', { weekday: 'short' }).toUpperCase()} ${date.getDate()}/${date.getMonth() + 1}`,
          time,
          location
        });
        
        if (days.length === 10) break;
      }
    }
    return days;
  };

  const upcomingDays = getUpcomingPlayDays();

  // Standaard eerste aankomende speeldag
  useEffect(() => {
    if (upcomingDays.length > 0 && !selectedDate) {
      setSelectedDate(upcomingDays[0].date);
    }
  }, []);

  // Laad registraties voor geselecteerde datum
  useEffect(() => {
    if (!selectedDate) return;

    const fetchRegistrations = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await memberAPI.getPlayDayRegistrationsForAdmin(selectedDate);
        if (Array.isArray(data)) {
          setRegistrations(data || []);
          setSummary(null);
        } else {
          setRegistrations(data?.registrations || []);
          setSummary(data?.summary || null);
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Kon registraties niet ophalen';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [selectedDate]);

  const selectedDay = upcomingDays.find(d => d.date === selectedDate);

  const getAboLabel = (plan: string) => {
    const labels: any = {
      YEARLY: '📅 Jaar',
      YEARLY_UPFRONT: '📅 Jaar (vooruit)',
      MONTHLY: '📅 Maand',
      PUNCH_CARD: '🎫 Strips',
      PER_SESSION: '💳 Per keer'
    };
    return labels[plan] || plan;
  };

  const getAboColor = (plan: string) => {
    const colors: any = {
      YEARLY: 'bg-blue-50 border-blue-200 text-blue-900',
      YEARLY_UPFRONT: 'bg-blue-100 border-blue-300 text-blue-900',
      MONTHLY: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      PUNCH_CARD: 'bg-amber-50 border-amber-200 text-amber-900',
      PER_SESSION: 'bg-rose-50 border-rose-200 text-rose-900'
    };
    return colors[plan] || 'bg-gray-50 border-gray-200 text-gray-900';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-primary-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Inschrijvingen Speeldagen</h2>
        
        {/* Datum selectie */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {upcomingDays.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                selectedDate === day.date
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">{day.displayDate}</div>
              <div className="text-xs opacity-75">{day.time}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Geselecteerde speeldag:</p>
              <p className="text-xl font-bold text-primary-900">
                {selectedDay.displayDate} • {selectedDay.time}
              </p>
              <p className="text-sm text-gray-700 mt-1">📍 {selectedDay.location}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Totaal ingeschreven:</p>
              <p className="text-3xl font-bold text-primary-600">{registrations.length}</p>
              {summary?.capacity ? (
                <p className="text-xs text-gray-700 mt-1">Capaciteit: {summary.capacity} (beschikbaar: {summary.remaining ?? 0})</p>
              ) : null}
            </div>
          </div>

          {summary && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-800 mb-2">DUPR verdeling</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                  <span className="px-2 py-1 bg-gray-100 rounded">≤3.0: {summary?.byDupr?.['<=3.0'] ?? 0}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">3.5-4.0: {summary?.byDupr?.['3.5-4.0'] ?? 0}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">&gt;4.0: {summary?.byDupr?.['>4.0'] ?? 0}</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-800 mb-2">Leeftijd verdeling</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                  <span className="px-2 py-1 bg-gray-100 rounded">&lt;18: {summary?.byAge?.['<18'] ?? 0}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">18-35: {summary?.byAge?.['18-35'] ?? 0}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">36-50: {summary?.byAge?.['36-50'] ?? 0}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">51+: {summary?.byAge?.['51+'] ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">📭 Geen inschrijvingen voor deze datum</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className={`border-2 rounded-lg p-4 h-full ${getAboColor(reg.member.membershipPlan)}`}>
                {/* Lid info */}
                <div className="mb-4">
                  <p className="text-lg font-bold text-gray-900">
                    {reg.member.firstName} {reg.member.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-white rounded font-semibold">
                      {reg.member.skillLevel?.toUpperCase() || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-600">
                      DUPR: {reg.member.duprRating || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Abo type */}
                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-300">
                  <p className="text-xs text-gray-600 mb-1">Abonnement:</p>
                  <p className="font-semibold text-sm">{getAboLabel(reg.member.membershipPlan)}</p>
                </div>

                {/* Abo-specifieke info */}
                {reg.member.membershipPlan === 'PUNCH_CARD' && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-amber-300">
                    <p className="text-xs text-gray-600 mb-2">Strippenkaart:</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-lg text-amber-900">
                        {reg.member.punchCardRemaining || 0} ritten
                      </p>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, reg.member.punchCardRemaining || 0) }).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-amber-500 rounded-sm"></div>
                        ))}
                        {(reg.member.punchCardRemaining || 0) > 5 && (
                          <p className="text-xs text-amber-700">+{(reg.member.punchCardRemaining || 0) - 5}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {reg.member.membershipPlan === 'PER_SESSION' && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-rose-300">
                    <p className="text-xs text-gray-600 mb-1">Status:</p>
                    <div className="flex items-center gap-2">
                      {reg.paymentCompleted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          ✓ Betaald
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          ⏳ Wacht op betaling
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Inschrijving details */}
                <div className="text-xs text-gray-600 pt-3 border-t border-gray-300 border-opacity-50">
                  <p>Ingeschreven: {new Date(reg.registeredAt).toLocaleDateString('nl-NL')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
