#!/bin/bash
# Auto commit script - draait automatisch

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Stage alle changes
git add -A

# Check of er changes zijn of nog geen commits bestaan
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    if git diff-index --quiet HEAD --; then
        echo "Geen wijzigingen om te committen"
    else
        # Commit met timestamp en branch info
        git commit -m "Auto-backup: $TIMESTAMP | Branch: $BRANCH"
        echo "✅ Commit gemaakt: $TIMESTAMP"
    fi
else
    # Eerste commit
    git commit -m "Auto-backup (initial): $TIMESTAMP | Branch: $BRANCH"
    echo "✅ Eerste commit gemaakt: $TIMESTAMP"
fi
