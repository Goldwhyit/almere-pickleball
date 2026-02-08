import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export const AdminProfile = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const membershipTypeLabels: Record<string, string> = {
    YEARLY_UPFRONT: "Jaarlidmaatschap (ineens)",
    YEARLY: "Jaarlidmaatschap",
    MONTHLY: "Maandlidmaatschap",
    PER_SESSION: "Per keer",
    PUNCH_CARD: "Strippenkaart",
  };

  return (
    <div className="min-h-screen bg-ap-light">
      {/* Header */}
      <header className="bg-white shadow-ap-sm py-6 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mijn Gegevens</h1>
          <p className="text-sm text-gray-600">Admin account - {user?.email}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-ap-blue-600 hover:bg-ap-blue-700 text-white rounded-lg transition"
          >
            ← Dashboard
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
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Personal Info Card */}
        <section className="bg-white shadow-ap-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            👤 Persoonlijke Gegevens
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-ap-blue-50 border border-ap-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-ap-blue-700 mb-3">
                📋 Contactgegevens
              </h3>
              <div className="space-y-3">
                {user?.member?.firstName && (
                  <p className="text-sm text-ap-blue-700">
                    <strong>Voornaam:</strong> {user.member.firstName}
                  </p>
                )}
                {user?.member?.lastName && (
                  <p className="text-sm text-ap-blue-700">
                    <strong>Achternaam:</strong> {user.member.lastName}
                  </p>
                )}
                <p className="text-sm text-ap-blue-700">
                  <strong>Email:</strong> {user?.email}
                </p>
                {user?.member?.phone && (
                  <p className="text-sm text-ap-blue-700">
                    <strong>Telefoon:</strong> {user.member.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Address Info */}
            <div className="bg-ap-red-50 border border-ap-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-ap-red-700 mb-3">
                📍 Adresgegevens
              </h3>
              <div className="space-y-3">
                {user?.member?.street && (
                  <p className="text-sm text-green-800">
                    <strong>Straat:</strong> {user.member.street}{" "}
                    {user.member.houseNumber}
                  </p>
                )}
                {user?.member?.postalCode && (
                  <p className="text-sm text-green-800">
                    <strong>Postcode:</strong> {user.member.postalCode}
                  </p>
                )}
                {user?.member?.city && (
                  <p className="text-sm text-green-800">
                    <strong>Plaats:</strong> {user.member.city}
                  </p>
                )}
                {!user?.member?.street &&
                  !user?.member?.postalCode &&
                  !user?.member?.city && (
                    <p className="text-sm text-gray-500 italic">
                      Geen adresgegevens ingesteld
                    </p>
                  )}
              </div>
            </div>
          </div>
        </section>

        {/* Membership Info Card */}
        {user?.member?.membershipType && (
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🎾 Lidmaatschapgegevens
            </h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="mb-4">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    user.member.membershipType === "YEARLY_UPFRONT" ||
                    user.member.membershipType === "YEARLY"
                      ? "bg-purple-600 text-white"
                      : user.member.membershipType === "MONTHLY"
                        ? "bg-blue-600 text-white"
                        : user.member.membershipType === "PUNCH_CARD"
                          ? "bg-orange-600 text-white"
                          : "bg-green-600 text-white"
                  }`}
                >
                  {membershipTypeLabels[user.member.membershipType] ||
                    "Onbekend"}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Membership Details */}
                <div className="bg-white rounded p-3 space-y-2 text-sm">
                  {user.member.membershipType === "YEARLY_UPFRONT" && (
                    <>
                      <p className="text-gray-700">
                        💰 <strong>€168</strong> per jaar
                      </p>
                      <p className="text-gray-700">✓ 10% korting</p>
                      <p className="text-gray-700">✓ Betaald ineens</p>
                      <p className="text-gray-700">✓ Onbeperkt trainingen</p>
                    </>
                  )}
                  {user.member.membershipType === "YEARLY" && (
                    <>
                      <p className="text-gray-700">
                        💰 <strong>€187</strong> per jaar
                      </p>
                      <p className="text-gray-700">✓ Automatische incasso</p>
                      <p className="text-gray-700">✓ Onbeperkt trainingen</p>
                    </>
                  )}
                  {user.member.membershipType === "MONTHLY" && (
                    <>
                      <p className="text-gray-700">
                        💰 <strong>€34</strong> per maand
                      </p>
                      <p className="text-gray-700">✓ Maandelijks opzegbaar</p>
                      <p className="text-gray-700">✓ Onbeperkt trainingen</p>
                    </>
                  )}
                  {user.member.membershipType === "PER_SESSION" && (
                    <>
                      <p className="text-gray-700">
                        💰 <strong>€8,50</strong> per speeldag
                      </p>
                      <p className="text-gray-700">✓ Betaal per keer</p>
                      <p className="text-gray-700">✓ Flexibel</p>
                    </>
                  )}
                  {user.member.membershipType === "PUNCH_CARD" && (
                    <>
                      <p className="text-gray-700">
                        💰 <strong>€67,50</strong> voor 10 beurten
                      </p>
                      <p className="text-gray-700">✓ 6 maanden geldig</p>
                    </>
                  )}
                </div>

                {/* Payment Status */}
                <div className="bg-white rounded p-3 space-y-2 text-sm">
                  <p className="text-gray-700">
                    <strong>Lidmaatschapsstatus:</strong>{" "}
                    <span className="font-semibold text-green-600">
                      ✓ Actief
                    </span>
                  </p>
                  {user.member.membershipType === "PUNCH_CARD" &&
                    user.member.punchCardCount !== undefined && (
                      <p className="text-gray-700">
                        <strong>Strippen over:</strong>{" "}
                        {user.member.punchCardCount}
                      </p>
                    )}
                  {user.member.membershipType === "PER_SESSION" &&
                    user.member.credit !== undefined && (
                      <p className="text-gray-700">
                        <strong>Tegoed:</strong> €
                        {user.member.credit.toFixed(2)}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Admin Status Card */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔐 Admin Status
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <h3 className="font-semibold text-yellow-900">
                  Administrator Account
                </h3>
                <p className="text-sm text-yellow-800">
                  Je hebt admin-rechten op dit platform
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
