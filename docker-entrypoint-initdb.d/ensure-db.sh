#!/bin/bash
set -e

# This script runs after PostgreSQL is initialized
# It ensures the database exists (uses POSTGRES_DB from environment)

DB_NAME="${POSTGRES_DB:-uniscan}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE $DB_NAME'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOSQL

echo "Database '$DB_NAME' ensured to exist"

