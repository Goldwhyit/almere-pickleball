import React, { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

type PaymentMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
  paymentStatus: string;
  createdAt: string;
};

const PaymentsOverview: React.FC = () => {
  const [members, setMembers] = useState<PaymentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "UNPAID">(
    "ALL",
  );

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log("📊 Loading members for payments...");
      const response = await adminApi.getMembers();
      console.log("✅ Members response:", response);
      if (response && response.data) {
        // Filter to only members with subscriptions
        const membersWithSubs = response.data.filter(
          (m: any) => m.membershipType,
        );
        console.log("✅ Members with subscriptions:", membersWithSubs.length);
        setMembers(membersWithSubs);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to load members:", error);
      console.error("Error details:", error.response?.data || error.message);
      // Fallback to empty array
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PAID") return member.paymentStatus === "PAID";
    if (filterStatus === "UNPAID")
      return (
        member.paymentStatus === "UNPAID" || member.paymentStatus === "PENDING"
      );
    return true;
  });

  const stats = {
    total: members.length,
    paid: members.filter((m) => m.paymentStatus === "PAID").length,
    unpaid: members.filter(
      (m) => m.paymentStatus === "UNPAID" || m.paymentStatus === "PENDING",
    ).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Totaal Abonnees</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">✅ Betaald</p>
          <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">❌ Openstaand</p>
          <p className="text-3xl font-bold text-red-600">{stats.unpaid}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Alle ({members.length})
        </button>
        <button
          onClick={() => setFilterStatus("PAID")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "PAID"
              ? "bg-green-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Betaald ({stats.paid})
        </button>
        <button
          onClick={() => setFilterStatus("UNPAID")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "UNPAID"
              ? "bg-red-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Openstaand ({stats.unpaid})
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Naam
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Abonnement
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Betaalstatus
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Lid sinds
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {member.membershipType === "YEARLY_UPFRONT" &&
                        "Jaarlijks Vooruit"}
                      {member.membershipType === "YEARLY" && "Jaarlijks"}
                      {member.membershipType === "MONTHLY" && "Maandelijks"}
                      {member.membershipType === "PUNCH_CARD" && "Punchkaart"}
                      {member.membershipType === "PER_SESSION" && "Per Sessie"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {member.paymentStatus === "PAID" ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        ✅ Betaald
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        ❌ Openstaand
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(member.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Geen leden gevonden met status '{filterStatus}'
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsOverview;
