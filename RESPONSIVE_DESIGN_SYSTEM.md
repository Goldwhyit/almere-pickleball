# 📱 Almere Pickleball - Responsive Design System

## 1. Breakpoint Architecture

### Tailwind Breakpoints (Mobile-First)
```scss
320px  - sm   // Mobile Small (iPhone SE)
576px  - md   // Mobile Landscape
768px  - lg   // Tablet Portrait
1024px - xl   // Tablet Landscape / Small Laptop
1280px - 2xl  // Desktop
1536px - 3xl  // Large Desktop
```

**Implementation**: Via `tailwind.config.js` extend screens

**Usage Pattern**:
```tsx
// Mobile first - default styles
<div className="p-4 grid grid-cols-1">

// Expand at tablet
className="md:grid-cols-2 md:p-6"

// Expand at desktop  
className="lg:grid-cols-3 lg:p-8 xl:grid-cols-4"
```

---

## 2. Container System

### Responsive Containers
```
Mobile (320-575px):   max-w-sm,   px-4
Tablet (576-767px):   max-w-md,   px-6
Tablet (768-1023px):  max-w-lg,   px-6
Desktop (1024-1279px): max-w-2xl,  px-8
Desktop (1280-1535px): max-w-4xl,  px-8
Large (1536px+):      max-w-6xl,  px-8
```

**Base Container Utility**:
```tsx
className="mx-auto w-full px-4 sm:px-6 md:px-6 lg:px-8 xl:px-8 
           max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl"
```

---

## 3. Grid System

### Automated Column Collapse
```tsx
// Admin dashboard tiles
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {/* Tiles automatically respond */}
</div>

// Cards in listings
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {/* Cards grow with screen */}
</div>
```

### Flexible Spanning
```tsx
// 2-column on tablet, 1 on mobile, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Content</div>
  <div className="md:col-span-2 lg:col-span-1">Span wider on tablet</div>
</div>
```

---

## 4. Spacing Scale

### Consistent Padding/Margin
| Breakpoint | Padding | Gap | Applied To |
|----------|---------|-----|-----------|
| Mobile (320px) | 4 (1rem) | 4 | All containers |
| Mobile Landscape (576px) | 4 (1rem) | 4 | Same |
| Tablet (768px) | 6 (1.5rem) | 6 | Increase |
| Desktop (1024px) | 8 (2rem) | 6-8 | Full desktop |
| Large (1536px) | 10 (2.5rem) | 8 | Breathing room |

**Pattern**:
```tsx
<div className="p-4 sm:p-4 md:p-6 lg:p-8 xl:p-10">
  <div className="gap-4 md:gap-6 lg:gap-8">
```

---

## 5. Typography Scaling

### Responsive Font Sizes (NO fixed px on mobile)
```tsx
// Heading 1
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">

// Heading 2
<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">

// Body text (min 16px on mobile to prevent iOS zoom)
<p className="text-base md:text-lg lg:text-xl leading-relaxed">

// Small text
<small className="text-xs sm:text-sm md:text-base">
```

**Rule**: Never use fixed `text-xs` on mobile for body content - minimum `text-base` (16px)

---

## 6. Navigation

### Desktop Navigation (1024px+)
```
Logo | Link | Link | Link | Button
```

### Mobile Navigation (<1024px)
```
Logo | Hamburger Icon
     [Hidden Menu - slides from left]
```

### Hamburger Menu Behavior
- ✅ Only visible on screens < 1024px
- ✅ Toggles on click
- ✅ Closes on link click
- ✅ Closes on ESC key
- ✅ Prevents body scroll when open
- ✅ Has overlay backdrop

**Code Pattern**:
```tsx
// Desktop menu - show from xl upward
<nav className="hidden xl:flex gap-8">

// Mobile menu button
<button className="xl:hidden" onClick={toggleMenu}>
  <MenuIcon />
</button>

// Mobile menu - overlay from side
{isOpen && (
  <div className="fixed inset-0 z-40 xl:hidden">
    {/* Mobile menu content */}
  </div>
)}
```

---

## 7. Buttons & Touch Targets

