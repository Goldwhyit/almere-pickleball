# 📱 Responsive Design Testing Checklist

**Document**: 2026-02-09  
**Project**: Almere Pickleball  
**Goal**: Verify responsive design works flawlessly on ALL devices

---

## 1. Test Devices & Sizes

### Mobile Phones
- [ ] iPhone SE (375px) - portrait
- [ ] iPhone 14 (390px) - portrait  
- [ ] iPhone 15 Pro (393px) - portrait
- [ ] iPhone 15 Pro Max (430px) - portrait
- [ ] Galaxy S21 (360px) - portrait
- [ ] Pixel 8 (412px) - portrait
- [ ] OnePlus 12 (432px) - portrait

### Mobile Landscape
- [ ] iPhone SE (667px) - landscape
- [ ] iPhone 15 Pro (851px) - landscape
- [ ] Galaxy S21 (800px) - landscape

### Tablets
- [ ] iPad (768px) - portrait
- [ ] iPad (1024px) - landscape
- [ ] iPad Pro 11" (834px) - portrait
- [ ] iPad Pro 11" (1194px) - landscape
- [ ] iPad Pro 12.9" (1024px) - portrait
- [ ] iPad Pro 12.9" (1366px) - landscape

### Desktops
- [ ] 1280px (laptop compact)
- [ ] 1440px (standard desktop)
- [ ] 1920px (full HD)
- [ ] 2560px (4K monitor)
- [ ] 3840px (ultrawide)

---

## 2. Navigation Tests

### Mobile Navigation (<768px)
- [ ] Hamburger menu visible
- [ ] Hamburger icon size ≥ 44px × 44px
- [ ] Menu opens on click
- [ ] Menu closes on link click
- [ ] Menu closes on ESC key
- [ ] Menu closes on overlay click
- [ ] Body scroll prevented when menu open
- [ ] Menu overlay visible behind menu
- [ ] Menu links readable and tappable (≥44px height)
- [ ] No horizontal scroll
- [ ] Animation smooth (no jank)

### Tablet Navigation (768-1023px)
- [ ] Hamburger menu still visible
- [ ] All mobile menu tests pass
- [ ] OR full navigation visible (if implemented)

### Desktop Navigation (≥1024px)
- [ ] Hamburger menu HIDDEN
- [ ] Full horizontal navigation visible
- [ ] Logo visible and clickable
- [ ] All nav links spaced properly
- [ ] Hover effects work
- [ ] No overlap between elements
- [ ] Buttons at least 44px height

---

## 3. Layout & Spacing Tests

### Container Padding
- [ ] Mobile (320px): 16px padding on sides
- [ ] Mobile landscape (576px): 16px padding
- [ ] Tablet (768px): 24px padding  
- [ ] Desktop (1024px): 32px padding
- [ ] Large desktop (1536px): 40px padding
- [ ] No horizontal scroll at any breakpoint
- [ ] Content centered and not overflowing
- [ ] Content fully visible (not cut off)

### Vertical Spacing
- [ ] Sections have consistent spacing
- [ ] Mobile: 24px between sections
- [ ] Tablet: 32px between sections
- [ ] Desktop: 48px between sections
- [ ] Text doesn't bunch up

---

## 4. Grid Layouts

### Card Grids
- [ ] Mobile: 1 column
- [ ] Tablet (768px): 2 columns
- [ ] Desktop (1024px): 3 columns
- [ ] Large desktop (1536px): Can fit 4 columns
- [ ] Cards responsive height (not too tall/short)
- [ ] Gaps proper at each breakpoint
- [ ] No overlap
- [ ] Card content doesn't wrap awkwardly

### Admin Dashboard
- [ ] Mobile: 1 tile per row
- [ ] Tablet: 2 tiles per row
- [ ] Desktop: 3 tiles per row
- [ ] Large: 4 tiles per row
- [ ] Tiles clickable (≥44px)
- [ ] Hover effects desktop only (no hover on mobile)
- [ ] Icon visible at all sizes
- [ ] Label readable

---

## 5. Typography Tests

### Font Sizes
- [ ] Body text minimum 16px on mobile
- [ ] H1 readable: 24px mobile, 32px tablet, 48px desktop
- [ ] H2 readable: 20px mobile, 28px tablet, 36px desktop
- [ ] Links understandable on all sizes
- [ ] No text overflow (text wraps properly)
- [ ] Line heights comfortable (≥1.5)
- [ ] Line length not too long (≤65 chars preferred)

### Text Wrapping
- [ ] Long words break properly
- [ ] URLs wrap or truncate
- [ ] Emails wrap or truncate
- [ ] Phone numbers readable
- [ ] All text legible

---

## 6. Button & Touch Target Tests

### Size
- [ ] All buttons ≥ 44px × 44px
- [ ] Icon buttons: 40px × 40px minimum (padding adds to 44px)
- [ ] Links styled as buttons: ≥ 44px
- [ ] Form submit button: ≥ 44px × 44px
- [ ] Action buttons adequate spacing (≥12px gap between)

