# 🚀 Responsive Design Implementation Guide

**Project**: Almere Pickleball  
**Last Updated**: 2026-02-09

---

## Quick Start

### 1. Import Responsive Components
```tsx
import {
  ResponsiveContainer,
  ResponsiveGrid,
  AdminDashboardGrid,
  DashboardTile,
  ResponsiveTable,
  ResponsiveFlex,
  ResponsiveSection,
} from '@/components/ResponsiveComponents';
```

### 2. Import Responsive Hooks
```tsx
import {
  useResponsive,
  useMediaQuery,
  useMobileMenu,
  useReducedMotion,
  useOrientation,
} from '@/hooks/useResponsive';
```

### 3. Import Navigation
```tsx
import ResponsiveNavigation from '@/components/ResponsiveNavigation';
```

### 4. Add to App Root
```tsx
// App.tsx
import ResponsiveNavigation from './components/ResponsiveNavigation';

export default function App() {
  return (
    <>
      <ResponsiveNavigation />
      <main>
        {/* Your routes here */}
      </main>
    </>
  );
}
```

---

## Component Patterns

### Page Layout Pattern
```tsx
import { ResponsiveContainer, ResponsiveSection } from '@/components/ResponsiveComponents';

export default function MyPage() {
  return (
    <>
      {/* Hero Section */}
      <ResponsiveSection className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div>
          <h1>Main Heading</h1>
          <p>Subheading</p>
        </div>
      </ResponsiveSection>

      {/* Content Section */}
      <ResponsiveSection>
        <h2>Content Title</h2>
        <p>Content goes here</p>
      </ResponsiveSection>
    </>
  );
}
```

### Card Grid Pattern
```tsx
import { ResponsiveGrid } from '@/components/ResponsiveComponents';

export default function CardsList({ items }) {
  return (
    <ResponsiveGrid columns="1-2-3" gap="normal">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600">{item.description}</p>
        </div>
      ))}
    </ResponsiveGrid>
  );
}
```

### Admin Dashboard Pattern
```tsx
import { AdminDashboardGrid, DashboardTile } from '@/components/ResponsiveComponents';

export default function AdminDashboard() {
  const items = [
    {
      id: 'users',
      icon: '👥',
      label: 'Total Users',
      value: '1,234',
      description: 'Active members',
      onClick: () => navigate('/admin/users'),
    },
    // ... more tiles
  ];

  return (
    <AdminDashboardGrid>
      {items.map(item => (
        <DashboardTile
          key={item.id}
          icon={item.icon}
          label={item.label}
          value={item.value}
          description={item.description}
          onClick={item.onClick}
        />
      ))}
    </AdminDashboardGrid>
  );
}
```

### Responsive Table Pattern
```tsx
import { ResponsiveTable } from '@/components/ResponsiveComponents';

export default function MembersTable({ members }) {
  return (
    <ResponsiveTable
      data={members}
      columns={[
        { key: 'fullName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { 
          key: 'joinDate', 
          label: 'Join Date',
          render: (value) => new Date(value).toLocaleDateString()
        },
        { key: 'status', label: 'Status' },
      ]}
      keyField="id"
      actions={(row) => (
        <div className="flex gap-2">
          <button className="btn-primary px-3 py-1 text-sm">Edit</button>
          <button className="btn-secondary px-3 py-1 text-sm">Delete</button>
        </div>
      )}
    />
  );
}
```

---

## Responsive Utilities (Tailwind Classes)

### Container Padding - Mobile First
```tsx
// Automatic responsive padding
<div className="container-responsive">
  {/* 16px mobile, 24px tablet, 32px desktop */}
</div>

// Narrow container
<div className="container-narrow">
  {/* Smaller max-width */}
</div>

// Wide container  
<div className="container-wide">
  {/* Larger max-width */}
</div>
```

