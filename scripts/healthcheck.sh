#!/bin/sh
set -e

# Healthcheck script for PostgreSQL
# Uses POSTGRES_DB environment variable set in the container

DB_NAME="${POSTGRES_DB:-uniscan}"

# Check if PostgreSQL is ready
if ! pg_isready -U postgres > /dev/null 2>&1; then
  exit 1
fi

# Check if database exists, create if it doesn't
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE $DB_NAME" > /dev/null 2>&1

# Verify we can connect to the database
pg_isready -U postgres -d "$DB_NAME" > /dev/null 2>&1

