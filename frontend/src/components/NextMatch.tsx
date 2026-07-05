import { useEffect, useState } from 'react';
import { getNextMatch } from '../lib/matchApi';
import { useAuthStore } from '../stores/authStore';

const NextMatch: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated and a token is available
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    getNextMatch()
      .then((res) => {
        setMatch(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401 || err?.response?.status === 404) {
          setMatch(null);
          setError(null);
        } else {
          setError('Kan volgende match niet ophalen');
        }
        setLoading(false);
      });
  }, [isAuthenticated, accessToken]);

  if (!isAuthenticated) return null;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!match) return <div>Geen geplande match gevonden.</div>;

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Volgende Match</h2>
      <div>Match #{match.matchNumber} - {match.roundName}</div>
      <div>Datum: {match.scheduledDatetime ? new Date(match.scheduledDatetime).toLocaleString() : 'n.v.t.'}</div>
      <div>Court: {match.courtNumber || 'n.v.t.'}</div>
      <div>Status: {match.status}</div>
    </div>
  );
};

export default NextMatch;
