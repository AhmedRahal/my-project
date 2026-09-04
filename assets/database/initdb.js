const fs = require("fs");
const Database = require("better-sqlite3");

// Initialize and setup the SQLite database
function initializeDatabase(dbPath) {
	try {
		// better-sqlite3 opens synchronously and throws errors if it fails
		const db = new Database(dbPath);
		console.log("Database connected at:", dbPath);

		// Create a sample settings table using .prepare() and .run()
		db.prepare(
			`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                value TEXT
            )
        `,
		).run();

		console.log("Default table 'settings' verified/created.");

		// If you only want to initialize and close right away:
		db.close();
	} catch (err) {
		console.error("Error creating/opening database:", err.message);
	}
}

module.exports = {
	initializeDatabase,
};
