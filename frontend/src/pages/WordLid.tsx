import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { membershipsAPI } from "../lib/membershipsApi";
import { useAuthStore } from "../stores/auth";

interface MembershipType {
  id: string;
  name: string;
  price: string;
  features: string[];
}

const fallbackTypes: MembershipType[] = [
  {
    id: "YEARLY_UPFRONT",
    name: "Jaarlidmaatschap ineens",
    price: "€168 ineens (10% korting)",
    features: ["Betaal per jaar", "10% korting", "Club events inbegrepen"],
  },
  {
    id: "YEARLY",
    name: "Jaarlidmaatschap",
    price: "€187/jaar (≈ €15,58/maand)",
    features: [
      "Automatische incasso",
      "Onbeperkt spelen",
      "Community & events",
    ],
  },
  {
    id: "MONTHLY",
    name: "Maandlidmaatschap",
    price: "€34,00/maand (prorationed)",
    features: [
      "Maandelijks opzegbaar",
      "Onbeperkt spelen",
      "Pro-rata eerste maand",
    ],
  },
  {
    id: "PER_SESSION",
    name: "Per keer",
    price: "€8,50 per speeldag",
    features: ["Betaal per speeldag", "Ideaal voor flexibiliteit"],
  },
  {
    id: "PUNCH_CARD",
    name: "Strippenkaart",
    price: "€67,50 voor 10 beurten",
    features: ["6 maanden geldig", "1x per week wijzigbaar"],
  },
];

