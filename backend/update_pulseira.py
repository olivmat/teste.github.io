import sqlite3

def update_pulseira():
    # Connect to the database
    conn = sqlite3.connect('cadastro.db')
    cursor = conn.cursor()

    try:
        # Get all records ordered by id
        cursor.execute("SELECT id FROM people ORDER BY id")
        records = cursor.fetchall()
        
        # Update each record with a sequential number
        for i, (id,) in enumerate(records, 1):
            pulseira_numero = f"#{i}"
            cursor.execute("UPDATE people SET pulseira_numero = ? WHERE id = ?", (pulseira_numero, id))
        
        conn.commit()
        print(f"Successfully updated {len(records)} records with new pulseira numbers!")
    
    except Exception as e:
        print(f"Error during update: {str(e)}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    update_pulseira() 