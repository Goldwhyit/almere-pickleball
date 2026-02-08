import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Stats = {
  totalMembers: number;
  pendingMembers: number;
  openPayments: number;
  totalTrialMembers: number;
  convertedToMember: number;
  paymentDetails?: {
    totalWithSubscription: number;
    paid: number;
    unpaid: number;
  };
};

const DashboardOverview: React.FC<{
  onSelectTab?: (index: number) => void;
}> = ({ onSelectTab }) => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    pendingMembers: 0,
    openPayments: 0,
    totalTrialMembers: 0,
    convertedToMember: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const loadStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();

      if (!response.data) {
        throw new Error("No data in response");
      }

      const data = response.data as Partial<Stats> & {
        paymentDetails?: {
          totalWithSubscription?: number;
          paid?: number;
          unpaid?: number;
        };
      };

      setStats({
        totalMembers: Number(data.totalMembers ?? 0),
        pendingMembers: Number(data.pendingMembers ?? 0),
        openPayments: Number(data.openPayments ?? 0),
        totalTrialMembers: Number(data.totalTrialMembers ?? 0),
        convertedToMember: Number(data.convertedToMember ?? 0),
        paymentDetails: data.paymentDetails
          ? {
              totalWithSubscription: Number(
                data.paymentDetails.totalWithSubscription ?? 0,
              ),
              paid: Number(data.paymentDetails.paid ?? 0),
              unpaid: Number(data.paymentDetails.unpaid ?? 0),
            }
          : undefined,
      });
    } catch (error: any) {
      console.error("❌ Failed to load stats:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      // Keep existing stats on error - don't break the UI
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[200px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Totaal Leden",
      value: stats.totalMembers,
      color: "bg-blue-500",
      icon: "👥",
    },
    {
      title: "In Afwachting",
      value: stats.pendingMembers,
      color: "bg-yellow-500",
      icon: "⏳",
    },
    {
      title: "Openstaande Betalingen",
      value: stats.openPayments,
      color: "bg-red-500",
      icon: "💰",
    },
    {
      title: "Trialleden",
      value: stats.totalTrialMembers,
      color: "bg-purple-500",
      icon: "🧪",
    },
    {
      title: "Naar Lid Geconverteerd",
      value: stats.convertedToMember,
      color: "bg-green-700",
      icon: "🔄",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Overzicht
          </h2>
          <p className="text-gray-600">
            Welkom bij het admin dashboard van Almere Pickleball
          </p>
        </div>
      </div>

      {/* Beheer Tegels - Top Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Beheer Tegels</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate("/admin/profile")}
            className="px-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs text-center">Eigen Gegevens</span>
          </button>
          <button
            onClick={() => navigate("/admin/members")}
            className="px-3 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">👥</span>
            <span className="text-xs text-center">Ledenlijst</span>
          </button>
          <button
            onClick={() => navigate("/admin/approvals")}
            className="px-3 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">✅</span>
            <span className="text-xs text-center">Goedkeuringen</span>
            {stats.pendingMembers > 0 ? (
              <span className="text-lg font-bold bg-white text-yellow-700 px-2 py-0.5 rounded">
                ⏳ {stats.pendingMembers}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => navigate("/admin/playdays/registrations")}
            className="px-3 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">📋</span>
            <span className="text-xs text-center">Aanmeldingen</span>
          </button>
          <button
            onClick={() => navigate("/admin/payments")}
            className="px-3 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">💰</span>
            <span className="text-xs text-center">Betalingen</span>
          </button>
          <button
            onClick={() => navigate("/admin/photos")}
            className="px-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">📸</span>
            <span className="text-xs text-center">Fotosectie</span>
          </button>
          <button
            onClick={() => navigate("/admin/branding")}
            className="px-3 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">🎨</span>
            <span className="text-xs text-center">Logo & Branding</span>
          </button>
          <button
            onClick={() => {
              if (onSelectTab) {
                onSelectTab(4);
              } else {
                navigate("/admin/sponsors");
              }
            }}
            className="px-3 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition flex flex-col items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
          >
            <span className="text-2xl">🤝</span>
            <span className="text-xs text-center">Sponsors</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Bottom Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Statistieken</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            // Special rendering for payments card
            if (
              stat.title === "Openstaande Betalingen" &&
              stats.paymentDetails
            ) {
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4"
                  style={{ borderLeftColor: "#ef4444" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <div
                      className={`${stat.color} w-12 h-12 rounded-full opacity-10`}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{stat.title}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Met abo:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {stats.paymentDetails.totalWithSubscription}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600">
                        ✅ Betaald:
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {stats.paymentDetails.paid}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-600">
                        ❌ Openstaand:
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {stats.paymentDetails.unpaid}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4"
                style={{
                  borderLeftColor:
                    stat.color.replace("bg-", "").split("-")[0] === "blue"
                      ? "#3b82f6"
                      : stat.color.replace("bg-", "").split("-")[0] === "yellow"
                        ? "#eab308"
                        : stat.color.replace("bg-", "").split("-")[0] === "red"
                          ? "#ef4444"
                          : stat.color.replace("bg-", "").split("-")[0] ===
                              "green"
                            ? "#22c55e"
                            : stat.color.replace("bg-", "").split("-")[0] ===
                                "purple"
                              ? "#a855f7"
                              : stat.color.replace("bg-", "").split("-")[0] ===
                                  "gray"
                                ? "#6b7280"
                                : "#16a34a",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <div
                    className={`${stat.color} w-12 h-12 rounded-full opacity-10`}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
