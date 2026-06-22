import React from 'react';

const PerformanceSection: React.FC<{
  duprRating?: number;
  matchesPlayed?: number;
  winPercentage?: number;
  clubRanking?: number | string;
}> = ({ duprRating, matchesPlayed, winPercentage, clubRanking }) => (
  <section className="bg-white rounded-xl p-6 mb-6">
    <h3 className="text-lg font-bold mb-2">Jouw prestaties</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <div className="text-sm text-gray-500 relative group">
          DUPR rating
          <span className="material-icons text-base text-gray-400 ml-1 cursor-pointer group-hover:text-primary-600" tabIndex={0}>
            info
          </span>
          <div className="absolute left-0 top-6 z-10 w-64 bg-white border border-primary-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            <strong>Wat is DUPR?</strong> DUPR (Dynamic Universal Pickleball Rating) is een internationaal systeem dat je speelniveau berekent op basis van je wedstrijdresultaten. Hoe meer je speelt, hoe nauwkeuriger je rating wordt.<br />Meer info: <a href="https://www.dupr.com/about" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">dupr.com/about</a>
          </div>
        </div>
        <div className="text-xl font-bold flex items-center gap-2">
          {duprRating !== undefined ? duprRating : <span className="text-gray-400">n.v.t.</span>}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Gespeelde wedstrijden</div>
        <div className="text-xl font-bold">{matchesPlayed ?? <span className="text-gray-400">n.v.t.</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Win percentage</div>
        <div className="text-xl font-bold">{winPercentage !== undefined ? `${winPercentage}%` : <span className="text-gray-400">n.v.t.</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Club ranking</div>
        <div className="text-xl font-bold">{clubRanking ?? <span className="text-gray-400">n.v.t.</span>}</div>
      </div>
    </div>
    <div className="text-xs text-gray-400 mt-2">Deze gegevens worden automatisch berekend op basis van wedstrijden.</div>
    <div className="text-xs text-gray-500 mt-1">
      <strong>Wat is DUPR?</strong> DUPR (Dynamic Universal Pickleball Rating) is een internationaal systeem dat je speelniveau berekent op basis van je wedstrijdresultaten. Hoe meer je speelt, hoe nauwkeuriger je rating wordt. Meer info: <a href="https://www.dupr.com/about" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">dupr.com/about</a>
    </div>
  </section>
);

export default PerformanceSection;
