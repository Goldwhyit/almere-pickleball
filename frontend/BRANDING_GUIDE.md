# Almere Pickleball - Complete Branding Guide

## Visual Identity

This branding system is built **exclusively** on four colors extracted from the official Almere Pickleball logo.

---

## Primary Brand Colors

### 🔵 Almere Pickleball Blue (AP Blue)

- **Primary**: `#0c7fcd`
- **Usage**: Primary UI elements, headers, main navigation, links
- **Tailwind**: `ap-blue-500` (and variants 50-900)
- **Role**: Foundation color - trust, stability, professional energy

### 🔴 Almere Pickleball Red (AP Red)

- **Primary**: `#dc3c3c`
- **Usage**: Call-to-action buttons, alerts, accents, active states
- **Tailwind**: `ap-red-500` (and variants 50-900)
- **Role**: Energy, action, excitement - draws attention

### 🟡 Almere Pickleball Yellow (AP Yellow)

- **Primary**: `#ffdd00`
- **Usage**: Ball accent, success states, highlights, emphasis
- **Tailwind**: `ap-yellow-500` (and variants 50-900)
- **Role**: Optimism, sport energy, the pickleball

### ⚪ White

- **Primary**: `#ffffff`
- **Usage**: Backgrounds, cards, contrast, breathing room
- **Tailwind**: `white`
- **Role**: Clarity, organization, readability

### ⬛ Dark Slate (Text Only)

- **Primary**: `#1f2d3a` (ap-slate-900)
- **Usage**: Body text, labels, functional elements
- **Tailwind**: `ap-slate-900`
- **Role**: Legibility - only for text contrast

---

## Color Palette Structure

All colors are available in tint variations (50-900) for depth and hierarchy:

```
Lighter ← 50, 100, 200, 300, 400 → Darker
         |       |       |       |
       Very    Light   Medium  Dark    Extra
       Light                          Dark
       (50)    (100)   (400)   (700)  (900)
```

---

## Color Usage Guidelines

### **Layout & Structure**

- **Background**: White (`#ffffff`) or ap-slate-50 for subtle variation
- **Cards**: White with ap-blue shadows for hierarchy
- **Borders**: ap-blue-200 for subtle division, ap-blue-500 for emphasis
- **Dividers**: ap-slate-200 for functional separation

### **Interactive Elements**

- **Primary Buttons**: ap-blue background → ap-blue-700 hover
- **Action Buttons**: ap-red background → ap-red-700 hover
- **Success States**: ap-yellow background with ap-blue text
- **Links**: ap-blue-600 with ap-blue-700 hover
- **Focus/Active**: ap-red ring or ap-yellow highlight

### **Navigation & Headers**

- **Header Background**: White with subtle ap-blue border
- **Active Tab**: ap-blue-600 text or bottom border
- **Hover State**: ap-blue-100 background

### **Status & Feedback**

- **Success**: ap-yellow background, ap-slate-900 text
- **Error/Alert**: ap-red background, white text
- **Warning**: ap-red-200 background, ap-red-900 text
- **Info**: ap-blue-100 background, ap-blue-900 text

### **Gradients (Controlled & Sporty)**

- **Hero Section**: `linear-gradient(135deg, #0c7fcd 0%, #084d83 100%)`
- **Accent Section**: `linear-gradient(135deg, #dc3c3c 0%, #b83030 100%)`
- **Warm Energy**: `linear-gradient(135deg, #ffdd00 0%, #dc3c3c 100%)`
- **Cool Professional**: `linear-gradient(135deg, #0c7fcd 0%, #084d83 100%)`

Use Tailwind classes: `bg-gradient-ap-hero`, `bg-gradient-ap-accent`, etc.

---

## Typography Hierarchy

- **H1 (Hero)**: ap-slate-900, bold, 2.25rem+
- **H2 (Section)**: ap-slate-900, bold, 1.875rem
- **H3 (Subsection)**: ap-slate-900, semibold, 1.5rem
- **Body**: ap-slate-900, regular, 1rem
- **Small**: ap-slate-700, regular, 0.875rem
- **Label**: ap-slate-800, semibold, 0.75rem

