import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CourtManagement() {
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/courts`);
        setCourts(response.data);
        setError('');
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load courts');
        console.error('Error loading courts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const handleBlock = async (id: string) => {
    try {
      await axios.put(`${API_URL}/courts/${id}`, { isActive: false });
      setCourts(courts.map(c => c.id === id ? { ...c, isActive: false } : c));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update court');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await axios.put(`${API_URL}/courts/${id}`, { isActive: true });
      setCourts(courts.map(c => c.id === id ? { ...c, isActive: true } : c));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update court');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Laden...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Banen Beheer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Beschikbare Banen ({courts.length})</h2>
        <ul className="space-y-2">
          {courts.map(court => (
            <li key={court.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`inline-block w-3 h-3 rounded-full ${court.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-medium">{court.name || `Baan ${court.id}`}</span>
              </div>
              {court.isActive ? (
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => handleBlock(court.id)}
                >
                  Blokkeren
                </button>
              ) : (
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => handleUnblock(court.id)}
                >
                  Deblokkeren
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Baan Toewijzen</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Selecteer baan:</label>
            <select 
              value={selectedCourt} 
              onChange={e => setSelectedCourt(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">-- Kies een baan --</option>
              {courts.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name || `Baan ${c.id}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reden (optioneel):</label>
            <input 
              value={blockReason} 
              onChange={e => setBlockReason(e.target.value)}
              placeholder="Bijv: Onderhoud, Defect, etc."
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            disabled={!selectedCourt}
          >
            Toewijzen aan Match
          </button>
        </div>
      </div>
    </div>
  );
}
