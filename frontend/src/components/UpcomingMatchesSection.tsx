import React from 'react';

const UpcomingMatchesSection: React.FC<{
  matches: any[];
  onSignup?: () => void;
  onSignoff?: () => void;
  onConfirm?: () => void;
  showAllMatchesButton?: boolean;
}> = ({ matches, showAllMatchesButton = false }) => (
  <section className="bg-white rounded-xl p-6 mb-6">
    <h3 className="text-lg font-bold mb-2">Jouw wedstrijden</h3>
    {matches.length === 0 ? (
      <div className="text-gray-500 py-8 text-center">
        <p>Je hebt nog geen wedstrijden ingepland</p>
        <p className="text-sm mt-2">Wedstrijden verschijnen hier zodra je bent ingeschreven voor een toernooi</p>
        {showAllMatchesButton && (
          <a href="/matches" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded shadow hover:bg-primary-700 transition">Bekijk alle wedstrijden</a>
        )}
      </div>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th>Datum</th>
            <th>Ronde</th>
            <th>Status</th>
            <th>Actie</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id} className="border-t">
              <td>{m.scheduledDatetime ? new Date(m.scheduledDatetime).toLocaleString() : '-'}</td>
              <td>{m.roundName || '-'}</td>
              <td>{m.status}</td>
              <td>
                {/* Restrictie: max 3 actieve wedstrijden */}
                {m.status === 'SCHEDULED' && m.userActiveMatches < 3 ? (
                  <button className="text-blue-600" onClick={() => window.alert('Je bent aangemeld voor deze wedstrijd!')}>Aanmelden</button>
                ) : m.status === 'SCHEDULED' && m.userActiveMatches >= 3 ? (
                  <button className="text-gray-400" disabled title="Maximaal 3 actieve wedstrijden">Limiet bereikt</button>
                ) : null}
                {m.status === 'CONFIRMED' && <button className="text-gray-400" disabled>Bevestigd</button>}
                {m.status === 'OPEN' && (
                  <button className="text-green-600" onClick={() => window.alert('Je deelname is bevestigd!')}>Bevestigen</button>
                )}
                {m.status === 'SCHEDULED' && (
                  <button className="text-red-600 ml-2" onClick={() => window.alert('Je bent afgemeld voor deze wedstrijd!')}>Uitschrijven</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
);

export default UpcomingMatchesSection;
