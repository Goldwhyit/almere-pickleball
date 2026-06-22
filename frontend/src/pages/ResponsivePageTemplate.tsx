import React from 'react';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveSection,
  ResponsiveFlex,
} from '../components/ResponsiveComponents';

/**
 * ResponsivePageTemplate
 * 
 * Complete example showing all responsive patterns
 * Use this as a template for creating new responsive pages
 * 
 * Features:
 * ✅ Mobile-first layout
 * ✅ Responsive typography
 * ✅ Responsive grids
 * ✅ Touch-friendly buttons
 * ✅ Proper spacing at all breakpoints
 */

export default function ResponsivePageTemplate() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary-500 to-primary-600 py-12 md:py-16 lg:py-20">
        <ResponsiveContainer>
          <div className="text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Responsive Page Template
            </h1>
            <p className="text-base md:text-lg lg:text-xl max-w-2xl">
              This page demonstrates all responsive design patterns used in Almere Pickleball.
              Resize your browser to see the responsive behavior.
            </p>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Main Content */}
      <ResponsiveSection>
        {/* Responsive Grid Example */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">
            Responsive Card Grid
          </h2>
          <p className="text-gray-600 mb-6 md:mb-8">
            This grid shows 1 column on mobile, 2 on tablet, and 3 on desktop:
          </p>
          <ResponsiveGrid columns="1-2-3" gap="normal">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 
                          hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Feature {item}</h3>
                <p className="text-sm text-gray-600">
                  This card automatically adjusts its width based on screen size.
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Typography Examples */}
        <div className="mb-12 md:mb-16 py-8 md:py-10 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            Responsive Typography
          </h2>
          <div className="space-y-4 md:space-y-6">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-2">Heading 1</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                Adaptive Heading (24px → 60px)
              </h1>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-2">Heading 2</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                Heading 2 (20px → 36px)
              </h2>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-2">Body Text (min 16px)</p>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl">
                Body text is always readable with a minimum of 16px on mobile to prevent iOS auto-zoom.
                Line height is generous (1.5+ ) for comfort reading on all devices.
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Form Example */}
        <div className="mb-12 md:mb-16 py-8 md:py-10 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            Responsive Form
          </h2>
          <p className="text-gray-600 mb-6">
            Form fields stack vertically on mobile, but resize to 2 columns on tablet and desktop:
          </p>
          <form className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg
                            text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg
                            text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg
                          text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Your message here..."
                className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg
                          text-base focus:outline-none focus:ring-2 focus:ring-primary-500
                          resize-none"
              />
            </div>

            {/* Responsive Button Layout */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-primary px-6 py-3 flex-1 sm:flex-none">
                Submit
              </button>
              <button type="button" className="btn-secondary px-6 py-3 flex-1 sm:flex-none">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Button Examples */}
        <div className="mb-12 md:mb-16 py-8 md:py-10 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            Button Examples (44px minimum)
          </h2>
          <div className="space-y-4">
            {/* Primary Button */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Primary Button (full width on mobile)</p>
              <button className="w-full sm:w-auto btn-primary px-6 py-3">
                Primary Action
              </button>
            </div>

            {/* Secondary Button */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Secondary Button</p>
              <button className="w-full sm:w-auto btn-secondary px-6 py-3">
                Secondary Action
              </button>
            </div>

            {/* Multiple Buttons */}
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Multiple buttons (stack on mobile, side-by-side on tablet+)
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-primary px-6 py-3">Button 1</button>
                <button className="btn-secondary px-6 py-3">Button 2</button>
                <button className="btn-secondary px-6 py-3">Button 3</button>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Flex Example */}
        <div className="mb-12 md:mb-16 py-8 md:py-10 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            Responsive Flex Layout
          </h2>
          <p className="text-gray-600 mb-6">
            Stacks vertically on mobile, horizontally on desktop:
          </p>
          <ResponsiveFlex gap="spacious">
            <div className="flex-1 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-2">Column 1</h3>
              <p className="text-sm text-gray-600">
                This content is flexible and adapts to available space.
              </p>
            </div>
            <div className="flex-1 bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-2">Column 2</h3>
              <p className="text-sm text-gray-600">
                On mobile, this stacks below. On desktop, it's side by side.
              </p>
            </div>
            <div className="flex-1 bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-2">Column 3</h3>
              <p className="text-sm text-gray-600">
                All columns maintain equal width on larger screens.
              </p>
            </div>
          </ResponsiveFlex>
        </div>

        {/* Hidden/Visible Example */}
        <div className="py-8 md:py-10 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            Conditional Display
          </h2>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Only on mobile (hidden from md: 768px)</p>
            <div className="md:hidden bg-blue-100 border border-blue-300 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                ✓ This content is only visible on mobile screens
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Only on tablet+ (hidden on mobile)</p>
            <div className="hidden md:block bg-green-100 border border-green-300 p-4 rounded-lg">
              <p className="text-sm text-green-900">
                ✓ This content is only visible on tablet and desktop screens
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">Only on desktop (hidden from lg: 1024px)</p>
            <div className="hidden lg:block bg-purple-100 border border-purple-300 p-4 rounded-lg">
              <p className="text-sm text-purple-900">
                ✓ This content is only visible on desktop screens (1024px+)
              </p>
            </div>
          </div>
        </div>
      </ResponsiveSection>

      {/* CTA Section */}
      <section className="w-full bg-gray-50 py-12 md:py-16 lg:py-20 border-t border-gray-200">
        <ResponsiveContainer>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Build?
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Use the ResponsiveContainer, ResponsiveGrid, and other components to build responsive pages.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn-primary px-8 py-3">Get Started</button>
              <button className="btn-secondary px-8 py-3">Learn More</button>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Reference Section */}
      <ResponsiveSection className="bg-gray-50">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Quick Reference</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakpoints */}
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3">Breakpoints</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">default</code>: 320px
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">sm:</code>
                  {' '} 576px
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">md:</code>
                  {' '} 768px
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">lg:</code>
                  {' '} 1024px
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">xl:</code>
                  {' '} 1280px
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">2xl:</code>
                  {' '} 1536px
                </li>
              </ul>
            </div>

            {/* Touch Targets */}
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3">Touch Targets</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Minimum 44px × 44px</li>
                <li>✓ Enough gap (≥12px) between targets</li>
                <li>✓ Use <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">btn-primary</code> class</li>
                <li>✓ Use <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">btn-secondary</code> class</li>
                <li>✓ No hover on mobile ({'{'}mobile CSS{'}'})</li>
                <li>✓ Hover on desktop only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Documentation</h3>
          <ul className="space-y-2 text-sm">
            <li>
              📖{' '}
              <a href="#" className="text-primary-600 hover:underline">
                RESPONSIVE_DESIGN_SYSTEM.md
              </a>
              {' '} - Complete design system
            </li>
            <li>
              🚀{' '}
              <a href="#" className="text-primary-600 hover:underline">
                RESPONSIVE_IMPLEMENTATION_GUIDE.md
              </a>
              {' '} - Implementation guide
            </li>
            <li>
              ✅{' '}
              <a href="#" className="text-primary-600 hover:underline">
                RESPONSIVE_TESTING_CHECKLIST.md
              </a>
              {' '} - Testing checklist
            </li>
          </ul>
        </div>
      </ResponsiveSection>
    </>
  );
}