### Minimum Size: 44x44px
```tsx
// Standard button
<button className="px-4 md:px-6 py-2 md:py-3 rounded-lg 
                   min-h-[44px] min-w-[44px] flex items-center justify-center">
  Action
</button>

// Icon button (square 44x44)
<button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
  <Icon />
</button>
```

### Button Layout
```tsx
// Mobile: Stack vertically
<div className="flex flex-col gap-3 md:flex-row">
  <button className="w-full md:w-auto">Primary</button>
  <button className="w-full md:w-auto">Secondary</button>
</div>
```

---

## 8. Tables to Cards on Mobile

### Pattern for <768px
```tsx
{/* Desktop table */}
<table className="hidden md:table w-full">
  <thead>...</thead>
  <tbody>...</tbody>
</table>

{/* Mobile card layout */}
<div className="md:hidden space-y-4">
  {data.map(item => (
    <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <label className="font-bold text-sm text-gray-600">Name</label>
        <span>{item.name}</span>
      </div>
      <div className="flex justify-between items-start mb-3">
        <label className="font-bold text-sm text-gray-600">Email</label>
        <span>{item.email}</span>
      </div>
      {/* Action buttons */}
    </div>
  ))}
</div>
```

---

## 9. Forms

### Mobile-First Form Layout
```tsx
<form className="space-y-4 md:space-y-6">
  {/* Single column on mobile */}
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-2">Field Label</label>
    <input 
      type="text"
      className="w-full px-3 py-2 md:py-3 rounded border focus:outline-none focus:ring-2"
      placeholder="Min 16px text"
    />
  </div>

  {/* Two columns from tablet */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <div>
      <label className="text-sm font-medium mb-2">First</label>
      <input type="text" className="w-full..."/>
    </div>
    <div>
      <label className="text-sm font-medium mb-2">Second</label>
      <input type="text" className="w-full..."/>
    </div>
  </div>

  <button type="submit" className="w-full md:w-auto...">Submit</button>
</form>
```

### Input Rules
- Minimum font-size: **16px** (prevents iOS auto-zoom on focus)
- Generous padding: `py-2 md:py-3`
- Full width on mobile: `w-full`
- Focus ring clearly visible: `focus:ring-2 focus:ring-primary-500`

---

## 10. Admin Dashboard Tiles

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
  {dashboardItems.map(item => (
    <button
      onClick={item.action}
      className="p-4 md:p-6 bg-white rounded-lg shadow-sm hover:shadow-md 
                 transition-shadow cursor-pointer group"
    >
      <div className="text-2xl md:text-3xl mb-2">{item.icon}</div>
      <h3 className="text-base md:text-lg font-semibold text-gray-900">{item.label}</h3>
      <p className="text-xs md:text-sm text-gray-600 mt-1">{item.count}</p>
    </button>
  ))}
</div>
```

### Hover Effects - Desktop Only
```tsx
className="group hover:shadow-lg md:hover:shadow-md lg:hover:-translate-y-1 
          md:hover:bg-gray-50 transition-all duration-200"
```

---

## 11. Images & Media

### Responsive Images
```tsx
<img 
  src={image}
  alt="Description"
  className="w-full h-auto object-cover rounded-lg"
  loading="lazy"
/>

{/* With aspect ratio */}
<div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
  <img src={image} alt="" className="w-full h-full object-cover" />
</div>
```

---

## 12. iOS & Android Specific Fixes

### 100vh Issues (iOS Safari)
```css
/* In index.css */
@supports (height: 100dvh) {
  .full-height {
    height: 100dvh; /* Use dynamic viewport height on iOS 15+ */
  }
}

@supports not (height: 100dvh) {
  .full-height {
    height: 100vh; /* Fallback */
  }
}
```

### Prevent Input Auto-Zoom on iOS
```tsx
<input type="text" className="text-base..." /> {/* Must be ≥16px */}
```

### Smooth Scrolling
```tsx
<html className="scroll-smooth">
```

### Sticky Navbar on Safari
```tsx
<nav className="sticky top-0 z-50 w-full...">
```

---

## 13. Performance & Accessibility

### Lazy Loading Images
```tsx
<img src={url} alt="Description" loading="lazy" />
```

### Reduced Motion Respect
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Dark Mode Support (Optional)
```tsx
<html className="dark">
  <body className="dark:bg-gray-900 dark:text-white">
