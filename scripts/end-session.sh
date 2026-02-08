#!/bin/bash

# Vind laatste sessie
LATEST_SESSION=$(ls -t sessions/SESSION_*.md 2>/dev/null | head -1)

if [ -z "$LATEST_SESSION" ]; then
  echo "Geen actieve sessie gevonden"
  exit 1
fi

echo "Sessie afronden: $LATEST_SESSION"
echo ""

# Toon onvoltooide taken
echo "Onvoltooide taken:"
grep "\[ \]" "$LATEST_SESSION" || echo "Alle taken voltooid!"
echo ""

read -p "Alle taken voltooid en klaar om te committen? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Haal sessie doel op
  SESSION_GOAL=$(grep -A 1 "## Doel" "$LATEST_SESSION" | tail -1)

  # Commit alles
  git add -A
  git commit -m "Session completed: $SESSION_GOAL"
  git push

  echo "✅ Sessie afgerond en gepusht!"
else
  echo "⚠️  Maak eerst je taken af"
fi
