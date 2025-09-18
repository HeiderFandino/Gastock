#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

pip install pipenv
pipenv install

# Aplicar migraciones pendientes sin resetear la base de datos
pipenv run flask db upgrade

echo "✅ Migrations applied"
