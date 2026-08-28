import {
	saveToLocalStorage,
	getFromLocalStorage,
	removeLocalStorage,
} from "../utils/storage.js";
import { showNotification } from "../ui/notification.js";
import { handlesUserUI } from "../ui/userUi.js";
import { closeAllModals } from "../ui/modals.js";
export function logout(message = true) {
	localStorage.removeItem("userToken");
	removeLocalStorage(["notes", "userTags", "loggedInUser", "userToken"]);

	let loggedInUser = getFromLocalStorage("loggedInUser");
	handlesUserUI(loggedInUser);

	if (message) {
		showNotification("success", "Logged out successfully");
	}
	closeAllModals();
}
