import { getFromLocalStorage } from "../../utils/storage.js";
import { showNotification } from "../notification.js";
import { closeModal } from "../modals.js";
import { addnotes, getNotesForUser } from "../../api/notes.js";
import { inputImageHandler } from "../userUi.js";

const importModal = document.getElementById("import-data-modal");
const cancelImportBtn = document.getElementById("cancel-import-btn");
const importNotesBtn = document.getElementById("import-notes-btn");
const importNotesFileInput = document.getElementById("import-notes-file");
const overrideExistingNotesCheckbox = document.getElementById(
	"override-existing-notes",
);

export function initImportNotes() {
	inputImageHandler(
		importNotesFileInput,
		document.querySelector(".import-file-name-display"),
	);

	cancelImportBtn?.addEventListener("click", () => {
		closeModal(importModal);
	});

	importNotesBtn?.addEventListener("click", handleImportClick);
}

async function handleImportClick() {
	const file = importNotesFileInput.files[0];

	if (!file) {
		showNotification("error", "Please select a JSON file to import.");
		return;
	}

	const reader = new FileReader();

	reader.onload = async function (e) {
		try {
			const data = JSON.parse(e.target.result);

			// Support both raw arrays [...] and wrapper objects { notes: [...] }
			const notesArray = Array.isArray(data) ? data : data.notes;

			if (!Array.isArray(notesArray)) {
				showNotification(
					"error",
					"Invalid JSON format. Expected an array of notes.",
				);
				return;
			}

			// Verify this matches your exact key name in localStorage ("token" vs "userToken")
			const token =
				getFromLocalStorage("token") ||
				getFromLocalStorage("userToken");
			const override = overrideExistingNotesCheckbox.checked;

			await addnotes(notesArray, override, token);

			showNotification("success", "Notes imported successfully.");
			closeModal(importModal);
			getNotesForUser(token);
		} catch (error) {
			showNotification("error", "Error processing JSON file.");
		}
	};

	reader.readAsText(file);
}
