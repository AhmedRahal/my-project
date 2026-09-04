import { getFromLocalStorage } from "../../utils/storage.js";
import { showNotification } from "../notification.js";
import { showModal } from "../modals.js";
import { getNotesForUser } from "../../api/notes.js";
import { updateProfileUi } from "../../auth/accountdetails.js";
import { updatePasswordUI } from "../../auth/password.js";
import { initImportNotes } from "../exeternalFilesManager/noteImport.js";
import { exportNotes } from "../exeternalFilesManager/noteExport.js";
import {
	editUsernameInput,
	saveAccountBtn,
	updatePasswordBtn,
	exportDataBtn,
	importDataBtn,
	editAvatarInput,
	importDataModal,
} from "./dom.js";

export async function initAccountSettings(loggedInUser) {
	if (saveAccountBtn) {
		saveAccountBtn.onclick = () => {
			const updatedUsername = editUsernameInput.value.trim();
			if (!updatedUsername) {
				showNotification(
					"error",
					"Username field cannot be left blank.",
				);
				return;
			}
			//get an image file from the input
			const updatedAvatar = editAvatarInput.files[0];
			const sessionUser = getFromLocalStorage("loggedInUser");
			updateProfileUi(updatedUsername, updatedAvatar, sessionUser.token);
			showNotification(
				"success",
				"Account details updated successfully!",
			);
		};
	}

	if (updatePasswordBtn) {
		updatePasswordBtn.onclick = () => {
			const oldPassword = document.getElementById("old-password").value;
			const newPassword = document.getElementById("new-password").value;

			if (!oldPassword || !newPassword) {
				showNotification(
					"warning",
					"Please provide both old and new credentials.",
				);
				return;
			}
			updatePasswordUI(loggedInUser.token);
		};
	}

	if (exportDataBtn) {
		exportDataBtn.onclick = () => {
			let result = exportNotes();
			if (result) {
				showNotification("success", "Notes exported successfully!");
			} else {
				showNotification("error", "No notes found to export.");
			}
		};
	}

	if (importDataBtn) {
		importDataBtn.onclick = () => {
			showModal(importDataModal);
			initImportNotes();
		};

		await getNotesForUser(loggedInUser.token);
	}
}
