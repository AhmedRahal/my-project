import { handlesNotesUI } from "../notesUi/index.js";
import { switchView } from "./profileView.js";
import { renderGuestUi } from "./guestUi.js";
import { renderAuthHeader } from "./authHeaderUi.js";
import { initAccountSettings } from "./accountSettings.js";

export { inputImageHandler } from "./imageInput.js";

export async function handlesUserUI(loggedInUser) {
	switchView("notes");
	await handlesNotesUI(loggedInUser);

	if (!loggedInUser) {
		renderGuestUi();
	} else {
		renderAuthHeader(loggedInUser);
		await initAccountSettings(loggedInUser);
	}
}
