#!/bin/bash

BACKUP_DIR="$HOME/project-backups"
PROJECT_NAME=$(basename $(pwd))
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/${PROJECT_NAME}_${TIMESTAMP}.tar.gz"

# Maak backup directory
mkdir -p "$BACKUP_DIR"

# Maak backup (exclusief node_modules, dist, etc)
tar -czf "$BACKUP_PATH" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.git' \
  --exclude='*.log' \
  .

echo "✅ Backup gemaakt: $BACKUP_PATH"

# Houd alleen laatste 10 backups
ls -t "$BACKUP_DIR/${PROJECT_NAME}"_*.tar.gz | tail -n +11 | xargs -r rm

echo "📦 Oude backups opgeschoond (max 10 behouden)"
