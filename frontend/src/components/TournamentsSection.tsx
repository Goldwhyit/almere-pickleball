import React from 'react';

const TournamentsSection: React.FC<{
  available: any[];
  registered: any[];
  onSignup?: (id: string) => void;
  onSignoff?: (id: string) => void;
}> = ({ available, registered, onSignup, onSignoff }) => {
  const [tab, setTab] = React.useState<'beschikbaar' | 'ingeschreven'>('beschikbaar');
  const [toast, setToast] = React.useState<string | null>(null);
  const [justSignedUp, setJustSignedUp] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  React.useEffect(() => {
    if (tab === 'ingeschreven' && justSignedUp) {
      setToast('Je bent ingeschreven voor dit toernooi!');
      setJustSignedUp(false);
    }
  }, [tab, justSignedUp]);
  return (
    <section className="bg-white rounded-xl p-6 mb-6 relative">
      {toast && (
        <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white border border-primary-200 text-primary-700 px-8 py-4 rounded-xl shadow-xl text-center animate-fade-in">
          {toast}
        </div>
      )}
      <h3 className="text-lg font-bold mb-2">Toernooien</h3>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-3 py-1 rounded ${tab === 'beschikbaar' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('beschikbaar')}
        >
          Beschikbaar
        </button>
        <button
          className={`px-3 py-1 rounded ${tab === 'ingeschreven' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
          onClick={() => setTab('ingeschreven')}
        >
          Ingeschreven
        </button>
      </div>
      {(tab === 'beschikbaar' ? available : registered).length === 0 ? (
        <div className="text-gray-500 py-8 text-center">
          <p>Er zijn nog geen toernooien beschikbaar.</p>
          <p className="text-sm mt-2">Houd deze pagina in de gaten of neem contact op met de club voor meer informatie!</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th>Niveau</th>
              <th>Datum</th>
              <th>Locatie</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {(tab === 'beschikbaar' ? available : registered).map((t) => (
              <tr key={t.id} className="border-t">
                <td>{t.level || '-'}</td>
                <td>{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                <td>{t.location || '-'}</td>
                <td>{t.status}</td>
                <td>
                  {tab === 'beschikbaar' ? (
                    <button
                      className="text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={loadingId === t.id}
                      onClick={async () => {
                        setLoadingId(t.id);
                        setErrorMsg(null);
                        try {
                          if (onSignup) await onSignup(t.id);
                          setJustSignedUp(true);
                          setTab('ingeschreven');
                        } catch (e) {
                          setErrorMsg('Inschrijven mislukt. Probeer opnieuw.');
                        } finally {
                          setLoadingId(null);
                        }
                      }}
                    >
                      {loadingId === t.id ? 'Bezig...' : 'Inschrijven'}
                    </button>
                  ) : (
                    <button
                      className="text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={loadingId === t.id}
                      onClick={async () => {
                        setLoadingId(t.id);
                        setErrorMsg(null);
                        try {
                          if (onSignoff) await onSignoff(t.id);
                          setToast('Je bent uitgeschreven voor dit toernooi!');
                        } catch (e) {
                          setErrorMsg('Uitschrijven mislukt. Probeer opnieuw.');
                        } finally {
                          setLoadingId(null);
                        }
                      }}
                    >
                      {loadingId === t.id ? 'Bezig...' : 'Uitschrijven'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {errorMsg && <div className="text-red-500 text-center mt-4">{errorMsg}</div>}
    </section>
  );
};

export default TournamentsSection;
