import { getFromLocalStorage } from "./storage.js";

/**
 * Saves a failed request locally so it can be replayed once the backend is
 * reachable again. Used automatically by apiRequest() for any endpoint that
 * doesn't define its own offlineFallback.
 */
export async function queueAction({ endpoint, method, body, requiresAuth = true, label }) {
	const user = getFromLocalStorage("loggedInUser");
	return await window.api.dbQueueAction({
		userId: user?.userId ?? null,
		endpoint,
		method,
		body,
		requiresAuth,
		label,
	});
}

export async function getPendingActionsCount() {
	const user = getFromLocalStorage("loggedInUser");
	return await window.api.dbCountQueuedActions(user?.userId);
}

export async function getPendingActions() {
	const user = getFromLocalStorage("loggedInUser");
	return await window.api.dbGetQueuedActions(user?.userId);
}

export async function clearQueuedAction(id) {
	return await window.api.dbClearQueuedAction(id);
}
