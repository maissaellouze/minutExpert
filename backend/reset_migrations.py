import os
import shutil
import psycopg2

print("1. Deleting migration files...")
apps = ['accounts', 'bookings', 'core', 'experts', 'payments', 'reviews', 'sessions']
base_dir = os.path.dirname(os.path.abspath(__file__))

for app in apps:
    mig_dir = os.path.join(base_dir, app, 'migrations')
    if os.path.exists(mig_dir):
        for filename in os.listdir(mig_dir):
            if filename != '__init__.py' and filename.endswith('.py'):
                os.remove(os.path.join(mig_dir, filename))
        # Delete pycache
        pycache = os.path.join(mig_dir, '__pycache__')
        if os.path.exists(pycache):
            shutil.rmtree(pycache)

print("2. Resetting Database Schema...")
try:
    conn = psycopg2.connect(
        dbname="minutexpert_db",
        user="admin",
        password="admin123",
        host="127.0.0.1",
        port="5432"
    )
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("DROP SCHEMA public CASCADE;")
    cursor.execute("CREATE SCHEMA public;")
    print("Database reset successfully.")
except Exception as e:
    print(f"Postgres Error: {e}")

print("Done. Now run makemigrations and migrate.")
