const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { initializeDatabase } = require("../assets/database/initdb.js");

let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        const dbDir = path.join(app.getPath("userData"), "nurov");
        const dbPath = path.join(dbDir, "nurov.db");
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
        
        initializeDatabase(dbPath); // Ensure tables exist
        dbInstance = new Database(dbPath);
    }
    return dbInstance;
}

// Add this back so main/index.js can call it
function setupDatabase() {
    return getDb(); 
}

module.exports = { getDb, setupDatabase };