import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlaydaysList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="mb-4 text-4xl">📅</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Trainingsdagen Overzicht</h3>
      <p className="text-gray-600 mb-6">Bekijk en beheer alle aanmeldingen per trainingsdag</p>
      <button
        onClick={() => navigate('/admin/playdays/registrations')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition inline-block"
      >
        → Bekijk Alle Aanmeldingen
      </button>
    </div>
  );
};

export default PlaydaysList;