```

---

## 14. Testing Checklist

### Device Dimensions
- ✅ iPhone SE (375px)
- ✅ iPhone Pro (390px  
- ✅ iPhone Pro Max (430px)
- ✅ Galaxy S21 (360px)
- ✅ iPad (768px)
- ✅ iPad Pro (1024px)
- ✅ Desktop 1280px
- ✅ Desktop 1440px
- ✅ Desktop 1920px
- ✅ Large Monitor 2560px

### Per-Screen Tests
| Test | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| No horizontal scroll | ✅ | ✅ | ✅ |
| Hamburger menu works | ✅ | ✅ | ❌ Hidden |
| Touch targets ≥44px | ✅ | ✅ | ✅ |
| Grid responsive | ✅ | ✅ | ✅ |
| Tables readable | Card | Card | Table |
| Font readable | ✅ | ✅ | ✅ |
| Forms usable | ✅ | ✅ | ✅ |
| Buttons accessible | ✅ | ✅ | ✅ |
| Images scale | ✅ | ✅ | ✅ |

---

## 15. Common Patterns - Copy & Paste Ready

### Hero Section
```tsx
<section className="w-full py-12 md:py-16 lg:py-20 bg-gradient">
  <div className="mx-auto px-4 sm:px-6 md:px-6 lg:px-8 max-w-4xl">
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
      Responsive Heading
    </h1>
    <p className="text-base md:text-lg lg:text-xl mt-4 text-gray-600">
      Subheading
    </p>
  </div>
</section>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {items.map(item => (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Admin Panel Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {/* Admin tiles */}
</div>
```

### Responsive Form
```tsx
<form className="space-y-4 md:space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <input type="text" placeholder="Field 1" />
    <input type="text" placeholder="Field 2" />
  </div>
  <button type="submit" className="w-full md:w-auto">Submit</button>
</form>
```

---

## 16. Tailwind Config Updates Required

See `tailwind.config.js` for extended screens and spacing scale.

---

## 17. CSS Custom Properties (Optional)

For advanced control, add to `index.css`:

```css
:root {
  /* Breakpoint pixels (for reference only) */
  --breakpoint-sm: 320px;
  --breakpoint-md: 576px;
  --breakpoint-lg: 768px;
  --breakpoint-xl: 1024px;
  --breakpoint-2xl: 1280px;
  --breakpoint-3xl: 1536px;

  /* Container max-widths */
  --container-sm: 20rem;
  --container-md: 28rem;
  --container-lg: 32rem;
  --container-xl: 36rem;
  --container-2xl: 42rem;
  --container-3xl: 48rem;
  --container-4xl: 56rem;
  --container-5xl: 64rem;
  --container-6xl: 72rem;

  /* Spacing scale */
  --spacing-mobile: 1rem;    /* 16px */
  --spacing-tablet: 1.5rem;  /* 24px */
  --spacing-desktop: 2rem;   /* 32px */
}
```

---

## ⚠️ DO's and DON'Ts

### ✅ DO
- Start with mobile, expand up
- Use Tailwind classes consistently
- Test on real devices
- Use `md:`, `lg:`, `xl:` prefixes
- Make containers responsive
- Respect minimum touch targets (44px)
- Use `w-full` on mobile
- Use `gap-*` for child spacing

### ❌ DON'T
- Use fixed widths (e.g., `w-[400px]`)
- Hardcode breakpoints in CSS
- Use `!important` overrides
- Nest media queries deeply
- Assume all tablets are 768px
- Use `max-w-none` on containers
- Forget `alt` text on images
- Ignore iOS zoom prevention (16px min font)

---

## 📋 Implementation Roadmap

1. ✅ Update `tailwind.config.js` with breakpoints
2. ✅ Create responsive utilities in `index.css`
3. ✅ Build Navigation component with hamburger
4. ✅ Update page layouts to mobile-first
5. ✅ Convert tables to cards on mobile
6. ✅ Make forms responsive
7. ✅ Update admin dashboard grid
8. ✅ Test on all breakpoints
9. ✅ Document in live storybook (optional)
10. ✅ Deploy and monitor

---

Generated: 2026-02-09
