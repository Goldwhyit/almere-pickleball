import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "../admin/DashboardOverview";
import { useAuthStore } from "../stores/auth";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ap-light">
      {/* Header */}
      <header className="bg-white shadow-ap-sm py-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Welkom, {user?.email}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate("/admin/profile")}
            className="px-4 py-2 text-ap-black hover:text-ap-blue-700 hover:bg-ap-blue-50 rounded-lg transition"
          >
            👤 Mijn Gegevens
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-ap-red-600 hover:bg-ap-red-700 text-white rounded-lg transition"
          >
            Uitloggen
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <DashboardOverview />
      </div>
    </div>
  );
};

export default AdminDashboard;
