import sqlite3
from datetime import date

def calculate_age(birth_date: date) -> int:
    today = date.today()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

def migrate():
    # Connect to the database
    conn = sqlite3.connect('cadastro.db')
    cursor = conn.cursor()

    try:
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(people)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'idade' not in columns:
            # Add the new column
            cursor.execute("ALTER TABLE people ADD COLUMN idade INTEGER")
            
            # Update existing records with calculated ages
            cursor.execute("SELECT id, birth_date FROM people")
            records = cursor.fetchall()
            
            for id, birth_date_str in records:
                birth_date = date.fromisoformat(birth_date_str)
                age = calculate_age(birth_date)
                cursor.execute("UPDATE people SET idade = ? WHERE id = ?", (age, id))
            
            conn.commit()
            print("Migration completed successfully!")
        else:
            print("Column 'idade' already exists.")
    
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate() 