import { deleteAccount } from "../api/auth.js";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { showModal, closeAllModals } from "../ui/modals.js";
import { showNotification } from "../ui/notification.js";
import { showConfirm } from "../ui/confirmUi.js";
import { logout } from "../auth/logout.js";
import { handlesUserUI } from "../ui/userUi/index.js";
export function deleteAccountUI() {
	let token = null;
	token = getFromLocalStorage("userToken");
	if (token == null) {
		showNotification(
			"error",
			"you are not logged in or account has been deleted",
		);
		return;
	}
	showConfirm(
		"Delete Account",
		"Are you sure you want to delete your account?",
		async () => {
			await deleteAccount(token);
			showNotification("success", "Account deleted successfully");
			closeAllModals();
			logout(false);
		},
	);
}
