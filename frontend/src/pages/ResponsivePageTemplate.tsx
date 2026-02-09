import React from "react";
import {
    AdminDashboardGrid,
    DashboardTile,
    ResponsiveContainer,
    ResponsiveGrid,
    ResponsiveSection,
    ResponsiveTable,
} from "../components/ResponsiveComponents";
import { useResponsive } from "../hooks/useResponsive";

/**
 * ResponsivePageTemplate
 *
 * Complete example showing all responsive patterns:
 * - Hero section
 * - Responsive grid layouts
 * - Typography scaling
 * - Forms with responsive grid
 * - Responsive table
 * - Admin dashboard tiles
 *
 * Copy and modify this for creating new responsive pages!
 */
export const ResponsivePageTemplate: React.FC = () => {
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <ResponsiveSection className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <ResponsiveContainer>
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Welcome to Responsive Design
            </h1>
            <p className="text-base md:text-lg lg:text-xl max-w-2xl text-blue-100">
              This page demonstrates all responsive patterns. Current
              breakpoint: <strong>{width}px</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition min-h-[44px]">
                Get Started
              </button>
              <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition min-h-[44px]">
                Learn More
              </button>
            </div>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Responsive Grid Example */}
      <ResponsiveSection title="Featured Cards">
        <ResponsiveContainer>
          <ResponsiveGrid>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{"📊"}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Feature {i}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Responsive layout automatically adjusts from 1 column on
                  mobile to 3 columns on desktop.
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Typography Scale Example */}
      <ResponsiveSection title="Typography Scaling" className="bg-white">
        <ResponsiveContainer>
          <div className="space-y-8">
            <div>
              <h2 className="text-sm md:text-base lg:text-lg font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Heading Sizes
              </h2>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                H1: 3xl → 5xl
              </h1>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                H2: 2xl → 4xl
              </h2>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800">
                H3: xl → 3xl
              </h3>
            </div>

            <div>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
                Body text scales from base to lg. Perfect for maintaining
                readability at all screen sizes.
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm lg:text-base text-gray-600">
                Small text: xs → base
              </p>
            </div>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Form Example */}
      <ResponsiveSection title="Responsive Form">
        <ResponsiveContainer size="narrow">
          <form className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-md">
            {/* Single column form */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
              />
            </div>

            {/* Two column layout on tablet/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+31 6 12345678"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Almere"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
                />
              </div>
            </div>

            {/* Message field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Your message here..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            {/* Button full width on mobile, auto on desktop */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition min-h-[44px]"
              >
                Submit
              </button>
              <button
                type="reset"
                className="flex-1 sm:flex-none px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition min-h-[44px]"
              >
                Reset
              </button>
            </div>
          </form>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Responsive Table Example */}
      <ResponsiveSection title="Responsive Table">
        <ResponsiveContainer>
          <ResponsiveTable
            headers={["Name", "Email", "Status", "Date"]}
            rows={[
              ["John Doe", "john@example.com", "Active", "2024-01-15"],
              ["Jane Smith", "jane@example.com", "Pending", "2024-01-16"],
              ["Bob Johnson", "bob@example.com", "Active", "2024-01-17"],
            ]}
          />
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Admin Dashboard Grid Example */}
      <ResponsiveSection title="Admin Dashboard">
        <ResponsiveContainer size="wide">
          <AdminDashboardGrid>
            <DashboardTile
              title="Total Users"
              value="1,234"
              color="blue"
              icon="👥"
            />
            <DashboardTile
              title="Revenue"
              value="€12,345"
              color="green"
              icon="💰"
            />
            <DashboardTile
              title="Tournaments"
              value="24"
              color="purple"
              icon="🏓"
            />
            <DashboardTile title="Pending" value="8" color="yellow" icon="⏳" />
          </AdminDashboardGrid>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Conditional Display Example */}
      <ResponsiveSection title="Device Detection" className="bg-blue-50">
        <ResponsiveContainer>
          <div className="space-y-4">
            {isMobile && (
              <div className="p-4 bg-blue-200 text-blue-900 rounded-lg">
                📱 You're on Mobile ({width}px)
              </div>
            )}
            {isTablet && (
              <div className="p-4 bg-purple-200 text-purple-900 rounded-lg">
                📱 You're on Tablet ({width}px)
              </div>
            )}
            {isDesktop && (
              <div className="p-4 bg-green-200 text-green-900 rounded-lg">
                💻 You're on Desktop ({width}px)
              </div>
            )}
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* CTA Section */}
      <ResponsiveSection className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <ResponsiveContainer>
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Ready to Build Responsive?
            </h2>
            <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto">
              Use this template and the responsive components to build your
              pages. Everything adapts perfectly!
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition min-h-[44px] text-base md:text-lg">
              Get Started Now
            </button>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>
    </div>
  );
};
