# 🏓 Almere Pickleball Huisstijl & Branding Implementation

## Official Brand Colors (uit logo)

### Primaire Kleuren

- **AP Blue** (#0c7fcd): Dominante achtergrond kleur van het logo
- **AP Red** (#dc3c3c): Secundaire accent kleur (rechts in logo)
- **AP Yellow** (#ffdd00): Accent geel (pickleball bal)
- **AP Slate**: Neutrale grijstinten voor tekst en achtergronden

### Kleurenhiërarchie

```
🔵 Blauw = Vertrouwen, Stabiliteit (Primary Actions)
🔴 Rood = Energie, Urgentie (Highlights, CTAs)
🟡 Geel = Optimisme, Aandacht (Special Accents, Buttons)
⚪ Grijs = Rust, Leesbaarheid (Text, Borders)
```

## Technische Implementatie

### 1. Tailwind Configuration (`tailwind.config.js`)

- Centralized color palette met alle AP-kleuren
- Voorgeconfigureerde gradients:
  - `gradient-ap-main`: Blauw → Donkerblauw
  - `gradient-ap-accent`: Blauw → Rood
  - `gradient-ap-warm`: Geel → Rood
  - `gradient-ap-cool`: Blauw → Wit
- Custom box shadows met brand kleuren
- Brand-specific animations

### 2. Theme Provider (`lib/apTheme.ts`)

- Gecentraliseerde kleurconfiguratie
- Button variants (primary, secondary, accent, outline)
- Card styles (default, blue, red, yellow)
- Helper functions: `getButtonClasses()`, `getCardClasses()`
- Semantic color mapping

### 3. Kleur-Aliassen

- `ap-blue-*`: Alle blauwtinten (50-900)
- `ap-red-*`: Alle roodtinten (50-900)
- `ap-yellow-*`: Alle geeltinten (50-900)
- `ap-slate-*`: Alle grijs tinten (50-900)
- `primary`: Backward-compatible alias voor ap-blue

## Toepassing op Pagina's

### Homepage

- Header: Gradient blauw-tot-rood
- CTA Buttons: Geel (#ffdd00) met blauw text
- Feature Cards: Border in blauwen rode accenten
- Footer: Dark blue gradient (#051840)

### Inloggen & Registratie

- Form Fields: Blauw borders, blauw focus
- Submit Buttons: AP Blue primary
- Links: AP Red highlights
- Error States: AP Red

### Ledenomgeving (Dashboard)

- Navigation: AP Blue (#0c7fcd)
- Active States: AP Red highlights
- Cards: Blauw borders
- Status Badges: Geel/groen/rood op context

### Admin Dashboard

- Header: Dark AP Blue gradient
- Action Buttons: AP Blue (primary), AP Red (delete)
- Status Tegels: Verschillende kleuren per status
- Charts: AP Blue als primary color

## Kleurcombinaties & Mixes

### Button Varianten

1. **Primary**: AP Blue background + white text → Betrouwbaarheid
2. **Secondary**: AP Red background + white text → Urgentie
3. **Accent**: AP Yellow background + blue text → Aandacht
4. **Outline**: White + AP Blue border → Subtiel

### Card Varianten

1. **Blue Cards**: Blauwe 2px border → Vertrouwen
2. **Red Cards**: Rode 2px border → Urgentie
3. **Yellow Cards**: Gele 2px border → Accent
4. **Default**: Grijs border → Standaard

### Gradient Toepassing

- Heroes: `gradient-ap-main` (Blauw → Donker)
- CTAs: `gradient-ap-accent` (Blauw → Rood)
- Warm sections: `gradient-ap-warm` (Geel → Rood)
- Cool sections: `gradient-ap-cool` (Blauw → Wit)

## Consistency Guidelines

### ✅ Dos

- Gebruik altijd AP-prefixed kleuren (ap-blue, ap-red, etc.)
- Combineer kleuren uit hetzelfde palet
- Zorg voor voldoende contrast (WCAG AA minimum)
- Gebruik gradients voor grote hero sections
- Pas shadows toe met AP theme colors

### ❌ Don'ts

- Geen hardcoded hex-codes buiten het palet
- Geen willekeurige tailwind kleuren (sky, slate van andere libraries)
- Geen te veel kleuren in één component
- Geen faded/transparent ohne reden

## Testing Checklist

- [ ] Homepage: Logo, header, buttons zien er correct uit
- [ ] Kleurencontrast: Text is readable op alle achtergronden
- [ ] Mobiel: Kleuren en layouts responsive
- [ ] Dark mode: (Toekomstig) Dark variants voorbereid
- [ ] Admin: Alle tegels hebben correcte AP-kleuren
- [ ] Forms: Focus states zijn duidelijk zichtbaar

## Toekomstige Uitbreidingen

1. **Dark Mode**: Voeg `dark:` variants toe in tailwind
2. **Animations**: Gebruik `animation-ap-float`, `animation-ap-pulse`
3. **Icons**: Kleur-codering per type (blauw = info, rood = alert)
4. **Branded Assets**: Logo op strategic plaatsen
5. **Print Styles**: Zorg dat kleuren op papier werken

## Bronnen

- Official Logo: Almere Pickleball
- Primary Blue: #0c7fcd (uit logo)
- Secondary Red: #dc3c3c (uit logo)
- Accent Yellow: #ffdd00 (uit logo)
- Branding Guide: Gecentraliseerd in `tailwind.config.js` en `lib/apTheme.ts`
