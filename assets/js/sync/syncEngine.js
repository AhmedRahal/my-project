import { syncRequest, isConnectivityFailure } from "../api/core.js";
import { apiUrl } from "../api/config.js";
import { showNotification } from "../ui/notification.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { getPendingActions, clearQueuedAction } from "../utils/offlineQueue.js";
import { getDirtyNotes, markNotesSynced } from "../db/notesLocal.js";

const MAX_ACTION_RETRIES = 5;

export async function syncOfflineNotes() {
	const user = getFromLocalStorage("loggedInUser");
	if (!user) return;

	const dirtyNotes = await getDirtyNotes();
	if (dirtyNotes.length === 0) return;

	console.log(`Syncing ${dirtyNotes.length} offline notes...`);

	// Notes created entirely offline (never existed on the server) go through
	// bulk-create. Notes that already existed and were edited offline go
	// through an individual PUT so they always overwrite — same as a normal
	// online edit — instead of silently being skipped by overrideExisting:false.
	const newNotes = dirtyNotes.filter((n) => n.isNew);
	const editedNotes = dirtyNotes.filter((n) => !n.isNew);
	const synced = [];

	try {
		if (newNotes.length) {
			await syncRequest({
				endpoint: "notes/bulk",
				method: "POST",
				body: { notes: newNotes, overrideExisting: false },
				requiresAuth: true,
			});
			synced.push(...newNotes.map((n) => n.noteId));
		}

		for (const note of editedNotes) {
			await syncRequest({
				endpoint: `notes/${note.noteId}`,
				method: "PUT",
				body: note,
				requiresAuth: true,
			});
			synced.push(note.noteId);
		}

		await markNotesSynced(synced);

		showNotification(
			"success",
			`${synced.length} offline note${synced.length === 1 ? "" : "s"} synced successfully!`,
		);

		const { getNotesForUser } = await import("../api/notes.js");
		getNotesForUser();
	} catch (error) {
		// Whatever made it into `synced` before the failure actually succeeded —
		// mark those synced so a later retry doesn't redo them.
		if (synced.length) await markNotesSynced(synced);
		console.error("Offline note sync failed, will retry later:", error);
		showNotification("warning", "Couldn't sync all your offline notes yet — will retry automatically.");
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
	let droppedCount = 0;

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
			if (isConnectivityFailure(error)) {
				// We're genuinely offline again — stop here, everything still
				// queued (including this one) gets retried next sync cycle.
				console.error("Sync stopped — connection lost mid-sync:", error);
				break;
			}

			// Not a connectivity issue — a real server-side rejection. Don't let
			// one broken action block everything queued behind it: bump its
			// fail count and move on to the next action.
			const fails = await window.api.dbBumpActionFailCount(action.id);
			console.error(`Failed to sync queued action "${action.label}" (attempt ${fails}):`, error);

			if (fails >= MAX_ACTION_RETRIES) {
				await clearQueuedAction(action.id);
				droppedCount++;
			}
		}
	}

	if (successCount > 0) {
		showNotification(
			"success",
			`Synced ${successCount} change${successCount === 1 ? "" : "s"} made while you were offline.`,
		);
	}

	if (droppedCount > 0) {
		showNotification(
			"warning",
			`${droppedCount} queued change${droppedCount === 1 ? "" : "s"} couldn't be synced and ${droppedCount === 1 ? "was" : "were"} discarded.`,
		);
	}
}

export async function syncAll() {
	await syncOfflineNotes();
	await syncPendingActions();
}