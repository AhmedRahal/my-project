const Database = require("better-sqlite3");

function initializeDatabase(dbPath) {
    const db = new Database(dbPath);
    db.prepare(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, image TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS notes (
        noteId TEXT PRIMARY KEY, userId INTEGER, title TEXT, content TEXT,
        tags TEXT, isPinned INTEGER, createdAt TEXT, updatedAt TEXT,
        isDirty INTEGER DEFAULT 0
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS pending_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        endpoint TEXT,
        method TEXT,
        body TEXT,
        requiresAuth INTEGER DEFAULT 1,
        label TEXT,
        createdAt TEXT
    )`).run();

    db.close();
}
module.exports = { initializeDatabase };
