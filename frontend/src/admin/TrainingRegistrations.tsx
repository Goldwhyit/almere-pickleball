import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

interface Member {
  memberId: string;
  name: string;
  email?: string;
  phone?: string;
  paymentStatus: "PAID" | "UNPAID";
}

interface TrainingSession {
  date: string;
  time: string;
  location: string;
  totalRegistrations: number;
  capacityLeft: number;
  byMembershipType: {
    YEARLY_UPFRONT: Member[];
    YEARLY: Member[];
    MONTHLY: Member[];
    PER_SESSION: Member[];
    PUNCH_CARD: Member[];
    TRIAL: Member[];
    UNKNOWN?: Member[];
    [key: string]: Member[] | undefined;
  };
  byPaymentStatus: {
    PAID: number;
    UNPAID: number;
  };
}

export const TrainingRegistrations = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getTrainingRegistrations();
      console.log("Training registrations response:", response.data);
      setSessions(response.data.registrations || []);
    } catch (error) {
      console.error("Failed to load training registrations:", error);
      // Set empty array on error - don't show error message
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipLabel = (type: string): string => {
    const labels: Record<string, string> = {
      YEARLY_UPFRONT: "Jaarlijks (direct)",
      YEARLY: "Jaarlijks",
      MONTHLY: "Maandelijks",
      PER_SESSION: "Per sessie",
      PUNCH_CARD: "Punchkaart",
      TRIAL: "Proefles",
    };
    return labels[type] || type;
  };

  const getCapacityColor = (left: number): string => {
    if (left >= 8) return "text-green-600 font-semibold";
    if (left >= 4) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const getCapacityBgColor = (left: number): string => {
    if (left >= 8) return "bg-green-50 border-green-200";
    if (left >= 4) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Laden...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-4 text-4xl">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Geen aanmeldingen gevonden
          </h3>
          <p className="text-gray-600 mb-6">
            Er zijn momenteel geen trainingsdagen met aanmeldingen. Leden kunnen
            zich aanmelden voor trainingen via hun member dashboard.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm text-gray-700">
            <p className="font-semibold text-blue-900 mb-2">
              💡 Hoe voegen leden trainingsdagen toe?
            </p>
            <ul className="space-y-1 text-blue-800">
              <li>• Leden melden zich aan via hun member dashboard</li>
              <li>
                • Ze selecteren trainingsdagen waar ze naartoe willen gaan
              </li>
              <li>• Aanmeldingen verschijnen hier zodra ze zijn bevestigd</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Trainingsdag Aanmeldingen
        </h3>
        <p className="text-sm text-gray-600">
          Klik op een trainingsdag voor meer details
        </p>
      </div>

      {/* Grid of training date cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSession(session)}
            className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
              selectedSession === session
                ? "bg-blue-50 border-blue-500"
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase">
                {formatDateShort(session.date)}
              </p>
              <h4 className="text-lg font-bold text-gray-900 mt-1">
                {session.time}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{session.location}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aanmeldingen</span>
                <span className="font-bold text-gray-900">
                  {session.totalRegistrations}/16
                </span>
              </div>
              <div
                className={`p-2 rounded border ${getCapacityBgColor(session.capacityLeft)}`}
              >
                <p className="text-xs text-gray-600">Plekken vrij</p>
                <p
                  className={`text-2xl font-bold ${getCapacityColor(session.capacityLeft)}`}
                >
                  {session.capacityLeft}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail modal/panel */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatDate(selectedSession.date)}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedSession.time} • {selectedSession.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Status Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-700 font-semibold">
                    BETAALD
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {selectedSession.byPaymentStatus.PAID}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700 font-semibold">
                    ONBETAALD
                  </p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    {selectedSession.byPaymentStatus.UNPAID}
                  </p>
                </div>
              </div>

              {/* Capacity info */}
              <div
                className={`p-4 rounded-lg border ${getCapacityBgColor(selectedSession.capacityLeft)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      CAPACITEIT
                    </p>
                    <p className="text-gray-600 mt-1">
                      {selectedSession.totalRegistrations} van 16 plekken bezet
                    </p>
                  </div>
                  <p
                    className={`text-3xl font-bold ${getCapacityColor(selectedSession.capacityLeft)}`}
                  >
                    {selectedSession.capacityLeft} vrij
                  </p>
                </div>
              </div>

              {/* Membership Types Breakdown */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Deelnemers per Abonnement
                </h3>
                <div className="space-y-4">
                  {Object.entries(selectedSession.byMembershipType).map(
                    ([type, members]) => {
                      if (!members || members.length === 0) return null;
                      return (
                        <div
                          key={type}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-900">
                              {getMembershipLabel(type)}
                            </span>
                            <span className="bg-blue-100 text-blue-900 text-sm font-bold px-3 py-1 rounded">
                              {members.length}
                            </span>
                          </div>

                          {/* List members */}
                          <div className="space-y-2">
                            {members.map((member, midx) => (
                              <div
                                key={midx}
                                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {member.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {member.email}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 ${
                                    member.paymentStatus === "PAID"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {member.paymentStatus}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
