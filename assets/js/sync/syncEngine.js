import { syncRequest } from "../api/core.js";
import { apiUrl } from "../api/config.js";
import { showNotification } from "../ui/notification.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { getPendingActions, clearQueuedAction } from "../utils/offlineQueue.js";
import { getDirtyNotes, markNotesSynced } from "../db/notesLocal.js";

// Syncs notes that were created/edited offline (stored in the local SQLite
// notes table with isDirty = 1). Only marks them synced if the request to
// the backend actually succeeds — syncRequest() throws on any real failure
// (network error, non-2xx response), unlike apiRequest(), so a backend
// that's still down (or rejects the batch) correctly leaves isDirty alone
// and we retry next time instead of losing the notes.
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
			// ⚠️ overrideExisting MUST be false here. This is a silent
			// background sync of whatever's currently dirty locally — it is
			// NOT the full picture of everything the user owns on the
			// server. Sending true here wipes out every note not included
			// in this particular batch. overrideExisting:true should only
			// ever be sent from a feature the user explicitly and knowingly
			// triggers (e.g. "import and replace my notes"), never from an
			// automatic sync.
			body: { notes: dirtyNotes, overrideExisting: false },
			requiresAuth: true,
		});

		// Only reached if the request actually succeeded.
		const ids = dirtyNotes.map((n) => n.noteId);
		await markNotesSynced(ids);

		showNotification(
			"success",
			`${dirtyNotes.length} offline note${dirtyNotes.length === 1 ? "" : "s"} synced successfully!`,
		);

		const { getNotesForUser } = await import("../api/notes.js");
		getNotesForUser();
	} catch (error) {
		// Genuinely failed — leave isDirty as-is so this retries next time
		// instead of being silently dropped.
		console.error("Offline note sync failed, will retry later:", error);
		showNotification("warning", "Couldn't sync your offline notes yet — will retry automatically.");
	}
}

// Replays a queued profile update (username and/or avatar image) as a real
// multipart request — the generic queue stores the image as base64 text, so
// it has to be turned back into a Blob before it can be uploaded. Uses raw
// fetch (not syncRequest) because this one needs FormData, not JSON — but
// it still throws on failure the same way, which is what matters here.
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

// Flushes the generic offline queue — everything that got auto-queued by
// apiRequest() (or explicitly queued, like profile updates) while offline.
// Same fix as above: uses syncRequest() so a failed replay actually stops
// the loop and leaves the remaining queue intact, instead of apiRequest()
// silently treating a failed attempt as "done" and deleting it anyway.
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
			// Stop here — leave this one (and anything queued after it) in
			// place so we retry the whole batch, in order, next time. This
			// used to keep going and delete the item anyway because
			// apiRequest() swallowed the error — that was the "queue isn't
			// working" bug.
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

// Convenience entry point for "we just came back online" — flushes both
// queues so nothing needs to be called separately.
export async function syncAll() {
	await syncOfflineNotes();
	await syncPendingActions();
}
