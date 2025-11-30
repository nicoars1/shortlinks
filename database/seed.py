import sqlite3 as sql


DB_PATH = "C:/Users/nicol/Desktop/shortUrl/database/"


def createDB():
    conn = sql.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(""" CREATE TABLE links (
                   id integer,
                   original_url text,
                   short_code text,
                   created_at integer,
                   clicks integer,
                   user_id text
                   )""")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    createDB()