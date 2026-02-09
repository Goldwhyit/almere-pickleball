import React from "react";

/**
 * ResponsiveContainer
 * Auto-responsive padding and max-widths per breakpoint
 * Sizes: 'narrow' (max-w-2xl), 'normal' (max-w-4xl), 'wide' (max-w-7xl)
 */
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  size?: "narrow" | "normal" | "wide";
  className?: string;
}> = ({ children, size = "normal", className = "" }) => {
  const sizeMap = {
    narrow: "max-w-2xl",
    normal: "max-w-4xl",
    wide: "max-w-7xl",
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeMap[size]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveGrid
 * Auto-responsive grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
 */
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  gap?: "small" | "normal" | "large";
  className?: string;
}> = ({ children, gap = "normal", className = "" }) => {
  const gapMap = {
    small: "gap-2 md:gap-3 lg:gap-4",
    normal: "gap-4 md:gap-6 lg:gap-8",
    large: "gap-6 md:gap-8 lg:gap-12",
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapMap[gap]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * AdminDashboardGrid
 * Responsive admin dashboard: 1 → 2 → 3 → 4 columns
 */
export const AdminDashboardGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * DashboardTile
 * Interactive button-like tile for dashboard items
 */
export const DashboardTile: React.FC<{
  icon?: React.ReactNode;
  title: string;
  value?: string | number;
  color?: "blue" | "green" | "red" | "purple" | "yellow";
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ icon, title, value, color = "blue", onClick, children }) => {
  const colorMap = {
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    green: "bg-green-50 hover:bg-green-100 border-green-200",
    red: "bg-red-50 hover:bg-red-100 border-red-200",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    yellow: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 md:p-6 rounded-lg border transition-all duration-200 text-left min-h-[120px] md:min-h-[140px] ${colorMap[color]}`}
    >
      {icon && <div className="text-2xl md:text-3xl mb-2">{icon}</div>}
      <h3 className="font-semibold text-gray-700 text-sm md:text-base">
        {title}
      </h3>
      {value && (
        <p className="text-lg md:text-2xl font-bold text-gray-900 mt-2">
          {value}
        </p>
      )}
      {children}
    </button>
  );
};

/**
 * ResponsiveTable
 * Desktop: displays as table
 * Mobile: displays as stacked cards
 */
export const ResponsiveTable: React.FC<{
  headers: string[];
  rows: (string | number)[][];
  className?: string;
}> = ({ headers, rows, className = "" }) => {
  return (
    <>
      {/* Desktop Table */}
      <div className={`hidden lg:block overflow-x-auto ${className}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            {row.map((cell, cellIdx) => (
              <div key={cellIdx} className="flex justify-between py-2 text-sm">
                <span className="font-semibold text-gray-700">
                  {headers[cellIdx]}
                </span>
                <span className="text-gray-900">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * ResponsiveFlex
 * Flex that stacks on mobile, flows on desktop
 */
export const ResponsiveFlex: React.FC<{
  children: React.ReactNode;
  gap?: "small" | "normal" | "large";
  align?: "start" | "center" | "end";
  className?: string;
}> = ({ children, gap = "normal", align = "center", className = "" }) => {
  const gapMap = {
    small: "gap-2 md:gap-3 lg:gap-4",
    normal: "gap-4 md:gap-6 lg:gap-8",
    large: "gap-6 md:gap-8 lg:gap-12",
  };

  const alignMap = {
    start: "items-start md:items-start",
    center: "items-center md:items-center",
    end: "items-end md:items-end",
  };

  return (
    <div
      className={`flex flex-col md:flex-row ${gapMap[gap]} ${alignMap[align]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveSection
 * Section wrapper with responsive padding
 */
export const ResponsiveSection: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className = "" }) => {
  return (
    <section
      className={`py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8 ${className}`}
    >
      {title && (
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8 lg:mb-10">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};
