import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import DashboardPopupButtons from '../components/DashboardPopupButtons';

const MEMBERSHIP_PLAN_LABELS: Record<string, string> = {
  PER_SESSION: 'Per sessie',
  PUNCH_CARD: 'Strippenkaart',
  MONTHLY: 'Maandlidmaatschap',
  YEARLY: 'Jaarlidmaatschap',
  YEARLY_UPFRONT: 'Jaarlidmaatschap (ineens betaald)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const accountType = (user as any).accountType || user.member?.accountType || 'MEMBER';
  const firstName = user.member?.firstName || (user as any).firstName || user.email || 'gebruiker';

  if (accountType === 'TRIAL') {
    return <Navigate to="/trial-dashboard" replace />;
  }

  const membershipPlan = user.member?.membershipPlan;

  if (membershipPlan === 'PUNCH_CARD') {
    return <Navigate to="/punch-card-dashboard" replace />;
  }

  const membershipPlanLabel = membershipPlan
    ? MEMBERSHIP_PLAN_LABELS[membershipPlan] || membershipPlan
    : 'Onbekend';
  const membershipStatus = user.member?.membershipStatus || 'PENDING';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-primary-900 to-slate-700 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-sky-300">Dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Welkom terug, {firstName}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
                Dit is jouw centrale dashboard. Bekijk je abonnement of open je beheerfuncties.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white underline shadow-sm transition hover:bg-white/10"
              >
                ← Terug naar home
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Abonnement</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">{membershipPlanLabel}</h2>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-900">
                    🎾
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Status: <strong>{membershipStatus}</strong>
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Account informatie</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">Je profiel</h2>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    👤
                  </span>
                </div>
                <dl className="mt-6 grid gap-4 text-sm text-slate-600">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Rol</dt>
                    <dd className="mt-2 font-semibold text-slate-900">{user.role || 'Lid'}</dd>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">Type</dt>
                    <dd className="mt-2 font-semibold text-slate-900">{accountType}</dd>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-[0.24em] text-slate-400">E-mail</dt>
                    <dd className="mt-2 truncate font-semibold text-slate-900">{user.email}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {(user.role === 'ADMIN' || user.role === 'ORGANIZER') && (
              <div className="rounded-[2rem] bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-primary-600">Beheer</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Snelkoppelingen</h2>
                  </div>
                </div>
                <DashboardPopupButtons />
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Snelle acties</h2>
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Dashboard verversen
                </button>
                {(user.role === 'ADMIN' || user.role === 'ORGANIZER') && (
                  <button
                    type="button"
                    onClick={() => navigate('/members')}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Open ledenbeheer
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl">
              <h2 className="text-xl font-semibold">Tip</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Als beheerder of organisator zie je hier ook je beheertools.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
