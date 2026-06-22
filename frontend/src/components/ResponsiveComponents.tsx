import React from 'react';

/**
 * ResponsiveContainer Component
 * 
 * Provides consistent responsive padding and max-width
 * Mobile First: grows with screen size
 * 
 * Usage:
 * <ResponsiveContainer>
 *   <h1>Title</h1>
 *   <p>Content</p>
 * </ResponsiveContainer>
 */

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'narrow' | 'normal' | 'wide' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'normal',
}) => {
  const sizeClasses = {
    narrow: 'max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl',
    normal: 'max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-6xl',
    wide: 'max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto w-full px-4 sm:px-4 md:px-6 lg:px-8 xl:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * ResponsiveGrid Component
 * 
 * Mobile: 1 column
 * Tablet: 2 columns
 * Desktop: 3 columns
 * Large Desktop: 4 columns (optional)
 */

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: '1-2-3' | '1-2-4' | 'auto';
  gap?: 'compact' | 'normal' | 'spacious';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = '1-2-3',
  gap = 'normal',
  className = '',
}) => {
  const columnClasses = {
    '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1-2-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    compact: 'gap-2 md:gap-3 lg:gap-4',
    normal: 'gap-4 md:gap-6 lg:gap-8',
    spacious: 'gap-6 md:gap-8 lg:gap-10',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * AdminDashboardGrid Component
 * 
 * Specifically for admin dashboard tiles
 * Mobile: 1 column
 * Tablet: 2 columns
 * Desktop: 3 columns
 * Large Desktop: 4 columns
 */

interface AdminDashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminDashboardGrid: React.FC<AdminDashboardGridProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`grid-dashboard ${className}`}>
      {children}
    </div>
  );
};

/**
 * DashboardTile Component
 * 
 * Individual tile for admin dashboard
 * Includes proper touch targets and hover effects (desktop only)
 */

interface DashboardTileProps {
  icon?: string | React.ReactNode;
  label: string;
  value?: string | number;
  description?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const DashboardTile: React.FC<DashboardTileProps> = ({
  icon,
  label,
  value,
  description,
  onClick,
  className = '',
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'hover:shadow-md md:hover:bg-gray-50 md:hover:-translate-y-1',
    success: 'border-l-4 border-green-500 hover:shadow-md md:hover:bg-green-50',
    warning: 'border-l-4 border-yellow-500 hover:shadow-md md:hover:bg-yellow-50',
    danger: 'border-l-4 border-red-500 hover:shadow-md md:hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 md:p-6 bg-white rounded-lg shadow-sm 
                  transition-all duration-200 cursor-pointer group
                  ${variantClasses[variant]} ${className}
                  min-h-[120px] flex flex-col justify-between
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
    >
      {icon && (
        <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="text-left">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
          {label}
        </h3>
        {value && (
          <p className="text-lg md:text-2xl font-bold text-primary-600 mb-1">
            {value}
          </p>
        )}
        {description && (
          <p className="text-xs md:text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

/**
 * ResponsiveTable Component
 * 
 * Shows as table on tablet+, card layout on mobile
 * Data: Array of objects
 * Columns: Array of column definitions
 */

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface ResponsiveTableProps {
  data: Record<string, any>[];
  columns: TableColumn[];
  keyField?: string;
  actions?: (row: Record<string, any>) => React.ReactNode;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  keyField = 'id',
  actions,
}) => {
  const getAlign = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <>
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 md:px-6 md:py-4 font-semibold text-sm text-gray-700 ${getAlign(
                    col.align
                  )}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 md:px-6 md:py-4 font-semibold text-sm text-gray-700">Acties</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 md:px-6 md:py-4 text-sm text-gray-900 ${getAlign(col.align)}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 md:px-6 md:py-4 text-sm">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - Hidden on tablet+ */}
      <div className="md:hidden space-y-4">
        {data.map((row, idx) => (
          <div
            key={row[keyField] || idx}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-start">
                <label className="font-bold text-xs text-gray-600">{col.label}</label>
                <div className="text-right text-sm text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </div>
              </div>
            ))}
            {actions && (
              <div className="border-t border-gray-200 pt-3 flex gap-2">
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Geen gegevens beschikbaar</p>
        </div>
      )}
    </>
  );
};

/**
 * ResponsiveFlex Component
 * 
 * Flexbox that stacks on mobile, flows on desktop
 */

interface ResponsiveFlexProps {
  children: React.ReactNode;
  gap?: 'compact' | 'normal' | 'spacious';
  responsive?: {
    mobile: 'row' | 'col';
    tablet?: 'row' | 'col';
    desktop?: 'row' | 'col';
  };
  className?: string;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  gap = 'normal',
  responsive = { mobile: 'col' },
  className = '',
}) => {
  const gapClasses = {
    compact: 'gap-2 md:gap-3 lg:gap-4',
    normal: 'gap-4 md:gap-6 lg:gap-8',
    spacious: 'gap-6 md:gap-8 lg:gap-10',
  };

  const mobileDir = responsive.mobile === 'col' ? 'flex-col' : 'flex-row';
  const tabletDir = responsive.tablet === 'row' ? 'md:flex-row' : 'md:flex-col';
  const desktopDir = responsive.desktop === 'row' ? 'lg:flex-row' : 'lg:flex-col';

  return (
    <div className={`flex ${mobileDir} ${tabletDir} ${desktopDir} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * ResponsiveSection Component
 * 
 * Section wrapper with responsive padding
 */

interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  className = '',
}) => {
  return (
    <section className={`py-6 md:py-8 lg:py-12 ${className}`}>
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    </section>
  );
};