### Mobile Button Layout
- [ ] Primary buttons: full width when alone
- [ ] Multiple buttons: stack vertically on mobile
- [ ] Button text readable (16px+)
- [ ] Button padding: 12px vertical, 24px horizontal

### Desktop Button Layout
- [ ] Buttons side-by-side when space permits
- [ ] Hover effects visible
- [ ] Active states clear
- [ ] Disabled state clear
- [ ] Focus ring visible (keyboard nav)

---

## 7. Forms Tests

### Input Fields
- [ ] Font size ≥ 16px (prevents iOS auto-zoom)
- [ ] Full width on mobile
- [ ] Focus ring clearly visible
- [ ] Placeholder text readable
- [ ] Label text above input
- [ ] Error messages visible
- [ ] Form fields ≥ 44px min-height

### Multi-field Forms
- [ ] Mobile: Fields stack vertically
- [ ] Tablet: 2 columns maximum
- [ ] Desktop: Can use 2-3 columns
- [ ] All fields accessible
- [ ] No horizontal scroll due to form

### Form Submission
- [ ] Submit button visible and clickable
- [ ] Loading state clearly shown
- [ ] Error messages readable
- [ ] Success messages visible
- [ ] Form doesn't scroll away on focus

---

## 8. Tables & Lists

### Mobile (< 768px)
- [ ] Table hidden
- [ ] Card layout shown instead
- [ ] Each row as separate card
- [ ] Field labels visible in each card
- [ ] Data readable without horizontal scroll
- [ ] Action buttons accessible (≥44px)
- [ ] No truncation of data

### Tablet (768-1023px)
- [ ] May show table or cards (test both approaches)
- [ ] If table: scrollable horizontally if needed
- [ ] If cards: clean layout with 1-2 items per row
- [ ] All data visible

### Desktop (≥1024px)
- [ ] Table visible with full headers
- [ ] All columns visible (no scroll needed if possible)
- [ ] Hover effects on rows
- [ ] Sortable indicators (if applicable)
- [ ] All data readable

---

## 9. Images & Media

### Responsiveness
- [ ] Images scale with container
- [ ] No horizontal scroll due to images
- [ ] Aspect ratios maintained
- [ ] Images not stretched/distorted
- [ ] Placeholder visible while loading
- [ ] Alt text present (check with screen reader)
- [ ] Lazy loading works (images load when visible)

### Different Sizes
- [ ] Small screens: images appropriately sized
- [ ] Large screens: images scale up (not pixelated)
- [ ] Background images responsive
- [ ] SVGs scale smoothly

---

## 10. iOS Specific Tests

### Safari on iOS
- [ ] 100vh works properly (use 100dvh for iOS 15+)
- [ ] No automatic zoom on input focus (font ≥ 16px)
- [ ] Viewport meta tag correct: `width=device-width, initial-scale=1.0`
- [ ] Top safe area (notch) respected
- [ ] Bottom safe area (home indicator) respected
- [ ] Sticky navbar doesn't hide behind notch
- [ ] Smooth scrolling works (not jarring)

### iOS Specific Layout
- [ ] No overflow on iPhone SE (375px)
- [ ] Landscape mode: extra spacing if needed
- [ ] Keyboard doesn't cover form

---

## 11. Android Tests

### Chrome on Android
- [ ] All content visible
- [ ] No horizontal scroll
- [ ] Buttons tappable (44px)
- [ ] Touch targets not too close
- [ ] Font readable (no auto-zoom needed)
- [ ] Back gestures work (not intercepted)

---

## 12. Desktop-Specific Tests

### 1280px (Laptop)
- [ ] Full navigation visible
- [ ] 3-column layouts render
- [ ] White space balanced
- [ ] Not stretched
- [ ] Hover effects work

### 1440px (Standard Desktop)
- [ ] Content centered
- [ ] Max-width not too wide
- [ ] Sidebar if applicable: positioned correctly
- [ ] Content scannable

### 1920px (Full HD)
- [ ] Content doesn't stretch too wide
- [ ] Max-container limits width appropriately
- [ ] Symmetrical margins on sides
- [ ] 4-column layouts work if applicable

### 2560px+ (4K)
- [ ] Content still readable
- [ ] Font sizes not tiny
- [ ] Comfortable to use (not zoomed out too far)

---

## 13. No Scroll Tests

### Horizontal Scroll
- [ ] ❌ NO horizontal scroll at 320px
- [ ] ❌ NO horizontal scroll at 768px
- [ ] ❌ NO horizontal scroll at 1024px
- [ ] ❌ NO horizontal scroll at 1920px
- [ ] ❌ NO horizontal scroll during animations
- [ ] ❌ NO horizontal scroll with menu open
- [ ] ❌ NO horizontal scroll with modals open

### Scroll Behavior
- [ ] Smooth scroll-behavior works
- [ ] Scroll-to-top smooth
- [ ] Overscroll bounce (iOS) not breaking layout
- [ ] Scroll performance smooth (no jank)

---

## 14. Performance Tests

### Page Load
- [ ] First contentful paint < 2.5s (mobile)
- [ ] Largest contentful paint < 4s
- [ ] Cumulative layout shift < 0.1
- [ ] No reflows on scroll

