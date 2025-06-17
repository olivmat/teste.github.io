import sqlite3

conn = sqlite3.connect('cadastro.db')
cursor = conn.cursor()

try:
    cursor.execute("UPDATE people SET pulseira_numero = '#1' WHERE name = 'Teste'")
    conn.commit()
    print("pulseira_numero da criança 'Teste' atualizado para #1 com sucesso!")
except Exception as e:
    print(f"Erro ao atualizar: {e}")
    conn.rollback()
finally:
    conn.close() 