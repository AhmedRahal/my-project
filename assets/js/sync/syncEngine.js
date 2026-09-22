import { syncRequest } from "../api/core.js";
import { apiUrl } from "../api/config.js";
import { showNotification } from "../ui/notification.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { getPendingActions, clearQueuedAction } from "../utils/offlineQueue.js";
import { getDirtyNotes, markNotesSynced } from "../db/notesLocal.js";
export async function syncOfflineNotes() {
	const user = getFromLocalStorage("loggedInUser");
	if (!user) return;

	const dirtyNotes = await getDirtyNotes();
	if (dirtyNotes.length === 0) return;

	console.log(`Syncing ${dirtyNotes.length} offline notes...`);

	try {
		await syncRequest({
			endpoint: "notes/bulk",
			method: "POST",
			body: { notes: dirtyNotes, overrideExisting: false },
			requiresAuth: true,
		});
		const ids = dirtyNotes.map((n) => n.noteId);
		await markNotesSynced(ids);

		showNotification(
			"success",
			`${dirtyNotes.length} offline note${dirtyNotes.length === 1 ? "" : "s"} synced successfully!`,
		);

		const { getNotesForUser } = await import("../api/notes.js");
		getNotesForUser();
	} catch (error) {
		console.error("Offline note sync failed, will retry later:", error);
		showNotification("warning", "Couldn't sync your offline notes yet — will retry automatically.");
	}
}

async function replayProfileUpdate(action) {
	const user = getFromLocalStorage("loggedInUser");
	const formData = new FormData();

	if (action.body?.username) formData.append("username", action.body.username);

	if (action.body?.imageBase64) {
		const blob = await (await fetch(action.body.imageBase64)).blob();
		formData.append("image", blob, action.body.imageName || "avatar.png");
	}

	const response = await fetch(`${apiUrl}auth/profile`, {
		method: "PUT",
		headers: { Authorization: `Bearer ${user.token}` },
		body: formData,
	});

	if (!response.ok) throw new Error("Profile sync failed");
}

export async function syncPendingActions() {
	const pending = await getPendingActions();
	if (!pending.length) return;

	let successCount = 0;

	for (const action of pending) {
		try {
			if (action.endpoint === "auth/profile" && action.body?.imageBase64 !== undefined) {
				await replayProfileUpdate(action);
			} else {
				await syncRequest({
					endpoint: action.endpoint,
					method: action.method,
					body: action.body,
					requiresAuth: !!action.requiresAuth,
				});
			}
			await clearQueuedAction(action.id);
			successCount++;
		} catch (error) {
			console.error(`Failed to sync queued action "${action.label}":`, error);
			break;
		}
	}

	if (successCount > 0) {
		showNotification(
			"success",
			`Synced ${successCount} change${successCount === 1 ? "" : "s"} made while you were offline.`,
		);
	}
}

export async function syncAll() {
	await syncOfflineNotes();
	await syncPendingActions();
}
