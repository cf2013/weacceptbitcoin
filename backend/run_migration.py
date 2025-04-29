import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load environment variables
load_dotenv()

def run_migration():
    """Run the migration to add the user_pubkey column to the reviews table."""
    try:
        # Get database connection details from environment variables
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("Error: DATABASE_URL environment variable not set")
            sys.exit(1)
            
        # Connect to the database
        conn = psycopg2.connect(db_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Read the migration SQL file
        migration_path = os.path.join(os.path.dirname(__file__), "migrations", "add_user_pubkey_to_reviews.sql")
        with open(migration_path, "r") as f:
            migration_sql = f.read()
            
        # Execute the migration
        print("Running migration: add_user_pubkey_to_reviews.sql")
        cursor.execute(migration_sql)
        
        print("Migration completed successfully")
        
    except Exception as e:
        print(f"Error running migration: {str(e)}")
        sys.exit(1)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    run_migration() 