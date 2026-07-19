#!/usr/bin/env bash
set -o errexit

# Frontend: install exactly the versions from package-lock.json.
npm ci --include=dev
npm run build

# Backend: Pipfile.lock is the source of truth in every environment.
python -m pip install --upgrade pip pipenv
pipenv install --system --deploy

# Aplicar migraciones pendientes sin resetear la base de datos
python -m flask db upgrade

echo "✅ Migrations applied"
