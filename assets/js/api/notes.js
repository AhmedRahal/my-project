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
	if (Array.isArray(data) && data.length) {
		cacheNotesBulk(data.map(n => ({ ...n, userId: user.userId })));
	}

	return data;
}


export async function sendNoteToBackend(note) {
	const user = getFromLocalStorage("loggedInUser");

	return await apiRequest({
		endpoint: "notes",
		method: "POST",
		body: note,
		loadingBtn: "save-note-btn",
		offlineFallback: async ({ body }) => {
			if (!user) throw new Error("Not logged in");
			const noteId = crypto.randomUUID();
			await saveLocalNote({ ...body, noteId, userId: user.userId });
			showNotification("info", "Saved offline — this note will sync automatically once you're back online.");
			return { noteId, success: true };
		}
	});
}


export async function deleteNote(noteId) {

	await deleteLocalNote(noteId);

	await apiRequest({
		endpoint: `notes/${noteId}`,
		method: "DELETE",
		label: "Delete note",
	});

	getNotesForUser();
}


export async function updateNote(noteId, updatedNote) {
	const user = getFromLocalStorage("loggedInUser");

	await apiRequest({
		endpoint: `notes/${noteId}`,
		method: "PUT",
		body: updatedNote,
		loadingBtn: "save-note-btn", 
		offlineFallback: async ({ body }) => {
			if (!user) throw new Error("Not logged in");
			await saveLocalNote({ ...body, userId: user.userId });
			showNotification("info", "Updated offline — this will sync automatically once you're back online.");
			return { success: true };
		}
	});

	getNotesForUser();
}


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

export { syncAll, syncOfflineNotes, syncPendingActions } from "../sync/syncEngine.js";
