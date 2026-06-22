import React from 'react';

const ClubUpdatesSection: React.FC<{ updates: any[] }> = ({ updates }) => (
  <section className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
    <h3 className="font-semibold text-primary-900 mb-2">Club & platform updates</h3>
    {updates.length === 0 ? (
      <div className="text-primary-800 text-sm">Geen nieuwe updates</div>
    ) : (
      <ul className="list-disc pl-6 text-primary-800 text-sm">
        {updates.map((u, i) => (
          <li key={i}>{u.message}</li>
        ))}
      </ul>
    )}
  </section>
);

export default ClubUpdatesSection;
