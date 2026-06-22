# Tournament Formats - Berekeningen & Kenmerken

Compleet overzicht van alle beschikbare toernooiformaten met hun wiskundige berekeningen.

---

## 🏓 ROUND ROBIN DOUBLES

**Key:** `ROUND_ROBIN_DOUBLES`

### Beschrijving
Elk pair speelt precies 1 keer tegen elk ander pair. Volledige alle-tegen-alle competitie.

### Vereisten
- **Minimum spelers:** 4
- **Opmerking:** Oneven aantal spelers = rustmomenten

### Berekening Minimum Rondes

```
Aantal teams = floor(playerCount / 2)
Minimum rondes = Aantal teams - 1
```

**Voorbeelden:**
- 4 spelers → 2 teams → 1 ronde → 1 match
- 6 spelers → 3 teams → 2 rondes → 3 matches per ronde = 3 totaal matches
- 8 spelers → 4 teams → 3 rondes → 6 matches per ronde = 6 matches totaal
- 10 spelers → 5 teams → 4 rondes → 10 matches totaal
- 12 spelers → 6 teams → 5 rondes → 15 matches totaal

### Formule Totale Matches

Voor een COMPLETE round-robin (als alle rondes spelen):
```
Total matches = C(teams, 2) = teams × (teams - 1) / 2
```

Waarbij `teams = playerCount / 2`

**Voorbeelden:**
- 6 spelers (3 teams): C(3,2) = 3 × 2 / 2 = **3 matches**
- 8 spelers (4 teams): C(4,2) = 4 × 3 / 2 = **6 matches**
- 12 spelers (6 teams): C(6,2) = 6 × 5 / 2 = **15 matches** ✓ Dit klopt!

### Ranking Mode
**PAIR** - Teams krijgen punten, niet individuele spelers

### Scoring Mode
**GAMES** - Based on sets won

### Beschikbare Rondes
```
Beschikbare rondes = Math.floor(totalTimeMinutes / (matchDuration + swapDuration))
```

**BELANGRIJK:** Alle rondes tot `availableRounds` worden gespeeld. Als totalTimeMinutes niet ingesteld is, wordt default 1 ronde gebruikt.

**Fix Optie:** Zie backend/README.md voor hoe je ALLE wiskundige rondes kunt spelen ongeacht tijd.

---

## 🌀 AMERICANO DOUBLES

**Key:** `AMERICANO_DOUBLES`

### Beschrijving
Rotatieformat: Spelers/pairs roteren door competitie met points-based ranking. Elk team speelt in bijna elke ronde met verschillende partners.

### Vereisten
- **Minimum spelers:** 4
- **Optimaal:** Deelbaar door 4 (4, 8, 12, 16...)
- **Oneven:** Rustmomenten worden verdeeld

### Berekening Rondes

```
Minimum rondes = playerCount - 1
Werkelijke rondes = MIN(playerCount - 1, availableRounds)
```

**Voorbeelden:**
- 4 spelers → max 3 rondes
- 8 spelers → max 7 rondes
- 12 spelers → max 11 rondes

### Rotatie Logica
Spelers roteren elk rond naar volgende positie. Aantal mogelijke unieke rotaties = `playerCount - 1`

**Voorbeeld 4 spelers [A, B, C, D]:**
- Ronde 1: Paren = (A,B) vs (C,D)
- Ronde 2: Roteren → (B,C) vs (D,A)
- Ronde 3: Roteren → (C,D) vs (A,B)

### Ranking Mode
**INDIVIDUAL** - Punten per speler, niet per pair

### Scoring Mode
**POINTS** - Points-based (niet games)

### Matches Per Ronde
```
Matches = Math.floor(playerCount / 4)
```

**Voorbeelden:**
- 4 spelers → 1 match per ronde
- 8 spelers → 2 matches per ronde
- 12 spelers → 3 matches per ronde

---

## 👑 KING OF THE COURT DOUBLES

**Key:** `KING_OF_THE_COURT_DOUBLES`

### Beschrijving
Progressief format: Winnaars spelen volgende ronde tegen elkaar ("court rotation"). Gebaseerd op huide ranking.

### Vereisten
- **Minimum spelers:** 4
- **Optimaal:** Deelbaar door 4
- **Oneven:** Rustmomenten

### Berekening Rondes

```
Minimum rondes = playerCount - 1
Werkelijke rondes = MIN(playerCount - 1, availableRounds)
```

Zelfde als Americano, maar met **progressive ranking-based pairing**.

