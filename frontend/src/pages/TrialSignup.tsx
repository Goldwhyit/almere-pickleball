import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { trialApi } from "../lib/api";

export const TrialSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEscapeKey(() => navigate("/"));
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    passwordConfirm: "",
  });
  const [checks, setChecks] = useState({
    terms: false,
    privacy: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecks({
      ...checks,
      [e.target.name]: e.target.checked,
    });
  };

  const validate = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.dateOfBirth ||
      !formData.password
    ) {
      setError("Alle velden zijn verplicht");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn");
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Wachtwoorden komen niet overeen");
      return false;
    }
    if (!checks.terms || !checks.privacy) {
      setError("Je moet de voorwaarden accepteren");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await trialApi.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      });

      // Store token
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setShowSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: { email: formData.email },
        });
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Inschrijving mislukt";
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Inschrijving mislukt",
      );
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-ap-hero flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center relative">
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
            title="Terug naar homepage (ESC)"
          >
            ✕
          </button>
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Je bent ingeschreven!
          </h2>
          <p className="text-gray-600 mb-6">
            We leiden je door naar het inlogscherm...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ap-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-ap-hero py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 relative">
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
            title="Terug naar homepage (ESC)"
          >
            ✕
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Almere Pickleball
          </h1>
          <p className="text-gray-600 mb-8">
            Meld je aan voor je gratis proefles
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voornaam
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achternaam
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mailadres
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Phone & DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geboortedatum
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Min. 8 tekens"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Herhaal wachtwoord
                </label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="terms"
                  checked={checks.terms}
                  onChange={handleCheckChange}
                  className="w-4 h-4 text-ap-blue-600 rounded"
                  required
                />
                <span className="ml-3 text-sm text-gray-700">
                  Ik accepteer de{" "}
                  <button className="text-ap-blue-600 hover:underline">
                    voorwaarden
                  </button>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={checks.privacy}
                  onChange={handleCheckChange}
                  className="w-4 h-4 text-ap-blue-600 rounded"
                  required
                />
                <span className="ml-3 text-sm text-gray-700">
                  Ik accepteer het{" "}
                  <button className="text-ap-blue-600 hover:underline">
                    privacybeleid
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ap-yellow-500 hover:bg-ap-yellow-600 text-ap-black font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "Bezig met inschrijven..." : "INSCHRIJVEN"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Heb je al een account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-ap-blue-600 hover:text-ap-blue-700 font-semibold"
            >
              Inloggen
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
