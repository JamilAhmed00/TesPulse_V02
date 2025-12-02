#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
    SELECT 'CREATE DATABASE testpulse'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testpulse')\gexec
EOSQL

echo "Database 'testpulse' ensured to exist"

