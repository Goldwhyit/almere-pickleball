import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LessonScheduler } from "../components/LessonScheduler";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { trialApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";

export const TrialDashboard = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [status, setStatus] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEscapeKey(() => {
    if (showCompletionModal) {
      setShowCompletionModal(false);
    } else {
      logout();
      navigate("/");
    }
  });

  useEffect(() => {
    loadTrialData();
  }, []);

  const loadTrialData = async () => {
    try {
      const [statusRes, lessonsRes] = await Promise.all([
        trialApi.getMyStatus(),
        trialApi.getMyLessons(),
      ]);
      setStatus(statusRes.data);
      setLessons(lessonsRes.data);

      // Show completion modal if trial expired
      if (statusRes.data.isTrialExpired) {
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error("Failed to load trial data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    try {
      await trialApi.convertToMember();
      alert("Welkom als lid!");
      navigate("/dashboard");
    } catch (err) {
      alert("Conversie mislukt");
    }
  };

  const handleDecline = async () => {
    const reason = prompt("Waarom stop je?");
    if (!reason) return;

    try {
      await trialApi.declineTrialMembership({
        reason,
        feedback: prompt("Optioneel feedback:") || "",
      });
      navigate("/login");
    } catch (err) {
      alert("Fout bij afmelding");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ap-blue-600 mx-auto mb-4"></div>
          <p>Bezig met laden...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Kon statusgegevens niet laden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ap-light">
      {/* Header */}
      <header className="bg-ap-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welkom, {status.firstName}!</h1>
            <p className="text-primary-100">
              ⏱️ {status.daysRemaining} dagen resterend
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-ap-blue-700 hover:bg-ap-blue-800 px-4 py-2 rounded"
          >
            Uitloggen
          </button>
        </div>
      </header>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center relative">
            <button
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
              title="Sluiten (ESC)"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hoe beviel pickleball?
            </h2>
            <p className="text-gray-600 mb-8">
              Je proefperiode is afgelopen. Wil je lid worden of toch nog even
              wachten?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleConvert}
                className="w-full bg-ap-yellow-500 hover:bg-ap-yellow-600 text-ap-black font-semibold py-3 rounded-lg transition"
              >
                Ik wil lid worden!
              </button>
              <button
                onClick={handleDecline}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 rounded-lg transition"
              >
                Ik stop voorlopig
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Geboekte lessen</p>
            <p className="text-3xl font-bold text-ap-blue-600">
              {status.trialLessonsBooked}/3
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Voltooid</p>
            <p className="text-3xl font-bold text-green-600">
              {status.trialLessonsCompleted}/3
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-3xl font-bold text-green-600">🟢 Actief</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === "overview"
                  ? "text-ap-blue-600 border-b-2 border-ap-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overzicht
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === "booking"
                  ? "text-ap-blue-600 border-b-2 border-ap-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Datums selecteren
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === "lessons"
                  ? "text-ap-blue-600 border-b-2 border-ap-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mijn lessen
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Trial informatie
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    ✓ Begonnen op:{" "}
                    {new Date(status.trialStartDate).toLocaleDateString(
                      "nl-NL",
                    )}
                  </p>
                  <p>
                    ✓ Eindigt op:{" "}
                    {new Date(status.trialEndDate).toLocaleDateString("nl-NL")}
                  </p>
                  <p>✓ Locatie: Sporthal Almere, Bataviaplein 60</p>
                  <p>✓ 3 gratis proefLessons (18:00-19:00)</p>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">
                  Volgende stappen
                </h3>
                <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                  <li>Selecteer 3 datums in de tab "Datums selecteren"</li>
                  <li>Kom ter plekke 15 minuten eerder voor registratie</li>
                  <li>Breng handschoenen en schoon schoeisel mee</li>
                  <li>Besluit na 3 lessen of je lid wilt worden</li>
                </ol>
              </div>
            )}

            {/* Booking Tab */}
            {activeTab === "booking" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Kies 3 trainingen
                </h2>
                <LessonScheduler
                  canBook={status.trialLessonsBooked < 3}
                  maxBookings={3 - status.trialLessonsBooked}
                  existingBookings={lessons}
                />
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === "lessons" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Mijn lessen
                </h2>
                {lessons.length === 0 ? (
                  <p className="text-gray-600">Nog geen lessen geboekt</p>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(
                                lesson.scheduledDate,
                              ).toLocaleDateString("nl-NL")}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {lesson.scheduledTime}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {lesson.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {lesson.status === "COMPLETED"
                                ? "✓ Voltooid"
                                : "🟢 Gepland"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
