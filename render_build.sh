#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

pip install pipenv
pipenv install

# Marcar migración como aplicada sin ejecutarla (tablas ya existen)
echo "=== Marcando migración como aplicada ==="
pipenv run flask db stamp 2e5db5dafba1

echo "=== Verificando estado final ==="
pipenv run flask db current
