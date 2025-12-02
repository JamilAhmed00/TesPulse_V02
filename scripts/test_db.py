#!/usr/bin/env python3
"""Test database connection and configuration."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.core.database import test_database_connection, check_database_exists, engine
from sqlalchemy import text

def main():
    """Test database configuration and connection."""
    print("=" * 60)
    print("Database Configuration Test")
    print("=" * 60)
    
    # Show configuration
    print("\n📋 Configuration:")
    print(f"  DB Host: {settings.db_host}")
    print(f"  DB Port: {settings.db_port}")
    print(f"  DB User: {settings.db_user}")
    print(f"  DB Name: {settings.db_name}")
    print(f"  Database URL: {settings.get_database_url().split('@')[1] if '@' in settings.get_database_url() else 'hidden'}")
    
    # Test connection
    print("\n🔌 Testing Connection...")
    if test_database_connection():
        print("  ✅ Database connection successful!")
    else:
        print("  ❌ Database connection failed!")
        return 1
    
    # Check database exists
    print("\n📊 Checking Database...")
    if check_database_exists():
        print("  ✅ Database exists and is accessible!")
    else:
        print("  ❌ Database check failed!")
        return 1
    
    # Test query
    print("\n🔍 Testing Query...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version(), current_database()"))
            row = result.fetchone()
            version = row[0]
            db_name = row[1]
            print(f"  ✅ Query successful!")
            print(f"  Database: {db_name}")
            print(f"  Version: {version.split(',')[0]}")
    except Exception as e:
        print(f"  ❌ Query failed: {e}")
        return 1
    
    print("\n" + "=" * 60)
    print("✅ All database tests passed!")
    print("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())

