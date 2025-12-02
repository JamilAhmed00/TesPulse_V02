#!/usr/bin/env python3
"""Wait for PostgreSQL to be ready and ensure database exists."""
import sys
import os
import time
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

def main():
    # Get database configuration from environment variables
    db_host = os.getenv('DB_HOST', 'postgres')
    db_port = os.getenv('DB_PORT', '5432')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    db_name = os.getenv('DB_NAME', 'uniscan')
    
    # Build connection URL for postgres database (to check if we can connect)
    encoded_password = quote_plus(db_password)
    check_url = f'postgresql://{db_user}:{encoded_password}@{db_host}:{db_port}/postgres'
    
    # Wait for PostgreSQL to be ready
    print('Waiting for PostgreSQL to be ready...')
    max_retries = 30
    for i in range(max_retries):
        try:
            engine = create_engine(check_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
            with engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            print('PostgreSQL is ready!')
            break
        except Exception as e:
            if i < max_retries - 1:
                print(f'PostgreSQL is unavailable - sleeping (attempt {i+1}/{max_retries})')
                time.sleep(1)
            else:
                print(f'Failed to connect to PostgreSQL after {max_retries} attempts: {e}')
                sys.exit(1)
    
    # Now ensure the target database exists
    db_url = f'postgresql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}'
    try:
        engine = create_engine(db_url, pool_pre_ping=True)
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
            if not result.fetchone():
                # Connect to postgres database to create the target database
                print(f'Creating database {db_name}...')
                admin_engine = create_engine(check_url)
                with admin_engine.connect() as admin_conn:
                    # Use autocommit for CREATE DATABASE
                    admin_conn.execute(text(f"CREATE DATABASE {db_name}"))
                    admin_conn.commit()
                print(f'Database {db_name} created successfully')
            else:
                print(f'Database {db_name} already exists')
    except Exception as e:
        # If we can connect to the database, it exists (or connection failed for other reasons)
        try:
            # Try to connect to the target database directly
            test_engine = create_engine(db_url, pool_pre_ping=True)
            with test_engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            print(f'Database {db_name} is accessible')
        except Exception as create_error:
            print(f'Warning: Could not ensure database exists: {create_error}')
            # Don't fail here, let the application try to connect
    
    print('Database check complete')
    return 0

if __name__ == '__main__':
    sys.exit(main())

