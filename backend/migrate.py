import sqlite3
import os

def migrate():
    # Connect to the database
    conn = sqlite3.connect('cadastro.db')
    cursor = conn.cursor()

    try:
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(people)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'pulseira_numero' not in columns:
            # Add the new column
            cursor.execute("ALTER TABLE people ADD COLUMN pulseira_numero TEXT")
            
            # Update existing records with default values
            cursor.execute("SELECT id FROM people ORDER BY id")
            ids = cursor.fetchall()
            
            for i, (id,) in enumerate(ids, 1):
                cursor.execute("UPDATE people SET pulseira_numero = ? WHERE id = ?", (f"#{i}", id))
            
            conn.commit()
            print("Migration completed successfully!")
        else:
            print("Column 'pulseira_numero' already exists.")
    
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate() 