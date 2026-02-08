# Testing Checklist - Check bij ELKE wijziging

## Voor elke commit

- [ ] Code compileert zonder errors
- [ ] Linter heeft geen errors
- [ ] Tests draaien succesvol
- [ ] Documentatie bijgewerkt indien nodig

## Functionaliteit Tests

- [ ] Nieuwe feature werkt zoals verwacht
- [ ] Bestaande features nog steeds werkend
- [ ] Edge cases getest
- [ ] Error handling werkt

## Code Quality

- [ ] Geen console.log() statements achtergelaten
- [ ] Geen commented code (tenzij met reden)
- [ ] Variabelen hebben duidelijke namen
- [ ] Functies zijn niet te lang (max ~50 regels)
- [ ] DRY principe gevolgd (geen duplicate code)

## Performance

- [ ] Geen onnodige loops
- [ ] Geen memory leaks
- [ ] Efficiënte queries/operaties

## Security (indien relevant)

- [ ] Geen hardcoded secrets/keys
- [ ] Input validatie aanwezig
- [ ] Output sanitization waar nodig
- [ ] Authenticatie/autorisatie correct

## Browser/Platform Check (frontend)

- [ ] Console heeft geen errors
- [ ] Network requests succesvol
- [ ] UI responsive op verschillende schermen
- [ ] Cross-browser getest (Chrome, Firefox, Safari)

## Data/Database Check (backend)

- [ ] Migrations up-to-date
- [ ] Geen data loss risico
- [ ] Foreign keys/relaties kloppen
- [ ] Indexes aanwezig waar nodig

---

**Als één van deze checks faalt:**

1. Fix de issue
2. Log in CHANGELOG.md onder "Bugs opgelost"
3. Run checklist opnieuw
4. Commit pas als alles groen is
