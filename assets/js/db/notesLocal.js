// Every direct window.api.db*Note* IPC call lives here, in one place, instead
// of scattered across notes.js and the sync engine.

export async function getLocalNotes(userId) {
	const rows = await window.api.dbGetNotes(userId);
	return rows.map((n) => ({ ...n, tags: JSON.parse(n.tags || "[]") }));
}

export async function saveLocalNote(note) {
	return await window.api.dbSaveNote(note);
}

export async function deleteLocalNote(noteId) {
	return await window.api.dbDeleteNoteLocal(noteId);
}

export async function getDirtyNotes() {
	const rows = await window.api.dbGetDirtyNotes();
	return rows.map((n) => ({ ...n, tags: JSON.parse(n.tags || "[]") }));
}

export async function markNotesSynced(noteIds) {
	return await window.api.dbMarkSynced(noteIds);
}

// Mirrors already-synced (online) notes into the local cache, so they're
// available the next time the app goes offline — this is a read cache, not
// something that needs syncing back, hence the separate cache-* IPC calls.
export async function cacheNote(note) {
	return await window.api.dbCacheNote(note);
}

export async function cacheNotesBulk(notes) {
	return await window.api.dbCacheNotesBulk(notes);
}
