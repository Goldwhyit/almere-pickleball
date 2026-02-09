import React from "react";
import type { AdminMember, AdminStats } from "./useAdminData";

// Props: stats en members[] worden extern aangeleverd
interface DashboardKPIsProps {
  stats: AdminStats | null;
  members: AdminMember[];
  loading: boolean;
}

// KPI tile config
const kpiConfig = [
  {
    key: "totalMembers",
    label: "Totaal leden",
    icon: "👥",
    color: "bg-blue-500",
  },
  {
    key: "totalTrialMembers",
    label: "Trial-leden actief",
    icon: "🧪",
    color: "bg-purple-500",
  },
  {
    key: "openPayments",
    label: "Openstaande betalingen",
    icon: "💰",
    color: "bg-red-500",
  },
  {
    key: "convertedToMember",
    label: "Trial conversies",
    icon: "🔄",
    color: "bg-green-700",
  },
];

// Vaste tile height
const TILE_HEIGHT = "h-32";

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ stats, loading }) => {
  // Bereken trial conversie percentage
  const trialCount = stats?.totalTrialMembers ?? 0;
  const conversionCount = stats?.convertedToMember ?? 0;
  const conversionPct =
    trialCount > 0 ? Math.round((conversionCount / trialCount) * 100) : 0;

  // Skeleton placeholder
  const SkeletonTile = () => (
    <div
      className={`bg-white rounded-lg shadow-md p-6 flex flex-col justify-between items-start ${TILE_HEIGHT}`}
    >
      <div className="h-6 w-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
      <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
    </div>
  );

  // KPI value mapping
  const kpiValues: Record<string, number | string> = {
    totalMembers: stats?.totalMembers ?? "--",
    totalTrialMembers: stats?.totalTrialMembers ?? "--",
    openPayments: stats?.openPayments ?? "--",
    convertedToMember: `${conversionCount} (${conversionPct}%)`,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {loading
        ? kpiConfig.map((kpi) => <SkeletonTile key={kpi.key} />)
        : kpiConfig.map((kpi) => (
            <div
              key={kpi.key}
              className={`bg-white rounded-lg shadow-md p-6 flex flex-col justify-between items-start ${TILE_HEIGHT}`}
              aria-label={kpi.label}
            >
              <span className="text-3xl mb-2" aria-hidden>
                {kpi.icon}
              </span>
              <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-3xl font-bold text-gray-900">
                {kpiValues[kpi.key]}
              </p>
            </div>
          ))}
    </div>
  );
};

export default DashboardKPIs;

/*
Toelichting CLS:
- Elke tegel heeft een vaste hoogte (h-32) en padding, zodat de layout niet verschuift bij laden.
- Tijdens loading worden skeletons getoond met exact dezelfde afmetingen als de KPI-tiles.
- Cijfers en labels worden pas getoond als data beschikbaar is, nooit conditioneel zonder placeholder.
- Iconen en labels zijn altijd zichtbaar, cijfers zijn '--' tot data geladen is.
- Geen animaties, geen verspringende content.
*/
