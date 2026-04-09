import psycopg2

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
    print(f"Error: {e}")
