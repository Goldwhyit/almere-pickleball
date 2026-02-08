#!/bin/bash

# Maak sessions directory
mkdir -p sessions

# Vraag doel van sessie
echo "Wat is het doel van deze sessie?"
read SESSION_GOAL

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
SESSION_FILE="sessions/SESSION_$(date +%Y%m%d_%H%M).md"

# Maak sessie log
cat > "$SESSION_FILE" << EOF
# Sessie: $TIMESTAMP

## Doel
$SESSION_GOAL

## Wijzigingen
<!-- Noteer hier alle wijzigingen tijdens de sessie -->

## Bugs gevonden
<!-- Format: [BUG] Bestand:regel - Beschrijving - Oplossing -->

## Tests uitgevoerd
- [ ] Code compileert
- [ ] Linter heeft geen errors
- [ ] Functionaliteit getest
- [ ] Documentatie bijgewerkt

## Geleerd
<!-- Wat ging fout? Waarom? Hoe voorkomen volgende keer? -->

## Status
- [ ] Alle taken voltooid
- [ ] CHANGELOG.md bijgewerkt
- [ ] Code gecommit en gepusht
- [ ] Tests geslaagd
EOF

echo "✅ Sessie log aangemaakt: $SESSION_FILE"
echo "📝 Noteer wijzigingen tijdens je werk in dit bestand"

# Open in VS Code
code "$SESSION_FILE"
