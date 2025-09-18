#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

pip install pipenv
pipenv install

# Solo limpiar la tabla de control, no recrear migraciones
pipenv run python -c "
import os
from sqlalchemy import create_engine, text
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS alembic_version'))
    conn.commit()
print('✅ alembic_version limpiada')
"

pipenv run upgrade
