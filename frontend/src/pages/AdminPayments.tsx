import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../lib/api";

interface Member {
  memberId: string;
  name: string;
  email?: string;
  phone?: string;
  paymentStatus: string;
  lastPaymentDate?: string;
  nextPaymentDue?: string;
  credit?: number;
  punchCardCount?: number;
}

interface PaymentOverview {
  totalMembers: number;
  totalPaid: number;
  totalUnpaid: number;
  byMembershipType: {
    YEARLY_UPFRONT: { paid: Member[]; unpaid: Member[] };
    YEARLY: { paid: Member[]; unpaid: Member[] };
    MONTHLY: { paid: Member[]; unpaid: Member[] };
    PER_SESSION: { paid: Member[]; unpaid: Member[] };
    PUNCH_CARD: { paid: Member[]; unpaid: Member[] };
  };
}

export const AdminPayments = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<PaymentOverview>({
    totalMembers: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    byMembershipType: {
      YEARLY_UPFRONT: { paid: [], unpaid: [] },
      YEARLY: { paid: [], unpaid: [] },
      MONTHLY: { paid: [], unpaid: [] },
      PER_SESSION: { paid: [], unpaid: [] },
      PUNCH_CARD: { paid: [], unpaid: [] },
    },
  });
  const [loading, setLoading] = useState(true);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentsOverview();
  }, []);

  const loadPaymentsOverview = async () => {
    try {
      setLoading(true);
      console.log("📊 Loading payments overview...");
      const response = await adminApi.getPaymentsOverview();
      console.log("✅ Response:", response);
      if (response && response.data) {
        console.log("✅ Response.data:", response.data);
        setOverview(response.data);
      } else {
        console.error("❌ Invalid response structure:", response);
      }
    } catch (error: any) {
      console.error("❌ Failed to load payments overview:", error);
      console.error("Error message:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMembershipLabel = (type: string): string => {
    const labels: Record<string, string> = {
      YEARLY_UPFRONT: "Jaarlijks (vooruitbetaald)",
      YEARLY: "Jaarlijks",
      MONTHLY: "Maandelijks",
      PER_SESSION: "Per sessie",
      PUNCH_CARD: "Strippenkaart",
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL");
  };

  const toggleType = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ap-light">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="animate-spin h-8 w-8 border-4 border-ap-blue-500 border-t-transparent rounded-full mx-auto mt-12"></div>
          <p className="text-center mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ap-light">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Betalingen Overzicht
            </h1>
            <p className="text-gray-600 mt-1">
              Bekijk alle betalingen per abonnement type
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 text-ap-black hover:text-ap-blue-700 hover:bg-ap-blue-50 rounded-lg transition"
          >
            ← Terug
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-ap-sm p-6 border-l-4 border-ap-blue-500">
            <p className="text-sm text-gray-600 mb-1">Totaal Leden</p>
            <p className="text-3xl font-bold text-gray-900">
              {overview.totalMembers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-ap-sm p-6 border-l-4 border-ap-blue-500">
            <p className="text-sm text-gray-600 mb-1">Betaald</p>
            <p className="text-3xl font-bold text-ap-blue-600">
              {overview.totalPaid}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-ap-sm p-6 border-l-4 border-ap-red-500">
            <p className="text-sm text-gray-600 mb-1">Onbetaald</p>
            <p className="text-3xl font-bold text-ap-red-600">
              {overview.totalUnpaid}
            </p>
          </div>
        </div>

        {/* Membership Type Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Per Abonnement Type
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {overview.byMembershipType &&
              Object.entries(overview.byMembershipType).map(([type, data]) => {
                const totalForType = data.paid.length + data.unpaid.length;
                if (totalForType === 0) return null;

                const isExpanded = expandedType === type;

                return (
                  <div key={type} className="hover:bg-gray-50 transition">
                    <button
                      onClick={() => toggleType(type)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {getMembershipLabel(type)}
                        </h4>
                      </div>

                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Totaal</p>
                          <p className="text-lg font-bold text-gray-900">
                            {totalForType}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-green-600">Betaald</p>
                          <p className="text-lg font-bold text-green-600">
                            {data.paid.length}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-red-600">Onbetaald</p>
                          <p className="text-lg font-bold text-red-600">
                            {data.unpaid.length}
                          </p>
                        </div>

                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 py-4 bg-gray-50 space-y-4">
                        {/* Paid Members */}
                        {data.paid.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                              <span>✅</span>
                              <span>Betaald ({data.paid.length})</span>
                            </h5>
                            <div className="space-y-2">
                              {data.paid.map((member, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded p-3 border border-green-100 flex items-center justify-between"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {member.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {member.email}
                                    </p>
                                    {member.lastPaymentDate && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Laatste betaling:{" "}
                                        {formatDate(member.lastPaymentDate)}
                                      </p>
                                    )}
                                  </div>
                                  {type === "PUNCH_CARD" && (
                                    <div className="text-right">
                                      <p className="text-xs text-gray-600">
                                        Strippen over
                                      </p>
                                      <p className="text-lg font-bold text-gray-900">
                                        {member.punchCardCount || 0}
                                      </p>
                                    </div>
                                  )}
                                  {type === "PER_SESSION" && (
                                    <div className="text-right">
                                      <p className="text-xs text-gray-600">
                                        Tegoed
                                      </p>
                                      <p className="text-lg font-bold text-gray-900">
                                        €{(member.credit || 0).toFixed(2)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Unpaid Members */}
                        {data.unpaid.length > 0 && (
                          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <h5 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                              <span>❌</span>
                              <span>Onbetaald ({data.unpaid.length})</span>
                            </h5>
                            <div className="space-y-2">
                              {data.unpaid.map((member, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded p-3 border border-red-100 flex items-center justify-between"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {member.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {member.email}
                                    </p>
                                    {member.nextPaymentDue && (
                                      <p className="text-xs text-red-600 font-semibold mt-1">
                                        Vervaldatum:{" "}
                                        {formatDate(member.nextPaymentDue)}
                                      </p>
                                    )}
                                  </div>
                                  {type === "PUNCH_CARD" && (
                                    <div className="text-right">
                                      <p className="text-xs text-gray-600">
                                        Strippen over
                                      </p>
                                      <p className="text-lg font-bold text-gray-900">
                                        {member.punchCardCount || 0}
                                      </p>
                                    </div>
                                  )}
                                  {type === "PER_SESSION" && (
                                    <div className="text-right">
                                      <p className="text-xs text-gray-600">
                                        Tegoed
                                      </p>
                                      <p className="text-lg font-bold text-gray-900">
                                        €{(member.credit || 0).toFixed(2)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
