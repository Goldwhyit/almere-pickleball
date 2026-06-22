import React from 'react';
import { AdminDashboardGrid, DashboardTile, ResponsiveContainer } from './ResponsiveComponents';

/**
 * AdminDashboard Template Component
 * 
 * Responsive admin dashboard with tiles
 * Mobile: 1 column
 * Tablet: 2 columns
 * Desktop: 3 columns
 * Large Desktop: 4 columns
 */

export interface AdminDashboardItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface AdminDashboardTemplateProps {
  title: string;
  description?: string;
  items: AdminDashboardItem[];
  className?: string;
}

export const AdminDashboardTemplate: React.FC<AdminDashboardTemplateProps> = ({
  title,
  description,
  items,
  className = '',
}) => {
  return (
    <ResponsiveContainer className={className}>
      {/* Header */}
      <div className="mb-8 md:mb-10 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-base md:text-lg text-gray-600">
            {description}
          </p>
        )}
      </div>

      {/* Dashboard Grid */}
      <AdminDashboardGrid>
        {items.map((item) => (
          <DashboardTile
            key={item.id}
            icon={item.icon}
            label={item.label}
            value={item.value}
            description={item.description}
            onClick={item.onClick}
            variant={item.variant}
          />
        ))}
      </AdminDashboardGrid>
    </ResponsiveContainer>
  );
};

export default AdminDashboardTemplate;