### Grid Utilities
```tsx
// Standard responsive grid (1-2-3)
<div className="grid-responsive">
  {/* Children auto-grid */}
</div>

// Admin dashboard grid (1-2-3-4)
<div className="grid-dashboard">
  {/* Tiles grid */}
</div>

// Card grid
<div className="grid-cards">
  {/* Card items */}
</div>
```

### Button Utilities
```tsx
// Primary button
<button className="btn-primary">Action</button>

// Secondary button
<button className="btn-secondary">Cancel</button>

// Icon button
<button className="btn-icon">
  <Icon />
</button>
```

### Flex Utilities
```tsx
// Responsive flex (column mobile, row desktop)
<div className="flex-responsive">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Hook Patterns

### Responsive Breakpoint Detection
```tsx
import { useResponsive } from '@/hooks/useResponsive';

export default function MyComponent() {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### Custom Media Query
```tsx
import { useMediaQuery } from '@/hooks/useResponsive';

export default function MyComponent() {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      {/* Content */}
    </div>
  );
}
```

### Mobile Menu Hook
```tsx
import { useMobileMenu } from '@/hooks/useResponsive';

export default function MobileMenuButton() {
  const { isOpen, toggle, close } = useMobileMenu();

  return (
    <>
      <button onClick={toggle} aria-expanded={isOpen}>
        Menu
      </button>
      {isOpen && (
        <div onClick={close}>
          {/* Menu content */}
        </div>
      )}
    </>
  );
}
```

### Reduced Motion Preference
```tsx
import { useReducedMotion } from '@/hooks/useResponsive';

export default function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`
        transition-all duration-300
        ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
      `}
    >
      {/* Animated content */}
    </div>
  );
}
```

---

## Breakpoint Reference

Use these classes in Tailwind:

| Breakpoint | Width | Class Prefix |
|-----------|-------|--------------|
| Mobile Small | 320px | (default) |
| Mobile Large | 576px | `sm:` |
| Tablet Portrait | 768px | `md:` |
| Tablet Landscape | 1024px | `lg:` |
| Desktop | 1280px | `xl:` |
| Large Desktop | 1536px | `2xl:` |

### Example Responsive Class
```tsx
// Default mobile: 1 column, full width
// At md (768px): 2 columns
// At lg (1024px): 3 columns
// At xl (1280px): 4 columns

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Grid items */}
</div>
```

---

## Common Responsive Patterns

### Responsive Heading
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Main Heading
</h1>
```

### Responsive Padding
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

### Hidden on Mobile
```tsx
<div className="hidden md:block">
  {/* Only shows on tablet+ */}
</div>
```

### Hidden on Desktop
```tsx
<div className="md:hidden">
  {/* Only shows on mobile */}
</div>
```

### Stack Vertically on Mobile
```tsx
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <div className="flex-1">Item 1</div>
  <div className="flex-1">Item 2</div>
</div>
```

### Full Width on Mobile
```tsx
<button className="w-full md:w-auto">
  Action
</button>
```

---

## Accessibility Best Practices

### Semantic HTML
```tsx
// Good: Proper semantic tags
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>
<aside>...</aside>
<footer>...</footer>

// Bad: Everything is a div
<div>...</div>
<div>...</div>
```

### ARIA Labels
```tsx
// Hamburger button
<button
  aria-label="Menu"
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
>
  <MenuIcon />
</button>

// Icon with label
<button aria-label="Close">
  <CloseIcon />
</button>
```

### Form Accessibility
```tsx
<div className="mb-4">
  <label htmlFor="email" className="block mb-2 font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-3 py-2 border rounded"
    aria-required="true"
    aria-describedby="email-help"
  />
  <small id="email-help" className="text-gray-600">
    We'll never share your email
  </small>
</div>
```

### Keyboard Navigation
```tsx
<button
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  onClick={handleClick}
>
  Accessible Button
</button>
```

---

## Performance Tips

### Lazy Load Images
```tsx
<img
  src={url}
  alt="Description"
  loading="lazy"
  className="w-full h-auto object-cover"
/>
```

### Respect Prefers-Reduced-Motion
```tsx
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

return (
  <div
    className={`
      transition-all
      ${prefersReducedMotion ? '' : 'duration-300'}
    `}
  >
    {/* Content */}
  </div>
);
```

### CSS Optimization
```tsx
// Good: Tailwind utilities (compiled out unused)
<div className="p-4 md:p-6 lg:p-8">

// Avoid: Dynamic class generation
const className = `p-${padding} md:p-${tabletPadding}`;
```

---

## Migration Guide - Making Existing Pages Responsive

### Step 1: Update Page Layout
```tsx
// Before
export default function MyPage() {
  return (
    <div className="px-8">
      <div className="max-w-4xl mx-auto">
        {/* Content */}
      </div>
    </div>
  );
}

// After
import { ResponsiveContainer, ResponsiveSection } from '@/components/ResponsiveComponents';

export default function MyPage() {
  return (
    <ResponsiveSection>
      <ResponsiveContainer>
        {/* Content */}
      </ResponsiveContainer>
    </ResponsiveSection>
  );
}
```

### Step 2: Update Grid Layouts
```tsx
// Before
<div className="grid grid-cols-3 gap-8">

// After
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
```

### Step 3: Hide/Show Elements
```tsx
// Before - no mobile optimization
<nav className="flex gap-8">
  {/* All links always visible */}
</nav>

// After - hamburger on mobile
<>
  {/* Full nav on desktop */}
  <nav className="hidden lg:flex gap-8">
    {/* Links */}
  </nav>

  {/* Hamburger on mobile */}
  <button className="lg:hidden">Menu</button>
</>
```

### Step 4: Responsive Typography
```tsx
// Before
<h1 className="text-4xl">Heading</h1>

// After
<h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
```

### Step 5: Form Updates
```tsx
// Before
<div className="grid grid-cols-2 gap-4">
  <input />
  <input />
</div>

// After
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  <input />
  <input />
</div>
```

---

## Testing Your Responsive Design

### Chrome DevTools
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test different devices:
   - iPhone SE (375px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

### Real Device Testing
Use actual phones/tablets for accurate testing:
- Touch accuracy
- Performance
- iOS/Android quirks

### Responsive Testing Sites
- [Responsively App](https://responsively.app/)
- [BrowserStack](https://www.browserstack.com/)

---

## Deployment Checklist

Before deploying, verify:

- [ ] All pages responsive (320px - 2560px)
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 44px
- [ ] Font sizes readable
- [ ] Images responsive
- [ ] Navigation works on mobile
- [ ] Forms usable on mobile
- [ ] Admin tiles responsive
- [ ] Tables become cards on mobile
- [ ] Performance acceptable
- [ ] Accessibility checked
- [ ] Cross-browser tested

---

## Troubleshooting

### Issue: Horizontal scroll appears
**Solution**: 
1. Check max-width is set on containers
2. Verify no `w-[400px]` or fixed widths
3. Ensure images are responsive (`max-w-full`)

### Issue: Text too small on mobile
**Solution**:
1. Increase font size: `text-base md:text-lg`
2. Never use `text-xs` for body text
3. Minimum 16px for inputs

### Issue: Buttons too small/hard to tap
**Solution**:
1. Add `min-h-[44px] min-w-[44px]`
2. Increase padding: `px-6 py-3`
3. Use `.btn-primary` or `.btn-secondary`

### Issue: Hamburger menu buggy
**Solution**:
1. Ensure menu closes on ESC
2. Check body scroll prevention
3. Verify overlay click closes menu

---

## Resources

- **Tailwind Docs**: https://tailwindcss.com/docs/responsive-design
- **MDN Web Docs**: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries
- **Web.dev**: https://web.dev/responsive-web-design-basics/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Support

For questions or issues:
1. Check [RESPONSIVE_DESIGN_SYSTEM.md](./RESPONSIVE_DESIGN_SYSTEM.md)
2. Review example components
3. Run tests with RESPONSIVE_TESTING_CHECKLIST.md