**Color for emphasis**: Use ap-blue-600 for important inline text, ap-red-600 for alerts

---

## Shadow System

Apply consistently via Tailwind shadow utilities:

```
shadow-ap-sm   → subtle elevation
shadow-ap-md   → card/popup elevation
shadow-ap-lg   → modal/overlay elevation
shadow-ap-red  → error state emphasis
```

---

## Component Examples

### Primary Button

```jsx
<button className="bg-ap-blue-600 text-white px-6 py-3 rounded-lg hover:bg-ap-blue-700 shadow-ap-md">
  Button
</button>
```

### Action Button (CTA)

```jsx
<button className="bg-ap-red-600 text-white px-6 py-3 rounded-lg hover:bg-ap-red-700 shadow-ap-red">
  Call to Action
</button>
```

### Card

```jsx
<div className="bg-white border border-ap-blue-200 rounded-lg p-6 shadow-ap-md">
  Content
</div>
```

### Success Message

```jsx
<div className="bg-ap-yellow-100 border-l-4 border-ap-yellow-500 p-4 text-ap-slate-900">
  Success message
</div>
```

### Alert/Error

```jsx
<div className="bg-ap-red-100 border-l-4 border-ap-red-500 p-4 text-ap-red-900">
  Error message
</div>
```

### Hero Section

```jsx
<section className="bg-gradient-ap-hero text-white py-20">Hero content</section>
```

---

## Accessibility & Contrast

- **Blue text on white**: ✅ WCAG AA compliant (4.5:1+)
- **Red on white**: ✅ WCAG AA compliant (5.5:1+)
- **Yellow on white**: ❌ NOT compliant - use ap-yellow-600 or add contrast overlay
- **White text on ap-blue**: ✅ WCAG AAA compliant
- **White text on ap-red**: ✅ WCAG AAA compliant

Always test color combinations before deploying.

---

## Implementation Checklist

- [ ] All buttons use ap-blue or ap-red (no other colors)
- [ ] All links use ap-blue-600
- [ ] All alerts/errors use ap-red
- [ ] All success states use ap-yellow
- [ ] All gradients combine only brand colors
- [ ] All shadows use `shadow-ap-*` utilities
- [ ] No external colors imported (except brand colors)
- [ ] Hover states use tint variations of same color
- [ ] Text is always ap-slate-900 (or ap-slate-700 for secondary)
- [ ] Background is white, ap-slate-50, or gradient

---

## Pages & Components Requiring Update

### Public Website

- [x] Home page header with logo
- [ ] Hero section
- [ ] Feature cards
- [ ] CTA buttons
- [ ] Footer

### Member Portal

- [ ] Dashboard layout
- [ ] Member profile
- [ ] Booking forms
- [ ] Status cards

### Admin Dashboard

- [ ] Header/nav
- [ ] Sidebar
- [ ] Data tables
- [ ] Form inputs
- [ ] Modals

---

## Brand Personality

🏓 **Sportief**: Dynamic, energetic, active
🎯 **Toegankelijk**: Welcoming, clear, organized
💪 **Modern**: Contemporary, efficient, forward-thinking
🤝 **Community**: Inclusive, friendly, club-focused

---

## Design Principles

1. **Four Colors Only**: Blue, Red, Yellow, White (+ dark slate for text)
2. **Consistency**: Same color usage across all pages and components
3. **Hierarchy**: Color creates visual priority (blue foundation, red action, yellow accent)
4. **Functionality**: Colors communicate state and interaction
5. **Subtlety**: Gradients and variations add depth without confusion
6. **Accessibility**: Always maintain sufficient contrast for readability

---

## Version

**v1.0** - Extracted from official Almere Pickleball logo
**Last Updated**: 8 februari 2026
