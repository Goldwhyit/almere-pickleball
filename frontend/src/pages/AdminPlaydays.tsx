import { useNavigate } from "react-router-dom";

export const AdminPlaydays = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-ap-light">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/admin")}
          className="text-ap-blue-600 hover:text-ap-blue-700 mb-4"
        >
          ← Terug naar Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Trainingsdag Aanmeldingen
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-ap-sm mt-8">
          <p className="text-gray-600">Trainingsdag pagina - in development</p>
        </div>
      </div>
    </div>
  );
};
