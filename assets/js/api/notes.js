import { createNotes } from "../ui/notesUi/noteList.js";
import { showNotification } from "../ui/notification.js";
import { apiUrl } from "./config.js";
import { handleApiError } from "./errorHandler.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";

const getUrl = (endpoint) => {
	const base = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
	const cleanEndpoint = endpoint.startsWith("/")
		? endpoint.slice(1)
		: endpoint;
	return `${base}${cleanEndpoint}`;
};

export async function getNotesForUser(token) {
	try {
		startLoading({ fullscreen: true, message: "Loading notes..." });
		const response = await fetch(getUrl("notes"), {
			//
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw errorData;
		}
		const notes = await response.json();
		createNotes(notes);
	} catch (error) {
		handleApiError(error);
	} finally {
		stopLoading();
	}
}

// add note
export async function sendNoteToBackend(note, token) {
	try {
		const response = await fetch(getUrl("notes"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(note),
		});
		const data = await response.json();
		if (!response.ok) throw data;

		showNotification("success", "Note saved successfully");
		return data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
}
// delete note
export function deleteNote(noteId, token) {
	fetch(getUrl(`notes/${noteId}`), {
		//
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	})
		.then((response) => {
			if (!response.ok) {
				console.error(
					`Failed to delete note with id ${noteId}. Status: ${response.status}`,
				);
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			if (data.success) {
				showNotification("success", "Note deleted successfully");
				console.log(
					`Note with id ${noteId} deleted successfully.`,
					data,
				);
				getNotesForUser(token);
			} else {
				showNotification(
					"error",
					data.error || "Failed to delete note",
				);
			}
		})
		.catch((error) => {
			console.error("Error deleting note:", error);
			showNotification(
				"error",
				error.message || "An error occurred while deleting the note",
			);
		});
}

// update note
export async function updateNote(noteId, updatedNote, token) {
	try {
		const response = await fetch(getUrl(`notes/${noteId}`), {
			//  Fixed typo and slash
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updatedNote),
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw errorData;
		}
		const data = await response.json();
		console.log("Note updated successfully:", data);
		showNotification("success", "Note updated successfully");
		getNotesForUser(token);
	} catch (error) {
		handleApiError(error);
	}
}

export async function addnotes(notes, overrideExisting, token) {
	try {
		const response = await fetch(getUrl("notes/bulk"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ notes, overrideExisting }),
		});
		const data = await response.json();
		if (!response.ok) throw data;
		return data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
}