### Pairing Logica
- Ronde 1: Spelers in originele volgorde
- Ronde N>1: Spelers gesorteerd op ranking (best tegen best)
  ```
  Gesorteerd = spelers.sort((a, b) => ranking[b.id] - ranking[a.id])
  ```

### Ranking Mode
**INDIVIDUAL** - Punten per speler

### Scoring Mode
**POINTS** - Points-based

### Progression Mechaniek
```
Winnaars ↑ stijgen
Verliezers ↓ dalen
```

---

## 🇲🇽 MEXICANO DOUBLES

**Key:** `MEXICANO_DOUBLES`

### Beschrijving
Variant van Americano met andere pairing-mechanica. Soortgelijke rotatie maar andere team-indeling.

### Vereisten
- **Minimum spelers:** 4
- **Optimaal:** Deelbaar door 4
- **Oneven:** Rustmomenten

### Berekening Rondes

```
Minimum rondes = playerCount - 1
Werkelijke rondes = MIN(playerCount - 1, availableRounds)
```

Zelfde als Americano & King of the Court.

### Pairing Logica
- Zelfde rotatie logica als Americano
- Ranking-based sorting (als beschikbaar)

### Ranking Mode
**INDIVIDUAL** - Punten per speler

### Scoring Mode
**POINTS** - Points-based

### Key Verschil vs Americano
- Mexicano heeft subtiel andere pairing algoritme
- Beter voor bepaalde groepgroottes

---

## 🎯 CLASSIC DOUBLES

**Key:** `CLASSIC_DOUBLES`

### Beschrijving
Traditioneel round-robin format met vaste paren. Alle paren spelen tegen elkaar.

### Vereisten
- **Minimum spelers:** 4
- **Oneven:** Rustmomenten
- **Vaste paren:** Optioneel (anders sequentieel gemaakt)

### Berekening

```
Aantal vaste paren = len(fixedPairs)
IF fixedPairs leeg: paren = sequentieel gemaakt van spelers

Minimum rondes = paren - 1
Werkelijke rondes = MIN(paren - 1, availableRounds)
```

**Voorbeelden:**
- 8 spelers (4 vaste paren) → 3 rondes
- 12 spelers (6 vaste paren) → 5 rondes

### Ranking Mode
**PAIR** - Teams krijgen punten

### Scoring Mode
**GAMES** - Based on sets

### Use Case
- Formele club competitions
- Vaste teams/partnerships

---

## 🎨 MIXED DOUBLES

**Key:** `MIXED_DOUBLES`

### Beschrijving
Round-robin met geslachtsgebalanceerde paren (man + vrouw). Alle pairs spelen tegen elkaar.

### Vereistent
- **Minimum spelers:** 4
- **Gender balans:** Optimaal even man/vrouw

### Pairing Logica

```
IF fixedPairs gegeven:
  Gebruik deze pairs

ELSE:
  males = spelers.filter(gender === MALE)
  females = spelers.filter(gender === FEMALE)
  unknown = spelers.filter(!gender)
  
  FOR i in 0..min(males.len, females.len):
    pairs.push([males[i], females[i]])
  
  remaining = [males.slice(maxPairs), females.slice(maxPairs), unknown]
  pairs.push(sequentialPairing(remaining))
```

### Berekening Rondes

```
Aantal vaste paren = len(pairs)
Minimum rondes = paren - 1
Werkelijke rondes = MIN(paren - 1, availableRounds)
```

### Ranking Mode
**PAIR** - Teams krijgen punten

### Scoring Mode
**GAMES** - Based on sets

### Warnings
- Gender imbalans → warning in output
- Geen vaste pairs → auto-gemaakt op gender

---

## ⚡ FAST4 DOUBLES

**Key:** `FAST4_DOUBLES`

### Beschrijving
Rapid fire round-robin format voor snelle sets/matches. Alle paren spelen tegen elkaar.

### Vereisten
- **Minimum spelers:** 4
- **Oneven:** Rustmomenten

### Berekening

```
Aantal pairs = floor(playerCount / 2)
Minimum rondes = pairs - 1
Werkelijke rondes = MIN(pairs - 1, availableRounds)
```

### Ranking Mode
**PAIR** - Teams krijgen punten

### Scoring Mode
**GAMES** - Based on sets

### Key Verschil
- Dezelfde berekening als Round Robin
- Maar speedier scoring/format

---

## 🔗 TIE-BREAK DOUBLES

**Key:** `TIEBREAK_DOUBLES`

