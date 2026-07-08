import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberAPI } from '../lib/memberApi';
import { membershipsAPI } from '../lib/membershipsApi';
import PlayDaysAdminPanel from '../components/PlayDaysAdminPanel';

export default function MembersDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [trialLessons, setTrialLessons] = useState<any[]>([]);
  const [trialScheduleSelections, setTrialScheduleSelections] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/dashboard');
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  const fetchMembers = () => {
    setLoading(true);
    memberAPI.getMembers()
      .then(res => {
        setMembers(res.members || []);
        setApplications(res.applications || []);
        setTrialLessons(res.trialLessons || []);

        // Preselect first available date for each trial lesson (admin can change before bevestigen)
        const selections: Record<string, string> = {};
        (res.trialLessons || []).forEach((t: any) => {
          if (Array.isArray(t.selectedDates) && t.selectedDates.length > 0) {
            // Pick earliest upcoming date
            const sorted = [...t.selectedDates].sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
            const upcoming = sorted.find((d: string) => new Date(d).getTime() >= Date.now());
            selections[t.id] = upcoming || sorted[0];
          }
        });
        setTrialScheduleSelections(selections);
      })
      .catch(() => setError('Kan leden niet ophalen'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
    // Fetch current user's role
    memberAPI.getProfile()
      .then(profile => {
        setCurrentUserRole(profile?.user?.role || null);
      })
      .catch(() => {
        setCurrentUserRole(null);
      });
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm('Weet je zeker dat je dit lid wilt verwijderen?')) return;
    setLoading(true);
    memberAPI.deleteMember(id)
      .then(() => {
        fetchMembers();
      })
      .catch(err => {
        setError('Verwijderen mislukt: ' + err.message);
        setLoading(false);
      });
  };

  const handleMakeAdmin = (id: string, name: string) => {
    if (!window.confirm(`Weet je zeker dat je ${name} tot admin wilt promoveren?`)) return;
    setLoading(true);
    memberAPI.makeAdmin(id)
      .then(() => {
        setError(null);
        fetchMembers();
      })
      .catch(err => {
        setError('Promotie mislukt: ' + err.message);
        setLoading(false);
      });
  };

  const handleEdit = (member: any) => {
    setEditId(member.id);
    setEditForm({ ...member });
  };

  const handleTrialAction = async (
    id: string,
    action: 'confirm' | 'complete' | 'cancel',
    _scheduledDate?: string,
  ) => {
    setActionLoading(`${action}-${id}`);
    setError(null);
    try {
      // Trial lesson management moved to TrialDashboard
      // These methods are no longer available via memberAPI
      // For admin trial management, use AdminTrialDashboard component
      console.warn(`Action ${action} requires AdminTrialDashboard component`);
      setError('Trial management has moved to the Trial Dashboard. Use AdminTrialDashboard for admin operations.');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Actie mislukt';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Sending update data:', editForm); // Debug log
      const result = await memberAPI.updateMember(editId!, editForm);
      console.log('Update result:', result); // Debug log of the response
      
      // Update the local members list immediately
      setMembers(prevMembers => 
        prevMembers.map(m => m.id === editId ? { ...m, ...result } : m)
      );
      
      setEditId(null);
      setEditForm({});
      
      // Also refresh from server to be sure
      setTimeout(() => fetchMembers(), 500);
    } catch (err) {
      console.error('Update error:', err);
      setError('Update mislukt');
    } finally {
      setLoading(false);
    }
  };

  const filtered = Array.isArray(members)
    ? (filter
        ? members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(filter.toLowerCase()) || m.user?.email?.toLowerCase().includes(filter.toLowerCase()))
        : members)
    : [];
  const filteredApplications = Array.isArray(applications)
    ? (filter
        ? applications.filter(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(filter.toLowerCase()) || a.email?.toLowerCase().includes(filter.toLowerCase()))
        : applications)
    : [];
  const filteredTrialLessons = Array.isArray(trialLessons)
    ? (filter
        ? trialLessons.filter(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(filter.toLowerCase()) || t.email?.toLowerCase().includes(filter.toLowerCase()))
        : trialLessons)
    : [];

  return (
    <div className="p-4 max-w-7xl mx-auto relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        onClick={() => navigate('/dashboard')}
        aria-label="Sluiten"
      >
        ×
      </button>
      <h1 className="text-2xl font-bold mb-6">Members & Beheer Dashboard</h1>
      
      {/* Play-Days Admin Panel */}
      <div className="mb-8">
        <PlayDaysAdminPanel />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          className="border border-gray-300 p-2 mb-4 w-full rounded-lg"
          placeholder="🔍 Zoek leden op naam of e-mail"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {error && <div className="text-red-600 font-semibold">{error}</div>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Leden */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold">👥 Leden ({filtered.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">Naam</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Strippen</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">DUPR</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Wachtwoord</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <div className="flex gap-2">
                        <input className="border border-gray-300 p-1 rounded text-sm" value={editForm.firstName || ''} onChange={e => setEditForm((f: any) => ({ ...f, firstName: e.target.value }))} placeholder="Voornaam" />
                        <input className="border border-gray-300 p-1 rounded text-sm" value={editForm.lastName || ''} onChange={e => setEditForm((f: any) => ({ ...f, lastName: e.target.value }))} placeholder="Achternaam" />
                      </div>
                    ) : (
                      <span className="font-medium">{m.firstName} {m.lastName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <input className="border border-gray-300 p-1 rounded w-full text-sm" value={editForm.email || m.user?.email || ''} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} />
                    ) : (
                      m.user?.email
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <input className="border border-gray-300 p-1 rounded text-sm" value={editForm.membershipType || ''} onChange={e => setEditForm((f: any) => ({ ...f, membershipType: e.target.value }))} />
                    ) : (
                      <span className={`${m.membershipStatus === 'PENDING' ? 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold' : ''}`}>
                        {m.membershipStatus === 'PENDING' ? '🎁 Proefles' : m.membershipType}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <select className="border border-gray-300 p-1 rounded text-sm" value={editForm.membershipPlan !== undefined ? editForm.membershipPlan : (m.membershipPlan || 'PER_SESSION')} onChange={e => setEditForm((f: any) => ({ ...f, membershipPlan: e.target.value }))}>
                        <option value="PER_SESSION">Per Sessie</option>
                        <option value="PUNCH_CARD">Strippenkaart</option>
                        <option value="MONTHLY">Maandelijks</option>
                        <option value="YEARLY">Jaarlijks</option>
                        <option value="YEARLY_UPFRONT">Jaar Vooruit</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        m.membershipStatus === 'PENDING' ? 'bg-green-100 text-green-800' :
                        m.membershipPlan === 'PUNCH_CARD' ? 'bg-purple-100 text-purple-800' :
                        m.membershipPlan === 'PER_SESSION' ? 'bg-gray-100 text-gray-800' :
                        m.membershipPlan === 'MONTHLY' ? 'bg-blue-100 text-blue-800' :
                        m.membershipPlan === 'YEARLY' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {m.membershipStatus === 'PENDING' ? '🎁 Gratis Proefles' :
                         m.membershipPlan === 'PUNCH_CARD' ? '🎫 Strippenkaart' :
                         m.membershipPlan === 'PER_SESSION' ? 'Per Sessie' :
                         m.membershipPlan === 'MONTHLY' ? 'Maandelijks' :
                         m.membershipPlan === 'YEARLY' ? 'Jaarlijks' :
                         'Jaar Vooruit'}
                      </span>
                    )}
                    {editId !== m.id && (m.membershipPlan === 'MONTHLY' || m.membershipPlan === 'YEARLY') && m.memberships?.[0]?.currentPeriodEnd &&
                      new Date(m.memberships[0].currentPeriodEnd).getTime() <= Date.now() && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold animate-pulse">
                            ⚠️ Betaling openstaand
                          </span>
                          <button
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                            onClick={async () => {
                              await membershipsAPI.markPaid(m.memberships[0].id);
                              fetchMembers();
                            }}
                          >
                            Markeer betaald
                          </button>
                        </div>
                      )}
                    {editId !== m.id && m.membershipPlan === 'YEARLY_UPFRONT' && m.memberships?.[0] &&
                      (m.memberships[0].pendingRenewalChoice ||
                        (m.memberships[0].endDate &&
                          new Date(m.memberships[0].endDate).getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000)) && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold animate-pulse">
                            ⚠️ Verlenging openstaand
                          </span>
                          <button
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                            onClick={async () => {
                              await membershipsAPI.processRenewal(m.memberships[0].id);
                              fetchMembers();
                            }}
                          >
                            Verwerk verlenging
                          </button>
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <input 
                        className="border border-gray-300 p-1 rounded text-sm w-16" 
                        type="number" 
                        min="0" 
                        max="10" 
                        value={editForm.punchCardRemaining !== undefined ? editForm.punchCardRemaining : (m.punchCardRemaining || '')} 
                        onChange={e => {
                          const value = parseInt(e.target.value) || 0;
                          setEditForm((f: any) => ({ 
                            ...f, 
                            punchCardRemaining: value,
                            // Auto-set plan to PUNCH_CARD if entering punch card rides
                            membershipPlan: value > 0 ? 'PUNCH_CARD' : f.membershipPlan
                          }));
                        }} 
                      />
                    ) : (
                      m.membershipPlan === 'PUNCH_CARD' ? (m.punchCardRemaining || 0) : '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <input className="border border-gray-300 p-1 rounded text-sm" value={editForm.duprRating || ''} onChange={e => setEditForm((f: any) => ({ ...f, duprRating: e.target.value }))} />
                    ) : (
                      m.duprRating
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editId === m.id ? (
                      <input 
                        type="password" 
                        className="border border-gray-300 p-1 rounded w-full text-sm" 
                        placeholder="Nieuw wachtwoord (min 6)" 
                        value={editForm.password || ''} 
                        onChange={e => setEditForm((f: any) => ({ ...f, password: e.target.value }))} 
                      />
                    ) : (
                      '••••••'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editId === m.id ? (
                      <div className="flex gap-2">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors" onClick={handleEditSubmit as any}>✓ Opslaan</button>
                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm font-semibold transition-colors" onClick={() => setEditId(null)}>✕ Annuleren</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors" onClick={() => handleEdit(m)}>✏️ Bewerk</button>
                        {currentUserRole === 'ADMIN' && (
                          <>
                            <button className="text-purple-600 hover:text-purple-800 font-semibold transition-colors" onClick={() => handleMakeAdmin(m.id, `${m.firstName} ${m.lastName}`)}>👑 Admin</button>
                            <button className="text-red-600 hover:text-red-800 font-semibold transition-colors" onClick={() => handleDelete(m.id)}>🗑️ Verwijder</button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>

          {/* Lidmaatschapsaanvragen */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold">📝 Openstaande Lidmaatschapsaanvragen ({filteredApplications.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Naam</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{a.firstName} {a.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{a.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{a.membershipType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{a.status}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors" onClick={async () => { await memberAPI.approveMembership(a.id); fetchMembers(); }}>✓ Goedkeuren</button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors" onClick={async () => { await memberAPI.rejectMembership(a.id); fetchMembers(); }}>✕ Afwijzen</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proefles-aanvragen */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🎁 Proefles Aanvragen ({filteredTrialLessons.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">Beheer gratis proefles aanmeldingen</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Naam</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email / Telefoon</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ervaring</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Datums</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Feedback</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTrialLessons.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium">{t.firstName} {t.lastName}</div>
                        <div className="text-xs text-gray-500">
                          {t.dateOfBirth ? new Date(t.dateOfBirth).toLocaleDateString('nl-NL') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{t.email}</div>
                        <div className="text-xs text-gray-500">{t.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {t.experienceLevel === 'never' ? '🆕 Nooit' :
                           t.experienceLevel === 'occasional' ? '⭐ Soms' :
                           t.experienceLevel === 'regular' ? '⭐⭐ Regelmatig' :
                           t.experienceLevel === 'advanced' ? '⭐⭐⭐ Gevorderd' :
                           t.experienceLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {t.selectedDates && Array.isArray(t.selectedDates) ? (
                          <div className="space-y-1">
                            {t.selectedDates.slice(0, 2).map((date: string, idx: number) => (
                              <div key={idx} className="text-gray-600">
                                📅 {new Date(date).toLocaleDateString('nl-NL', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            ))}
                            {t.selectedDates.length > 2 && (
                              <div className="text-gray-400">+{t.selectedDates.length - 2} meer</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Geen datums</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          t.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          t.status === 'AWAITING_FEEDBACK' ? 'bg-purple-100 text-purple-800' :
                          t.status === 'CONVERTED_TO_MEMBER' ? 'bg-green-200 text-green-900' :
                          t.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                          t.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t.status === 'PENDING' ? '⏳ In behandeling' :
                           t.status === 'CONFIRMED' ? '✅ Bevestigd' :
                           t.status === 'COMPLETED' ? '🎉 Voltooid' :
                           t.status === 'AWAITING_FEEDBACK' ? '💬 Wacht op feedback' :
                           t.status === 'CONVERTED_TO_MEMBER' ? '👤 Lid geworden' :
                           t.status === 'DECLINED' ? '❌ Afgewezen' :
                           t.status === 'CANCELLED' ? '🚫 Geannuleerd' :
                           t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {t.feedbackGiven ? (
                          <div className="space-y-1">
                            <div className={`font-semibold ${t.wantsToJoin ? 'text-green-600' : 'text-red-600'}`}>
                              {t.wantsToJoin ? '✓ Wil lid worden' : '✗ Wil geen lid'}
                            </div>
                            {t.chosenMembershipPlan && (
                              <div className="text-gray-600">Plan: {t.chosenMembershipPlan}</div>
                            )}
                            {t.feedbackComments && (
                              <div className="text-gray-500 italic truncate max-w-xs" title={t.feedbackComments}>
                                "{t.feedbackComments.substring(0, 50)}..."
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Geen feedback</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          {t.status === 'PENDING' && Array.isArray(t.selectedDates) && t.selectedDates.length > 0 && (
                            <select
                              className="border border-gray-300 rounded text-xs px-2 py-1"
                              value={trialScheduleSelections[t.id] || ''}
                              onChange={(e) => setTrialScheduleSelections((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            >
                              {[...t.selectedDates]
                                .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())
                                .map((date: string) => (
                                  <option key={date} value={date}>
                                    {new Date(date).toLocaleDateString('nl-NL', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </option>
                                ))}
                            </select>
                          )}
                          {t.status === 'PENDING' && (
                            <button 
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap" 
                              disabled={actionLoading === `confirm-${t.id}`}
                              onClick={() => handleTrialAction(t.id, 'confirm', trialScheduleSelections[t.id])}
                            >
                              {actionLoading === `confirm-${t.id}` ? 'Bevestigen...' : '✓ Bevestigen'}
                            </button>
                          )}
                          {(t.status === 'PENDING' || t.status === 'CONFIRMED') && (
                            <button 
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap" 
                              disabled={actionLoading === `complete-${t.id}`}
                              onClick={() => handleTrialAction(t.id, 'complete')}
                            >
                              {actionLoading === `complete-${t.id}` ? 'Voltooien...' : '✓ Voltooien'}
                            </button>
                          )}
                          {(t.status === 'PENDING' || t.status === 'CONFIRMED') && (
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap" 
                              disabled={actionLoading === `cancel-${t.id}`}
                              onClick={() => handleTrialAction(t.id, 'cancel')}
                            >
                              {actionLoading === `cancel-${t.id}` ? 'Annuleren...' : '✕ Annuleren'}
                            </button>
                          )}
                          {t.feedbackGiven && t.wantsToJoin && !t.paymentCompleted && (
                            <span className="text-xs text-orange-600 font-semibold">
                              ⚠️ Wacht op betaling
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