export const WordLid = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [types, setTypes] = useState<MembershipType[]>(fallbackTypes);
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    hasPlayedBefore: "no",
    experienceLevel: "beginner",
    otherSports: "",
    notes: "",
  });

  useEscapeKey(() => navigate("/"));

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await membershipsAPI.getPlans();
        setTypes(data);
        // Alleen setten als selectedType nog niet gezet is
        if (!selectedType && data?.[0]?.id) {
          setSelectedType(data[0].id);
        }
      } catch (e: any) {
        setTypes(fallbackTypes);
        if (!selectedType) setSelectedType(fallbackTypes[0].id);
      }
    };
    fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Lidmaatschap verplicht
    if (!selectedType) {
      setError("Kies een lidmaatschap om verder te gaan.");
      return;
    }

    // E-mail validatie
    if (!formData.email || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }

    // Wachtwoord validatie
    if (!formData.password || formData.password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn");
      return;
    }

    // Telefoonnummer validatie
    if (!formData.phone || !/^\d{8,}$/.test(formData.phone)) {
      setError("Vul een geldig telefoonnummer in (minimaal 8 cijfers).");
      return;
    }

    // Postcode validatie
    if (
      !formData.postalCode ||
      !/^\d{4}\s?[A-Za-z]{2}$/.test(formData.postalCode)
    ) {
      setError("Vul een geldige postcode in (1234 AB).");
      return;
    }

    // Verplichte velden
    if (!formData.firstName || !formData.lastName) {
      setError("Voornaam en achternaam zijn verplicht");
      return;
    }
    if (!formData.street || !formData.houseNumber || !formData.city) {
      setError("Vul je adresgegevens in.");
      return;
    }
    if (
      !formData.emergencyName ||
      !formData.emergencyPhone ||
      !formData.emergencyRelation
    ) {
      setError("Vul je noodcontactgegevens in.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        membershipType: selectedType,
        phone: formData.phone,
        street: formData.street,
        houseNumber: formData.houseNumber,
        postalCode: formData.postalCode,
        city: formData.city,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelation: formData.emergencyRelation,
        hasPlayedBefore: formData.hasPlayedBefore,
        experienceLevel: formData.experienceLevel,
        otherSports: formData.otherSports || undefined,
        notes: formData.notes || undefined,
      };
      const res = await membershipsAPI.apply(payload);
      if (res.accessToken && res.user) {
        setAuth(res.user, res.accessToken);
      }
      if (res.requiresPayment && selectedType === "MONTHLY") {
        setPaymentInfo(res.pricingInfo);
        setShowPaymentModal(true);
        setLoading(false);
        return;
      }
      setShowSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Aanmelding mislukt";
      if (err?.response?.status === 409) {
        setError(
          "Dit e-mailadres is al geregistreerd. Probeer in te loggen of gebruik een ander e-mailadres.",
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      setLoading(true);
      await membershipsAPI.confirmMonthlyPayment(
        localStorage.getItem("accessToken") || "",
      );
      setShowPaymentModal(false);
      setShowSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err: any) {
      setError("Betaling kon niet worden bevestigd");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Overlay modals (blijven in DOM, geen remount van root)
  const PaymentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 relative">
        <button
          onClick={() => {
            setShowPaymentModal(false);
            navigate("/");
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          title="Annuleer"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          💳 Betaling Maandlidmaatschap
        </h2>
        <p className="text-sm text-gray-600 mb-6">{paymentInfo.reason}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Bedrag:</span>
            <span className="font-semibold text-gray-900">
              €{paymentInfo.price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Dit bedrag wordt in mindering gebracht op je eerste
            maandlidmaatschap.
          </p>
        </div>
        <div className="text-xs text-gray-500 mb-6 p-3 bg-gray-50 rounded">
          Dit is een testbetaling. Bij annulering wordt er niets opgeslagen.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowPaymentModal(false);
              navigate("/");
            }}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            disabled={loading}
          >
            Annuleer
          </button>
          <button
            onClick={handlePaymentConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Bezig..." : "Betaal nu"}
          </button>
        </div>
      </div>
    </div>
  );

  const SuccessOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          title="Terug naar homepage (ESC)"
        >
          ✕
        </button>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Aanmelding voltooid!
        </h2>
        <p className="text-lg text-slate-700 mb-8">
          Bedankt {formData.firstName}! Je bent nu ingelogd.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-ap-blue-600 hover:bg-ap-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-ap-md hover:shadow-ap-lg"
        >
          → Naar dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4 relative">
      {/* Overlay modals */}
      {showPaymentModal && paymentInfo && <PaymentModal />}
      {showSuccess && <SuccessOverlay />}
      <div
        className={
          showPaymentModal || showSuccess
            ? "pointer-events-none opacity-50"
            : ""
        }
      >
        <div className="max-w-5xl mx-auto">
          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
            title="Terug naar homepage (ESC)"
          >
            ✕
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Word lid van Almere Pickleball
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
              Kies het lidmaatschap dat bij je past en meld je aan.
            </p>
          </div>

          {/* Types grid as selectable tiles */}
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
            role="radiogroup"
            aria-label="Kies je lidmaatschap"
          >
            {types.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedType(t.id)}
                  disabled={loading}
                  className={`relative text-left border-2 rounded-xl p-6 transition-all duration-200 w-full transform ${
                    isSelected
                      ? "border-ap-blue-600 bg-ap-blue-50 shadow-ap-lg scale-[1.02] -translate-y-1"
                      : "border-slate-200 hover:border-primary-400 bg-white hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-lg text-slate-900">
                        {t.name}
                      </p>
                      <p className="text-sm text-slate-600">{t.price}</p>
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ap-blue-600 text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {t.features.map((f, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-ap-blue-600">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <span>❗</span>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👤 Persoonlijke Gegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Voornaam *"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Achternaam *"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mailadres *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Wachtwoord (min. 8 tekens) *"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefoonnummer *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Adresgegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="street"
                    placeholder="Straat *"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="houseNumber"
                    placeholder="Huisnummer *"
                    value={formData.houseNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postcode (1234 AB) *"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="Plaats *"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🆘 Noodcontact
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="emergencyName"
                    placeholder="Naam *"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    name="emergencyPhone"
                    placeholder="Telefoonnummer *"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="emergencyRelation"
                    placeholder="Relatie (bv. moeder, vriend) *"
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🎾 Ervaring
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Heb je eerder pickleball gespeeld?
                    </label>
                    <select
                      name="hasPlayedBefore"
                      value={formData.hasPlayedBefore}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="no">Nee</option>
                      <option value="yes">Ja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Ervaringsniveau
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Gemiddeld</option>
                      <option value="advanced">Gevorderd</option>
                    </select>
                  </div>
                </div>
                <textarea
                  name="otherSports"
                  placeholder="Ander sporten die je speelt (optioneel)"
                  value={formData.otherSports}
                  onChange={handleInputChange}
                  className="w-full mt-4 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Opmerkingen (optioneel)
                </label>
                <textarea
                  name="notes"
                  placeholder="Iets anders wat we moeten weten?"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ap-yellow-500 hover:bg-ap-yellow-600 text-ap-black font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? "Bezig met aanmelden..." : "Word lid"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                disabled={loading}
              >
                Annuleer
              </button>
            </form>
          </div>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Liever eerst proberen?{" "}
            <button
              onClick={() => navigate("/trial-signup")}
              className="text-ap-blue-600 hover:text-ap-blue-700 font-semibold"
              disabled={loading}
            >
              Meld je aan voor proeflessen
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
