import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { showNotification } from "./notification.js";
import { applyTheme } from "./theme.js";
import { handlesUserUI } from "./userUi/index.js";
export function loadSettings() {
	const savedSettings = getFromLocalStorage("settings");
	if (savedSettings) {
		applyTheme(savedSettings.darkMode);
	}

	const savedUser = getFromLocalStorage("loggedInUser");
	handlesUserUI(savedUser);
	console.log(savedUser);
}
