#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=postgres psql -h postgres -U postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready. Ensuring database exists..."
PGPASSWORD=postgres psql -h postgres -U postgres <<-EOSQL
    SELECT 'CREATE DATABASE testpulse'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testpulse')\gexec
EOSQL

echo "Database 'testpulse' ensured to exist"

