#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

pip install pipenv
pipenv install

# Limpiar base de datos problemática en Render
pipenv run python -c "
import os
from sqlalchemy import create_engine, text
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS alembic_version'))
    conn.commit()
print('✅ Render database cleaned')
"

# Marcar nuestro baseline como aplicado
pipenv run flask db stamp 7b25a2a2abae

echo "✅ Migration baseline stamped"
