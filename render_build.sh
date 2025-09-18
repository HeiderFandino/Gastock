#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

pip install pipenv
pipenv install

# Ver qué heads existen y forzar upgrade al correcto
echo "=== Heads disponibles ==="
pipenv run flask db heads || echo "No heads found"

echo "=== Forzando upgrade a nuestro head ==="
pipenv run flask db upgrade 2e5db5dafba1
