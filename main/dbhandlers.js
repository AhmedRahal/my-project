const { ipcMain } = require("electron");
const { getDb } = require("./database.js");
const { v4: uuidv4 } = require("uuid");

function registerDbHandlers() {
    const db = getDb();
    ipcMain.handle("db:bump-action-fail-count", (event, id) => {
    db.prepare("UPDATE pending_actions SET failCount = failCount + 1 WHERE id = ?").run(id);
    return db.prepare("SELECT failCount FROM pending_actions WHERE id = ?").get(id)?.failCount ?? 0;
});
    ipcMain.handle("db:cache-note", (event, note) => {
        // Mirrors an already-synced note into local SQLite as a read cache.
        // The WHERE isDirty = 0 guard means: if this note has local unsynced
        // edits pending, don't clobber them with a stale "online" copy.
        const stmt = db.prepare(`
            INSERT INTO notes (noteId, userId, title, content, tags, isPinned, createdAt, updatedAt, isDirty)
            VALUES (@noteId, @userId, @title, @content, @tags, @isPinned, @createdAt, @updatedAt, 0)
            ON CONFLICT(noteId) DO UPDATE SET
            title=@title, content=@content, tags=@tags, isPinned=@isPinned, updatedAt=@updatedAt
            WHERE isDirty = 0
        `);
        stmt.run({
            ...note,
            tags: JSON.stringify(note.tags || []),
            isPinned: note.isPinned ? 1 : 0, // SQLite can't bind a boolean
        });
        return { success: true, noteId: note.noteId };
    });

    ipcMain.handle("db:cache-notes-bulk", (event, notes) => {
        const insert = db.prepare(`
            INSERT INTO notes (noteId, userId, title, content, tags, isPinned, createdAt, updatedAt, isDirty)
            VALUES (@noteId, @userId, @title, @content, @tags, @isPinned, @createdAt, @updatedAt, 0)
            ON CONFLICT(noteId) DO UPDATE SET
            title=@title, content=@content, tags=@tags, isPinned=@isPinned, updatedAt=@updatedAt
            WHERE isDirty = 0
        `);
        const insertMany = db.transaction((rows) => {
            for (const note of rows) {
                insert.run({
                    ...note,
                    tags: JSON.stringify(note.tags || []),
                    isPinned: note.isPinned ? 1 : 0, // SQLite can't bind a boolean
                });
            }
        });
        insertMany(notes);
        return { 
            success: true, 
            noteIds: notes.map(n => n.noteId) 
        };
    });

ipcMain.handle("db:delete-note-local", (event, noteId) => {
    db.prepare("DELETE FROM notes WHERE noteId = ?").run(noteId);
    db.prepare("DELETE FROM pending_actions WHERE json_extract(body, '$.noteId') = ?").run(noteId);
    return { success: true, noteId };
});
    ipcMain.handle("db:count-dirty-notes", (event, userId) => {
    const row = userId
        ? db.prepare("SELECT COUNT(*) as count FROM notes WHERE userId = ? AND isDirty = 1").get(userId)
        : db.prepare("SELECT COUNT(*) as count FROM notes WHERE isDirty = 1").get();
    return row.count;
});
    // Get all notes for a user
    ipcMain.handle("db:get-notes", (event, userId) => {
        return db.prepare("SELECT * FROM notes WHERE userId = ?").all(userId);
    });

    // Save/Update a note locally (offline create/edit — flags isDirty=1 so it syncs later)
ipcMain.handle("db:save-note", (event, note) => {
    const noteToSave = {
        ...note,
        noteId: note.noteId || uuidv4(),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNew: note.isNew ? 1 : 0,
    };
    const stmt = db.prepare(`
        INSERT INTO notes (noteId, userId, title, content, tags, isPinned, createdAt, updatedAt, isDirty, isNew)
        VALUES (@noteId, @userId, @title, @content, @tags, @isPinned, @createdAt, @updatedAt, 1, @isNew)
        ON CONFLICT(noteId) DO UPDATE SET
        title=@title, content=@content, tags=@tags, isPinned=@isPinned, updatedAt=@updatedAt, isDirty=1
    `); // isNew intentionally NOT touched on conflict — preserves whether this note ever synced before
    stmt.run({ ...noteToSave, tags: JSON.stringify(noteToSave.tags), isPinned: noteToSave.isPinned ? 1 : 0 });
    return { success: true, noteId: noteToSave.noteId };
});
    ipcMain.handle("db:get-dirty-notes", () => {
        return db.prepare("SELECT * FROM notes WHERE isDirty = 1").all();
    });

ipcMain.handle("db:mark-synced", (event, noteIds) => {
    const placeholders = noteIds.map(() => '?').join(',');
    db.prepare(`UPDATE notes SET isDirty = 0, isNew = 0 WHERE noteId IN (${placeholders})`).run(...noteIds);
    return { success: true, noteIds };
});

    // ---- Generic offline queue (any endpoint, not just notes) ----

    ipcMain.handle("db:queue-action", (event, action) => {
        const stmt = db.prepare(`
            INSERT INTO pending_actions (userId, endpoint, method, body, requiresAuth, label, createdAt)
            VALUES (@userId, @endpoint, @method, @body, @requiresAuth, @label, @createdAt)
        `);
        
        // If this is a note creation action without a noteId, generate one
        let actionBody = action.body;
        if (actionBody && typeof actionBody === 'object' && actionBody.noteId === undefined) {
            // Check if this looks like a note creation (has title/content)
            if (actionBody.title !== undefined || actionBody.content !== undefined) {
                actionBody = { ...actionBody, noteId: uuidv4() };
            }
        }
        
        const info = stmt.run({
            userId: action.userId ?? null,
            endpoint: action.endpoint,
            method: action.method,
            body: JSON.stringify(actionBody ?? null),
            requiresAuth: action.requiresAuth ? 1 : 0,
            label: action.label ?? action.endpoint,
            createdAt: new Date().toISOString(),
        });
        
        // Extract noteId from body if present
        let noteId = null;
        if (actionBody && typeof actionBody === 'object' && actionBody.noteId) {
            noteId = actionBody.noteId;
        }
        
        return { id: info.lastInsertRowid, noteId };
    });

    ipcMain.handle("db:get-queued-actions", (event, userId) => {
        const rows = userId
            ? db.prepare("SELECT * FROM pending_actions WHERE userId = ? ORDER BY id ASC").all(userId)
            : db.prepare("SELECT * FROM pending_actions ORDER BY id ASC").all();

        // body was stored as a JSON string — hand it back as a real object
        return rows.map((r) => ({ ...r, body: JSON.parse(r.body || "null") }));
    });

    ipcMain.handle("db:clear-queued-action", (event, id) => {
        db.prepare("DELETE FROM pending_actions WHERE id = ?").run(id);
        return { success: true };
    });

    ipcMain.handle("db:count-queued-actions", (event, userId) => {
        const row = userId
            ? db.prepare("SELECT COUNT(*) as count FROM pending_actions WHERE userId = ?").get(userId)
            : db.prepare("SELECT COUNT(*) as count FROM pending_actions").get();
        return row.count;
    });
}
module.exports = { registerDbHandlers };