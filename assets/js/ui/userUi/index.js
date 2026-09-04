import { handlesNotesUI } from "../notesUi/index.js";
import { switchView } from "./profileView.js";
import { renderGuestUi } from "./guestUi.js";
import { renderAuthHeader } from "./authHeaderUi.js";
import { initAccountSettings } from "./accountSettings.js";
import { getFromLocalStorage } from "../../utils/storage.js";
export { inputImageHandler } from "./imageInput.js";

export async function handlesUserUI(loggedInUser) {
	// getFromLocalStorage returns null when "settings" hasn't been saved
	// yet (e.g. a fresh install) — fall back to {} so .currentView doesn't
	// throw on the very first launch.
	const settings = getFromLocalStorage("settings") || {};
	const view = settings.currentView || "notes";
	switchView(view);
	await handlesNotesUI(loggedInUser);

	if (!loggedInUser) {
		renderGuestUi();
	} else {
		renderAuthHeader(loggedInUser);
		await initAccountSettings(loggedInUser);
	}
}
