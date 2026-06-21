import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load user data if not already loaded
    if (!user) {
      authAPI.getCurrentUser()
        .then((data) => setUser(data.user))
        .catch(() => {
          logout();
          navigate('/login');
        });
    }
  }, [isAuthenticated, user, navigate, setUser, logout]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Almere Pickleball</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welkom terug, {user.member?.firstName}!
          </h2>
          <p className="text-primary-100">
            {user.member?.duprRating && (
              <span className="font-semibold">
                Jouw DUPR rating: {user.member.duprRating} ⬆️
              </span>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Toernooien</h3>
            <p className="text-gray-600 text-sm">Schrijf in voor competities</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="text-3xl mb-3">🎾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wedstrijden</h3>
            <p className="text-gray-600 text-sm">Bekijk je wedstrijden</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profiel</h3>
            <p className="text-gray-600 text-sm">Wijzig je gegevens</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Gespeelde wedstrijden</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Win percentage</p>
            <p className="text-3xl font-bold text-gray-900">-%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Toernooien</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm mb-1">Club ranking</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Aankomende Wedstrijden</h3>
          <div className="text-center py-12 text-gray-500">
            <p>Je hebt nog geen wedstrijden ingepland</p>
            <p className="text-sm mt-2">Schrijf in voor een toernooi om te beginnen!</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-6">
          <h4 className="font-semibold text-primary-900 mb-2">🚧 Platform in ontwikkeling</h4>
          <p className="text-primary-800 text-sm">
            Deze pagina is een placeholder. Toernooien, wedstrijden en statistieken worden binnenkort toegevoegd!
          </p>
        </div>
      </main>
    </div>
  );
}
