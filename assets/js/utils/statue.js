import { showNotification } from "../ui/notification.js";
export function checkStatus(message = null, displayMessage = true) {
	if (navigator.onLine) {
		displayMessage
			? showNotification(
					"success",
					message ||
						"You are online. You can sync your notes with the server.",
				)
			: true;
		return true;
	} else {
		displayMessage
			? showNotification(
					"warning",
					message ||
						"You are in offline mode. All changes will be saved locally and synced when back online.",
				)
			: false;
		return false;
	}
}