### Mobile Performance
- [ ] No jank during scroll
- [ ] Animations smooth (60fps)
- [ ] Touch response immediate (< 100ms)
- [ ] No slowdown with lazy images

### Image Performance
- [ ] Images lazy loaded
- [ ] Images optimized (not huge files)
- [ ] WebP format served (if supported)
- [ ] Fallbacks for older browsers

---

## 15. Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus ring visible everywhere
- [ ] Logical tab order
- [ ] Skip link works
- [ ] Modal traps focus properly
- [ ] Menu accessible via keyboard

### Screen Reader (VoiceOver, NVDA, JAWS)
- [ ] Page title readable
- [ ] Headings properly marked
- [ ] Links have descriptive text
- [ ] Buttons have labels
- [ ] Forms have associated labels
- [ ] Images have alt text
- [ ] Icons have aria-labels if needed
- [ ] Menu has aria-expanded
- [ ] Navigation landmarks present

### Color & Contrast
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Color not only indicator of status
- [ ] Sufficient visual feedback (not just color)

---

## 16. Feature-Specific Tests

### Admin Dashboard
| Feature | Mobile | Tablet | Desktop | Status |
|---------|--------|--------|---------|--------|
| Tiles display | 1 col ✓ | 2 cols ✓ | 3+ cols ✓ | |
| Icons visible | Yes ✓ | Yes ✓ | Yes ✓ | |
| Hover effects | None ✓ | None ✓ | Yes ✓ | |
| Click all tiles | ✓ | ✓ | ✓ | |
| Modal responsive | ✓ | ✓ | ✓ | |
| Form responsive | ✓ | ✓ | ✓ | |

### Tournaments Page
| Test | Mobile | Tablet | Desktop | Status |
|------|--------|--------|---------|--------|
| List view | Cards ✓ | Cards ✓ | Cards/Table ✓ | |
| Filters work | ✓ | ✓ | ✓ | |
| Join button | ✓ | ✓ | ✓ | |
| Modal responsive | ✓ | ✓ | ✓ | |

### Dashboard / User Panel
| Test | Mobile | Tablet | Desktop | Status |
|------|--------|--------|---------|--------|
| Stats tiles | 1 col ✓ | 2 cols ✓ | 3 cols ✓ | |
| Charts readable | ✓ | ✓ | ✓ | |
| Buttons accessible | ✓ | ✓ | ✓ | |

---

## 17. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)

---

## 18. Bug Checklist

- [ ] Fix: No horizontal scroll at any size
- [ ] Fix: All buttons ≥ 44px
- [ ] Fix: Font sizes mobile-first
- [ ] Fix: Images responsive
- [ ] Fix: Forms stack on mobile
- [ ] Fix: Tables become cards on mobile
- [ ] Fix: Navigation responsive
- [ ] Fix: Admin tiles resize properly
- [ ] Fix: No text overflow
- [ ] Fix: Proper spacing at breakpoints

---

## 19. Sign-Off

| Phase | Tester | Date | Status |
|-------|--------|------|--------|
| Mobile | [Name] | [ ] | ✓ Pass / ⚠️ Issues |
| Tablet | [Name] | [ ] | ✓ Pass / ⚠️ Issues |
| Desktop | [Name] | [ ] | ✓ Pass / ⚠️ Issues |
| Edge Cases | [Name] | [ ] | ✓ Pass / ⚠️ Issues |
| Performance | [Name] | [ ] | ✓ Pass / ⚠️ Issues |
| Accessibility | [Name] | [ ] | ✓ Pass / ⚠️ Issues |

---

## 20. Issues Found

### Critical (Breaks Functionality)
1. [ ] Issue: ... Fix: ... Date resolved: ...
2. [ ] Issue: ... Fix: ... Date resolved: ...

### Major (Impacts Usability)
1. [ ] Issue: ... Fix: ... Date resolved: ...
2. [ ] Issue: ... Fix: ... Date resolved: ...

### Minor (Polish)
1. [ ] Issue: ... Fix: ... Date resolved: ...
2. [ ] Issue: ... Fix: ... Date resolved: ...

---

## 21. Performance Budget

| Metric | Target | Result | Pass |
|--------|--------|--------|------|
| FCP | < 2.5s | | ✓ |
| LCP | < 4s | | ✓ |
| CLS | < 0.1 | | ✓ |
| Mobile JS | < 200KB | | ✓ |
| Mobile CSS | < 50KB | | ✓ |
| Image avg size | < 100KB | | ✓ |

---

## 22. Final Checklist

- [ ] All devices tested
- [ ] All features work
- [ ] No horizontal scroll
- [ ] All text readable
- [ ] All buttons tappable
- [ ] Performance acceptable
- [ ] Accessibility checked
- [ ] No console errors
- [ ] No layout shifts
- [ ] Documentation updated

---

## Notes

Use this section to document any workarounds, browser quirks, or special considerations:

---

**Signed-off by**: [Name]  
**Date**: ________  
**Status**: ✓ Ready for Release / ⚠️ Needs fixes / ❌ Not ready

