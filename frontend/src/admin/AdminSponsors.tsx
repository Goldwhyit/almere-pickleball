import React from "react";
import { useNavigate } from "react-router-dom";
import SponsorsManagement from "./SponsorsManagement";

export const AdminSponsors: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ap-light">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sponsors Beheer
            </h1>
            <p className="text-gray-600 mt-1">
              Beheer sponsorinformatie en zichtbaarheid
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 text-ap-black hover:text-ap-blue-700 hover:bg-ap-blue-50 rounded-lg transition"
          >
            ← Terug
          </button>
        </div>

        <SponsorsManagement />
      </div>
    </div>
  );
};

export default AdminSponsors;
