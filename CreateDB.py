import sqlite3

def create_database():
    conn = sqlite3.connect('mystic.db')
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS tarot_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spread_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS horoscope_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS test_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS section_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL
    )''')

    # Тестовые данные (раскомментируйте для использования)
    c.execute("INSERT INTO tarot_clicks (spread_id, timestamp, device_id) VALUES (?, ?, ?)", ("daily", "2025-09-28T00:00:00Z", "test-device"))
    c.execute("INSERT INTO horoscope_clicks (type, timestamp, device_id) VALUES (?, ?, ?)", ("horoscope_today", "2025-09-28T00:00:00Z", "test-device"))
    c.execute("INSERT INTO test_clicks (test_id, timestamp, device_id) VALUES (?, ?, ?)", ("strengths", "2025-09-28T00:00:00Z", "test-device"))
    c.execute("INSERT INTO subscriptions (amount, timestamp, device_id) VALUES (?, ?, ?)", (990, "2025-09-28T00:00:00Z", "test-device"))
    c.execute("INSERT INTO section_clicks (section, timestamp, device_id) VALUES (?, ?, ?)", ("index", "2025-09-28T00:00:00Z", "test-device"))
    c.execute("INSERT INTO actions (action, timestamp, device_id) VALUES (?, ?, ?)", ("logout", "2025-09-28T00:00:00Z", "test-device"))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_database()