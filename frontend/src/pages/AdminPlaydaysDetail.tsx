import React from "react";
import { useNavigate } from "react-router-dom";
import { TrainingRegistrations } from "../admin/TrainingRegistrations";

const AdminPlaydaysDetail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ap-light px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Trainingsdag Aanmeldingen
          </h1>
          <p className="text-gray-600 mt-1">
            Bekijk alle aanmeldingen per trainingsdag, abonnement en
            betaalstatus
          </p>
        </div>
        <button
          onClick={() => navigate("/admin")}
          className="px-4 py-2 text-ap-black hover:text-ap-blue-700 hover:bg-ap-blue-50 rounded-lg transition"
        >
          ← Terug
        </button>
      </div>

      <TrainingRegistrations />
    </div>
  );
};

export default AdminPlaydaysDetail;
