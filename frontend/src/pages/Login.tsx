import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { authApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEscapeKey(() => navigate("/"));

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authApi.login(formData.email, formData.password);
      setAuth(data.user, data.accessToken);

      // Redirect based on account type
      if (data.user.member?.accountType === "TRIAL") {
        navigate("/trial-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(
        typeof errorMessage === "string" ? errorMessage : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-ap-hero flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          title="Terug naar homepage (ESC)"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welkom terug</h1>
        <p className="text-gray-600 mb-6">Almere Pickleball</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mailadres
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ap-blue-500 focus:border-transparent"
              placeholder="jouw@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ap-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ap-blue-600 hover:bg-ap-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Nog geen account?{" "}
          <button
            onClick={() => navigate("/trial-signup")}
            className="text-ap-blue-600 hover:text-ap-blue-700 font-semibold"
          >
            Meld je aan voor proefles
          </button>
        </p>
      </div>
    </div>
  );
};
