const Database = require("better-sqlite3");

function columnExists(db, table, column) {
    return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
}

function initializeDatabase(dbPath) {
    const db = new Database(dbPath);

    db.prepare(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT
    )`).run();

    // Legacy/unused — nothing in the app reads or writes this. Safe to drop
    // later; left as-is for now so this change stays scoped to the offline work.
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, image TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS notes (
        noteId TEXT PRIMARY KEY, userId INTEGER, title TEXT, content TEXT,
        tags TEXT, isPinned INTEGER, createdAt TEXT, updatedAt TEXT,
        isDirty INTEGER DEFAULT 0, isNew INTEGER DEFAULT 0
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS pending_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        endpoint TEXT,
        method TEXT,
        body TEXT,
        requiresAuth INTEGER DEFAULT 1,
        label TEXT,
        createdAt TEXT,
        failCount INTEGER DEFAULT 0
    )`).run();

    // Caches accounts that have successfully logged in on this device, so the
    // login screen can offer "continue as X" without needing a network call.
    db.prepare(`CREATE TABLE IF NOT EXISTS cached_accounts (
        userId INTEGER PRIMARY KEY,
        username TEXT,
        image TEXT,
        token TEXT,
        lastActiveAt TEXT
    )`).run();

    // --- Migrations for DBs created before this update ---
    // CREATE TABLE IF NOT EXISTS above only applies to brand-new installs;
    // anyone who already has a nurov.db from before needs these columns
    // added explicitly, or the app will throw "no such column" the first
    // time it tries to read/write isNew or failCount.
    if (!columnExists(db, "notes", "isNew")) {
        db.prepare(`ALTER TABLE notes ADD COLUMN isNew INTEGER DEFAULT 0`).run();
    }
    if (!columnExists(db, "pending_actions", "failCount")) {
        db.prepare(`ALTER TABLE pending_actions ADD COLUMN failCount INTEGER DEFAULT 0`).run();
    }

    db.close();
}
module.exports = { initializeDatabase };