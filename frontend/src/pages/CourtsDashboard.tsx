import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, updateMatch } from '../lib/matchApi';
import { getCourts, createCourt, updateCourt, deleteCourt, Court } from '../lib/courtApi';

export default function CourtsDashboard() {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newCourtName, setNewCourtName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courtsRes, matchesRes] = await Promise.all([
        getCourts(),
        getMatches(),
      ]);
      setCourts(courtsRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error loading courts data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/dashboard');
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await updateCourt(id, { isActive: !currentState });
      await loadData();
      setSuccessMsg(`Baan ${!currentState ? 'geactiveerd' : 'gedeactiveerd'}!`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      console.error('Error toggling court:', error);
    }
  };

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim()) return;
    
    try {
      await createCourt({ name: newCourtName, isActive: true });
      setNewCourtName('');
      setShowAddForm(false);
      await loadData();
      setSuccessMsg('Baan toegevoegd!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      console.error('Error creating court:', error);
    }
  };

  const handleDeleteCourt = async (id: string, name: string) => {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) return;
    
    try {
      await deleteCourt(id);
      await loadData();
      setSuccessMsg('Baan verwijderd!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      console.error('Error deleting court:', error);
    }
  };

  // Get matches for a specific court
  const getCourtMatches = (courtNumber: number) => {
    return matches.filter(m => m.courtNumber === courtNumber);
  };

  const isEmpty = !courts || courts.length === 0;
  
  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto relative">
      {isEmpty && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-center font-semibold">
          Geen banen beschikbaar. Voeg je eerste baan toe!
        </div>
      )}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        onClick={() => navigate('/dashboard')}
        aria-label="Sluiten"
      >
        ×
      </button>
      <h1 className="text-2xl font-bold mb-4">Courts Dashboard</h1>
      
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-center font-semibold">
          {successMsg}
        </div>
      )}

      {/* Add Court Button */}
      <div className="mb-6">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nieuwe Baan Toevoegen
          </button>
        ) : (
          <form onSubmit={handleAddCourt} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                placeholder="Baan naam (bijv. Baan 1)"
                className="border rounded px-3 py-2 flex-1"
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
              >
                Toevoegen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCourtName('');
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold"
              >
                Annuleren
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Courts Grid */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courts.map(court => {
          const courtNum = parseInt(court.name.match(/\d+/)?.[0] || '0');
          const courtMatches = getCourtMatches(courtNum);
          
          return (
            <div
              key={court.id}
              className={`rounded-xl shadow-md p-4 flex flex-col transition-all duration-200 border-2 ${
                court.isActive 
                  ? 'bg-white border-green-400 hover:shadow-green-200' 
                  : 'bg-gray-100 border-red-400 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-lg font-bold ${court.isActive ? 'text-green-700' : 'text-red-700'}`}>
                  {court.name}
                </span>
                <button
                  onClick={() => handleDeleteCourt(court.id, court.name)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Verwijder baan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <span className="mb-3 text-xs text-gray-500">
                {court.isActive ? 'Beschikbaar' : 'Geblokkeerd'}
              </span>

              {/* Show matches on this court */}
              {courtMatches.length > 0 && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                  <div className="font-semibold text-blue-800 mb-1">
                    {courtMatches.length} match{courtMatches.length !== 1 ? 'es' : ''} ingepland
                  </div>
                  {courtMatches.slice(0, 2).map(m => (
                    <div key={m.id} className="text-blue-600 truncate">
                      Match {m.matchNumber} - {m.status}
                    </div>
                  ))}
                  {courtMatches.length > 2 && (
                    <div className="text-blue-600 italic">
                      +{courtMatches.length - 2} meer...
                    </div>
                  )}
                </div>
              )}

              {court.isActive ? (
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm mt-auto" 
                  onClick={() => handleToggleActive(court.id, court.isActive)}
                >
                  Blokkeren
                </button>
              ) : (
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm mt-auto" 
                  onClick={() => handleToggleActive(court.id, court.isActive)}
                >
                  Deblokkeren
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Court to Match */}
      {/* Assign Court to Match */}
      <div className="mb-4 bg-white rounded-xl shadow p-4 border border-gray-200">
        <label className="block mb-2 font-semibold text-gray-700">Baan toewijzen aan match:</label>
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
          onSubmit={async e => {
            e.preventDefault();
            await updateMatch(selectedMatch, { courtNumber: Number(selectedCourt) });
            setSuccessMsg('Baan toegewezen!');
            setSelectedMatch('');
            setSelectedCourt('');
            await loadData();
            setTimeout(() => setSuccessMsg(''), 2000);
          }}
        >
          <div>
            <label className="text-xs text-gray-600 block mb-1">Selecteer baan</label>
            <select 
              value={selectedCourt} 
              onChange={e => setSelectedCourt(e.target.value)} 
              className="border p-2 rounded w-full"
            >
              <option value="">Kies een baan</option>
              {courts.filter(c => c.isActive).map(c => {
                const courtNum = parseInt(c.name.match(/\d+/)?.[0] || '0');
                const matchCount = getCourtMatches(courtNum).length;
                return (
                  <option key={c.id} value={courtNum}>
                    {c.name} {matchCount > 0 ? `(${matchCount} matches)` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Selecteer match</label>
            <select 
              value={selectedMatch} 
              onChange={e => setSelectedMatch(e.target.value)} 
              className="border p-2 rounded w-full"
            >
              <option value="">Kies een match</option>
              {matches.filter(m => !m.courtNumber).map(m => (
                <option key={m.id} value={m.id}>
                  Match {m.matchNumber} - {m.tournament?.name || 'Onbekend toernooi'} ({m.roundName || 'ronde'})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50 w-full"
            disabled={!selectedCourt || !selectedMatch}
          >
            Toewijzen
          </button>
        </form>
      </div>
    </div>
  );
}
