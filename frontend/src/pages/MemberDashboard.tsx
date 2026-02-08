import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { LessonScheduler } from '../components/LessonScheduler';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const MemberDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEscapeKey(() => {
    logout();
    navigate('/');
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const membershipTypeLabels: Record<string, string> = {
    YEARLY_UPFRONT: 'Jaarlidmaatschap (ineens)',
    YEARLY: 'Jaarlidmaatschap',
    MONTHLY: 'Maandlidmaatschap',
    PER_SESSION: 'Per keer',
    PUNCH_CARD: 'Strippenkaart',
  };

  const isPunchCard = user?.member?.membershipType === 'PUNCH_CARD';
  const isPerSession = user?.member?.membershipType === 'PER_SESSION';
  const isMonthly = user?.member?.membershipType === 'MONTHLY';
  const [memberCredit, setMemberCredit] = useState<number>(user?.member?.credit || 0);
  const punchCardCount = user?.member?.punchCardCount || 0;
  const [bookings, setBookings] = useState<Array<{ id: string; date: string; location: string; time: string }>>([]);
  const [cancelError, setCancelError] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [creditNotification, setCreditNotification] = useState<string>('');
  const [monthlyPaymentRequired, setMonthlyPaymentRequired] = useState<any>(null);
  const [showMonthlyPaymentModal, setShowMonthlyPaymentModal] = useState(false);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:3000/api/memberships/payment-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPaymentStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch payment status:', error);
      }
    };
    fetchPaymentStatus();
  }, [user?.id]);

  // Check if MONTHLY member needs to pay
  useEffect(() => {
    const checkMonthlyPayment = async () => {
      if (!isMonthly || !user?.id) return;
      try {
        const response = await fetch(`http://localhost:3000/api/memberships/check-monthly-payment`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.requiresPayment && data.amount > 0) {
            setMonthlyPaymentRequired(data);
            setShowMonthlyPaymentModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to check monthly payment:', error);
      }
    };
    checkMonthlyPayment();
  }, [isMonthly, user?.id]);

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const endpoint = isPunchCard
        ? 'http://localhost:3000/api/trial-lessons/my-bookings'
        : 'http://localhost:3000/api/trial-lessons/my-registrations';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id, isPunchCard]);

  const handleCancelTraining = async (lessonId: string) => {
    setCancelError('');
    try {
      const cancelEndpoint = isPunchCard
        ? `http://localhost:3000/api/trial-lessons/${lessonId}/cancel`
        : `http://localhost:3000/api/trial-lessons/registration/${lessonId}/cancel`;

      const response = await fetch(cancelEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Annulering mislukt');
      }

      const result = await response.json();

      if (isPunchCard) {
        // Update punch card count
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.member) {
          useAuthStore.getState().setAuth(
            {
              ...currentUser,
              member: {
                ...currentUser.member,
                punchCardCount: result.punchCardCount,
              },
            },
            localStorage.getItem('accessToken') || ''
          );
        }
      }

      // Update credit for PER_SESSION members
      if (result.credit !== undefined) {
        const oldCredit = memberCredit;
        const newCredit = result.credit;
        const addedCredit = newCredit - oldCredit;
        
        setMemberCredit(newCredit);
        
        // Show notification
        if (addedCredit > 0) {
          setCreditNotification(`✓ €${addedCredit.toFixed(2)} toegevoegd aan tegoed (nieuw saldo: €${newCredit.toFixed(2)})`);
          setTimeout(() => setCreditNotification(''), 5000);
        }
      }

      // Refresh bookings
      const bookingsEndpoint = isPunchCard
        ? 'http://localhost:3000/api/trial-lessons/my-bookings'
        : 'http://localhost:3000/api/trial-lessons/my-registrations';

      const bookingsResponse = await fetch(bookingsEndpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json();
        setBookings(data);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Annulering mislukt';
      setCancelError(typeof errorMessage === 'string' ? errorMessage : 'Annulering mislukt');
    }
  };

  const canCancelTraining = (bookingDate: string, bookingTime: string): boolean => {
    const trainingStart = new Date(bookingDate);
    const [hours, minutes] = bookingTime.split(':').map(Number);
    trainingStart.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursDiff = (trainingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDiff >= 4;
  };

  const getPunchCardSlotStatus = (index: number) => {
    // Reverse the numbering: index 0 = slot 10, index 1 = slot 9, etc.
    const slotNumber = 10 - index;
    
    // Categorize bookings by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usedBookings = bookings.filter(b => {
      try {
        return new Date(b.date) < today;
      } catch {
        return false;
      }
    });
    const reservedBookings = bookings.filter(b => {
      try {
        return new Date(b.date) >= today;
      } catch {
        return false;
      }
    });
    
    const totalBookings = usedBookings.length + reservedBookings.length;
    const availableCount = punchCardCount; // Remaining punches
    
    // If this slot number is higher than available count, it's used/reserved
    if (slotNumber > availableCount) {
      const bookingIndex = totalBookings - (slotNumber - availableCount);
      
      // Check if it's a used booking (past)
      if (bookingIndex >= 0 && bookingIndex < usedBookings.length) {
        const booking = usedBookings[bookingIndex];
        if (booking && booking.date) {
          const dateStr = new Date(booking.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
          return { state: 'used' as const, label: 'Gebruikt', date: dateStr };
        }
      }
      
      // It's a reserved booking (future)
      const reservedIndex = bookingIndex - usedBookings.length;
      if (reservedIndex >= 0 && reservedIndex < reservedBookings.length) {
        const booking = reservedBookings[reservedIndex];
        if (booking && booking.date) {
          const dateStr = new Date(booking.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
          return { 
            state: 'reserved' as const, 
            label: 'Gereserveerd', 
            date: dateStr, 
            bookingId: booking.id, 
            bookingDate: booking.date, 
            bookingTime: booking.time 
          };
        }
      }
    }
    
    // Available slots
    return { state: 'available' as const, number: slotNumber, label: 'Beschikbaar' };
  };

  const handleMonthlyPaymentConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/memberships/confirm-monthly-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        setShowMonthlyPaymentModal(false);
        setMonthlyPaymentRequired(null);
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    }
  };

  // Show monthly payment modal if required
  if (showMonthlyPaymentModal && monthlyPaymentRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">💳 Betaling Maandlidmaatschap</h2>
          <p className="text-sm text-gray-600 mb-6">
            {monthlyPaymentRequired.reason}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Bedrag:</span>
              <span className="font-semibold text-gray-900">€{monthlyPaymentRequired.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-6 p-3 bg-gray-50 rounded">
            Dit is een testbetaling. Bij annulering wordt er niets opgeslagen.
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              Annuleer
            </button>
            <button
              onClick={handleMonthlyPaymentConfirm}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Betaal nu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 px-6 flex justify-between items-center relative">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mijn Dashboard</h1>
          <p className="text-sm text-gray-600">Welkom, {user?.email}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            title="Terug naar homepage (ESC)"
          >
            ← Home
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Uitloggen
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Credit Notification */}
        {creditNotification && (
          <div className="bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {creditNotification}
          </div>
        )}

        {/* Welcome Card */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Welkom {user?.member?.firstName || 'lid'}!</h2>
          <p className="text-gray-700 mb-4">
            Je bent nu lid van Almere Pickleball. Hier kun je later je lidmaatschap beheren, je reserveringen bekijken en meer.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Mijn Gegevens</h3>
              {user?.member?.firstName && (
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Naam:</strong> {user.member.firstName} {user.member.lastName || ''}
                </p>
              )}
              <p className="text-sm text-blue-800 mb-3">
                <strong>Email:</strong> {user?.email}
              </p>
              {user?.member?.phone && (
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Telefoon:</strong> {user.member.phone}
                </p>
              )}
              {user?.member?.city && (
                <p className="text-sm text-blue-800">
                  <strong>Plaats:</strong> {user.member.city}
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">🎾 Mijn Abonnement</h3>
              
              {/* Membership Type Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  user?.member?.membershipType === 'YEARLY_UPFRONT' || user?.member?.membershipType === 'YEARLY' 
                    ? 'bg-purple-600 text-white'
                    : user?.member?.membershipType === 'MONTHLY'
                    ? 'bg-blue-600 text-white'
                    : user?.member?.membershipType === 'PUNCH_CARD'
                    ? 'bg-orange-600 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {membershipTypeLabels[user?.member?.membershipType || 'MEMBER'] || 'Lid'}
                </span>
              </div>

              <p className="text-sm text-green-800 mb-3">
                <strong>Status:</strong> <span className={paymentStatus?.isExpired ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
                  {paymentStatus?.isExpired ? '⚠️ Verlopen' : '✓ Actief'}
                </span>
              </p>

              {/* Membership Details */}
              <div className="bg-white rounded p-3 mb-3 space-y-2 text-sm">
                {user?.member?.membershipType === 'YEARLY_UPFRONT' && (
                  <>
                    <p className="text-gray-700">💰 <strong>€168</strong> per jaar (10% korting)</p>
                    <p className="text-gray-700">✓ Betaald ineens</p>
                    <p className="text-gray-700">✓ Onbeperkt trainingen</p>
                  </>
                )}
                {user?.member?.membershipType === 'YEARLY' && (
                  <>
                    <p className="text-gray-700">💰 <strong>€187</strong> per jaar (≈ €15,58/maand)</p>
                    <p className="text-gray-700">✓ Automatische incasso</p>
                    <p className="text-gray-700">✓ Onbeperkt trainingen</p>
                  </>
                )}
                {user?.member?.membershipType === 'MONTHLY' && (
                  <>
                    <p className="text-gray-700">💰 <strong>€34</strong> per maand</p>
                    <p className="text-gray-700">✓ Maandelijks opzegbaar</p>
                    <p className="text-gray-700">✓ Onbeperkt trainingen</p>
                  </>
                )}
                {user?.member?.membershipType === 'PER_SESSION' && (
                  <>
                    <p className="text-gray-700">💰 <strong>€8,50</strong> per speeldag</p>
                    <p className="text-gray-700">✓ Betaal per keer</p>
                    <p className="text-gray-700">✓ Maximale flexibiliteit</p>
                  </>
                )}
                {user?.member?.membershipType === 'PUNCH_CARD' && (
                  <>
                    <p className="text-gray-700">💰 <strong>€67,50</strong> voor 10 beurten</p>
                    <p className="text-gray-700">🎫 <strong>{punchCardCount}</strong> beurten resterend</p>
                    <p className="text-gray-700">✓ 6 maanden geldig</p>
                  </>
                )}
              </div>

              {isPerSession && memberCredit > 0 && (
                <p className="text-sm text-green-800 mb-3 font-semibold bg-white rounded p-2">
                  💰 <strong>Tegoed:</strong> €{memberCredit.toFixed(2)}
                </p>
              )}
              
              {paymentStatus?.membershipExpiryDate && (
                <p className="text-sm text-green-800 mb-2">
                  <strong>Geldig tot:</strong> {new Date(paymentStatus.membershipExpiryDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {paymentStatus.daysUntilExpiry !== null && (
                    <span className="ml-2 text-xs font-semibold">
                      ({paymentStatus.daysUntilExpiry > 0 ? `nog ${paymentStatus.daysUntilExpiry} dagen` : 'verlopen'})
                    </span>
                  )}
                </p>
              )}
              
              {isMonthly && paymentStatus?.nextPaymentDue && (
                <p className="text-sm text-green-800">
                  <strong>Volgende betaling:</strong> {new Date(paymentStatus.nextPaymentDue).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Payment Status Section */}
        {paymentStatus && paymentStatus.recentPayments && paymentStatus.recentPayments.length > 0 && (
          <section className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Betalingen</h3>
            <div className="space-y-3">
              {paymentStatus.recentPayments.map((payment: any) => (
                <div key={payment.id} className={`p-4 rounded-lg border ${
                  payment.status === 'PAID' ? 'bg-green-50 border-green-200' :
                  payment.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {typeof payment.description === 'string' ? payment.description : 'Betaling'}
                      </p>
                      <p className="text-sm text-gray-600">
                        €{typeof payment.amount === 'number' ? payment.amount.toFixed(2) : '0.00'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('nl-NL') : ''}
                      </p>
                    </div>
                    <div>
                      {payment.status === 'PENDING' && payment.paymentUrl && (
                        <a
                          href={payment.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                        >
                          Betaal nu
                        </a>
                      )}
                      {payment.status === 'PAID' && (
                        <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                          Betaald
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Punch Card Visual */}
        {isPunchCard && (
          <section className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🎫 Mijn Strippenkaart</h3>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Je hebt <strong>{punchCardCount}</strong> beurten over</span>
                  <span className="text-sm text-gray-500">{10 - punchCardCount}/10 gebruikt</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((10 - punchCardCount) / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Punch Card Tiles Grid */}
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 10 }, (_, i) => i).map((index) => {
                  const slotStatus = getPunchCardSlotStatus(index);
                  const isUsed = slotStatus.state === 'used';
                  const isReserved = slotStatus.state === 'reserved';
                  const canCancel = isReserved && 'bookingDate' in slotStatus && 'bookingTime' in slotStatus 
                    ? canCancelTraining(slotStatus.bookingDate, slotStatus.bookingTime)
                    : false;

                  return (
                    <div
                      key={index}
                      className={`
                        rounded-lg p-3 flex flex-col items-center justify-center transition-all transform hover:scale-105
                        shadow-md border-2 relative
                        ${isUsed 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-700 text-white'
                          : isReserved
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 text-white'
                          : 'bg-gradient-to-br from-amber-100 to-amber-50 border-amber-400 text-amber-900 hover:border-amber-600 cursor-pointer'
                        }
                      `}
                    >
                      <div className="text-2xl font-bold mb-1">
                        {isUsed || isReserved ? '✓' : ('number' in slotStatus ? String(slotStatus.number) : '')}
                      </div>
                      <div className="text-xs font-semibold text-center">
                        {typeof slotStatus.label === 'string' ? slotStatus.label : ''}
                      </div>
                      {(isUsed || isReserved) && 'date' in slotStatus && (
                        <div className="text-xs mt-1 text-center font-medium">
                          {typeof slotStatus.date === 'string' ? slotStatus.date : ''}
                        </div>
                      )}
                      
                      {/* Cancel Button for Reserved Tiles */}
                      {isReserved && 'bookingId' in slotStatus && canCancel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelTraining(slotStatus.bookingId);
                          }}
                          className="mt-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors font-semibold"
                        >
                          Annuleren
                        </button>
                      )}
                      
                      {/* Non-cancellable indicator */}
                      {isReserved && 'bookingId' in slotStatus && !canCancel && (
                        <div className="mt-2 text-xs text-center font-medium text-red-200">
                          Niet annuleerbaar
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Message */}
              <div className={`rounded-lg p-4 text-sm ${punchCardCount === 0 
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {punchCardCount === 0
                  ? '⚠️ Alle beurten opgebruikt. Je kunt een nieuwe strippenkaart kopen.'
                  : `✓ Je hebt nog ${punchCardCount} beurten beschikbaar. Boek een leson!`}
              </div>
            </div>
          </section>
        )}

        {/* Cancel Error Message */}
        {cancelError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
            ❌ {cancelError}
          </div>
        )}

        {/* Lesson Schedule Section - voor alle leden */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Trainingsrooster - Boek je trainingen</h3>
          {isPunchCard ? (
            <>
              <p className="text-sm text-gray-600 mb-4">Boek trainingen met je strippenkaart beurten. Je hebt nog <strong>{punchCardCount}</strong> beurten over.</p>
              <LessonScheduler
                canBook={punchCardCount > 0}
                maxBookings={Math.min(3, punchCardCount)}
                isMemberWithPunchCard={true}
                existingBookings={bookings}
                showBookedSummary={false}
                onCancelBooking={handleCancelTraining}
                canCancelBooking={canCancelTraining}
              />
            </>
          ) : isMonthly ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>💡 Maandlidmaatschap</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Je hebt onbeperkt trainingen met je maandlidmaatschap. Boek zoveel trainingen als je wilt!
                </p>
                {paymentStatus?.nextPaymentDue && (
                  <p className="text-xs text-blue-700 mt-2">
                    Volgende betaling: {new Date(paymentStatus.nextPaymentDue).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <LessonScheduler
                canBook={!paymentStatus?.isExpired}
                maxBookings={10}
                isMemberWithPunchCard={false}
                existingBookings={bookings}
                showBookedSummary={true}
                requiresPayment={false}
                onBookLesson={async () => {
                  await fetchBookings();
                }}
                onCancelBooking={handleCancelTraining}
                canCancelBooking={canCancelTraining}
              />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Schrijf je in voor trainingen. Je hebt onbeperkt trainingen met je {membershipTypeLabels[user?.member?.membershipType || 'MEMBER']}.</p>
              <LessonScheduler
                canBook={true}
                maxBookings={3}
                isMemberWithPunchCard={false}
                existingBookings={bookings}
                showBookedSummary={true}
                requiresPayment={isPerSession}
                pricePerSession={8.5}
                memberCredit={memberCredit}
                onBookLesson={async () => {
                  await fetchBookings();
                }}
                onCreditUpdate={(newCredit) => setMemberCredit(newCredit)}
                onCancelBooking={handleCancelTraining}
                canCancelBooking={canCancelTraining}
              />
            </>
          )}
        </section>

        {/* Coming Soon Features */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Binnenkort beschikbaar</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Lesrooster en reserveringen</li>
            <li>✓ Mijn statistieken</li>
            <li>✓ Community forum</li>
            <li>✓ Toernooien en events</li>
            <li>✓ Trainingsvideo's</li>
          </ul>
        </section>

        {/* Quick Links */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Snelle links</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
            >
              Naar home
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition"
            >
              Uitloggen
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
