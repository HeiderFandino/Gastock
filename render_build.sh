#!/usr/bin/env bash
# exit on error
set -o errexit

pip install pipenv
pipenv install

# Limpiar migraciones problemáticas ANTES del frontend
python reset_migrations.py

npm install
npm run build
