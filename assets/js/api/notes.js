import { apiRequest } from "./core.js";
import { createNotes } from "../ui/notesUi/noteList.js";
import { showNotification } from "../ui/notification.js";
import { getFromLocalStorage } from "../utils/storage.js";
import {
	getLocalNotes,
	saveLocalNote,
	deleteLocalNote,
	cacheNotesBulk,
} from "../db/notesLocal.js";

// GET Notes
export async function getNotesForUser() {
	const user = getFromLocalStorage("loggedInUser");
	if (!user) return [];

	const data = await apiRequest({
		endpoint: "notes",
		method: "GET",
		fullscreenLoad: true,
		loadMessage: "Loading your notes...",
		offlineFallback: async () => {
			const parsed = await getLocalNotes(user.userId);
			createNotes(parsed);
			return parsed;
		}
	});

	createNotes(data);

	// Cache what we just fetched, so it's available next time we're offline.
	if (Array.isArray(data) && data.length) {
		cacheNotesBulk(data.map(n => ({ ...n, userId: user.userId })));
	}

	return data;
}

// POST Note
export async function sendNoteToBackend(note) {
	const user = getFromLocalStorage("loggedInUser");

	return await apiRequest({
		endpoint: "notes",
		method: "POST",
		body: note,
		loadingBtn: "save-note-btn",
		// Offline Fallback: Save to SQLite (flagged isDirty — synced later
		// as part of the notes-specific bulk sync in syncEngine.js)
		offlineFallback: async ({ body }) => {
			if (!user) throw new Error("Not logged in");
			// Generate the ID ONCE, here, and use it for both the SQLite row
			// and the value handed back to the UI. Previously these were two
			// separate random IDs (db:save-note generated its own server-side,
			// while this returned a different crypto.randomUUID()) — meaning
			// a note created offline was tracked under two different IDs, so
			// editing it before a full refresh created a second row instead
			// of updating the first. That's what caused it to show up twice
			// once synced to the backend.
			const noteId = crypto.randomUUID();
			await saveLocalNote({ ...body, noteId, userId: user.userId });
			showNotification("info", "Saved offline — this note will sync automatically once you're back online.");
			return { noteId, success: true };
		}
	});
}

// DELETE Note
export async function deleteNote(noteId) {
	// Delete locally right away, so the UI feels responsive regardless of
	// connectivity...
	await deleteLocalNote(noteId);

	// ...and let apiRequest's built-in generic offline queue handle the real
	// DELETE if we're offline — no custom offlineFallback needed here. (This
	// used to be a no-op console.log that never queued anything, so an
	// offline delete would silently reappear once you reconnected and the
	// app re-fetched from the still-untouched backend.)
	await apiRequest({
		endpoint: `notes/${noteId}`,
		method: "DELETE",
		label: "Delete note",
	});

	getNotesForUser();
}

// UPDATE Note
export async function updateNote(noteId, updatedNote) {
	const user = getFromLocalStorage("loggedInUser");

	await apiRequest({
		endpoint: `notes/${noteId}`,
		method: "PUT",
		body: updatedNote,
		loadingBtn: "save-note-btn", // Reusing save btn for update
		offlineFallback: async ({ body }) => {
			if (!user) throw new Error("Not logged in");
			await saveLocalNote({ ...body, userId: user.userId });
			showNotification("info", "Updated offline — this will sync automatically once you're back online.");
			return { success: true };
		}
	});

	getNotesForUser();
}

// BULK Import
export async function addnotes(notes, overrideExisting) {
	return await apiRequest({
		endpoint: "notes/bulk",
		method: "POST",
		body: { notes, overrideExisting },
		fullscreenLoad: true,
		loadMessage: "Importing notes...",
		label: "Import notes",
	});
}

// Re-exported so anything already importing { syncAll, syncOfflineNotes,
// syncPendingActions } from "./notes.js" keeps working unchanged — the
// actual implementation now lives in sync/syncEngine.js.
export { syncAll, syncOfflineNotes, syncPendingActions } from "../sync/syncEngine.js";