### Beschrijving
Round-robin met tie-break scoring. Alle paren spelen tegen elkaar, scoring via tiebreaks.

### Vereisten
- **Minimum spelers:** 4
- **Oneven:** Rustmomenten

### Berekening

```
Aantal pairs = floor(playerCount / 2)
Minimum rondes = pairs - 1
Werkelijke rondes = MIN(pairs - 1, availableRounds)
```

### Ranking Mode
**PAIR** - Teams krijgen punten

### Scoring Mode
**TIEBREAK** - Via tiebreak points

### Key Verschil
- Tie-break scoring in plaats van standard games
- Sneller format dan classic doubles

---

## 📊 Samenvatting Tabel

| Format | Type | Min Players | Ranking | Scoring | Rondes Formule | Use Case |
|--------|------|-------------|---------|---------|----------------|----------|
| **Round Robin** | Pair-based | 4 | PAIR | GAMES | teams-1 | Competitief, volledig RR |
| **Americano** | Rotation | 4 | INDIV | POINTS | playerCount-1 | Casual, iedereen speelt |
| **Mexicano** | Rotation | 4 | INDIV | POINTS | playerCount-1 | Variant Americano |
| **King of Court** | Progressive | 4 | INDIV | POINTS | playerCount-1 | Skill-based progression |
| **Classic** | Pair-based | 4 | PAIR | GAMES | pairs-1 | Traditioneel |
| **Mixed** | Pair+Gender | 4 | PAIR | GAMES | pairs-1 | Geslachtsgebalanceerd |
| **Fast4** | Pair-based | 4 | PAIR | GAMES | teams-1 | Speed format |
| **Tie-break** | Pair-based | 4 | PAIR | TIEBREAK | teams-1 | Tie-break scoring |

---

## ⚙️ Shared Configuration Parameters

Alle formats gebruiken dezelfde `ScheduleConfig`:

```typescript
{
  matchDuration: number;        // Minuten per match
  swapDuration: number;          // Minuten tussen matches
  totalTimeMinutes?: number;     // Totaal beschikbare tijd
  timeBlocks?: Array<{           // OF time blocks met start/end
    start: string;               // "09:00"
    end: string;                 // "17:00"
  }>;
  courts: number;                // Aantal beschikbare banen
  fixedPairs?: [string, string][]; // Optioneel vaste paren
}
```

### Available Rounds Berekening

```typescript
IF totalTimeMinutes gegeven:
  availableRounds = Math.floor(totalTimeMinutes / (matchDuration + swapDuration))

ELSE IF timeBlocks gegeven:
  totalMinutes = sum van alle timeBlocks
  availableRounds = Math.floor(totalMinutes / (matchDuration + swapDuration))

ELSE:
  availableRounds = 1  // Default fallback
```

---

## 📝 Voorbeeld: 12 Spelers

### Round Robin
```
Teams: 12/2 = 6
Min Rondes: 6-1 = 5
Total Matches (complete): C(6,2) = 15 ✓
```

### Americano/Mexicano
```
Min Rondes: 12-1 = 11
Matches per ronde: 12/4 = 3
Total Matches: 11 × 3 = 33
```

### King of Court
```
Min Rondes: 12-1 = 11
Matches per ronde: 12/4 = 3
Total Matches: 11 × 3 = 33
(Maar met ranking-based pairing)
```

---

## 🔧 Time-Based Limiting

**Let op:** Alle formats limiten rondes op beschikbare tijd:

```
Werkelijke rondes = MIN(minimumRondes, availableRounds)
```

**Voorbeeld:**
```
Round Robin 6 teams:
- Minimum: 5 rondes (wiskundig)
- Available: 3 rondes (3 uur beschikbaar / 0.5u per ronde)
- RESULTAAT: 3 rondes gespeeld (niet 5!)
```

**Optie:** Zie backend/README.md "Advanced Configuration" voor hoe je dit kunt aanpassen.

---

## 📌 Best Practices

### Voor Competitive Tournaments
✅ Round Robin - Volledig eerlijk, iedereen vs iedereen

### Voor Training/Drop-in
✅ Americano/Mexicano - Iedereen speelt, veel variatie

### Voor Skill-Based Events
✅ King of the Court - Beste spelers tegen elkaar

### Voor Geslachtsgebalanceerde Events
✅ Mixed Doubles - Auto-pairing op gender

### Voor Snelle Events
✅ Fast4 of Tie-break - Korter format

---

**Geüpdatet:** 19 januari 2026
