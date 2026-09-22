
import { loadSettings } from "./js/ui/settings.js";
import { getFromLocalStorage, saveToLocalStorage } from "./js/utils/storage.js";
import { handlesUserUI } from "./js/ui/userUi/index.js";
import { showModal, closeAllModals } from "./js/ui/modals.js";
import { getNotesForUser } from "./js/api/notes.js";
import { triggerAddNoteModal } from "./js/ui/notesUi/addNote.js";
import { setupQuillInstances } from "./js/quill/instances.js";
import { applyTheme } from "./js/ui/theme.js";
import { initIPC } from "./js/electron/ipc.js";
import { checkBackendHealth } from "./js/api/client.js";
import { syncAll } from "./js/api/notes.js";
import { toggleFilterDropdown } from "./js/ui/search.js";
import { initToolbar } from "./js/ui/toolbar/main.js";
import { settings } from "./js/ui/config.js";
const overlay = document.getElementById("overlay");
const settingsBtn = document.querySelector("header .settings-menu");
const settingsDropdown = document.querySelector("header .settings-dropdown");
const darkModeToggle = document.querySelector(
	"header .settings-dropdown #dark-mode .toggle input",
);

overlay.addEventListener("click", () => {
	closeAllModals();
});

settingsBtn.addEventListener("click", (e) => {
	e.stopPropagation();
	showModal(settingsDropdown, { fromEvent: "settingsBtn" });
});

darkModeToggle.addEventListener("change", () => {
	settings.darkMode = darkModeToggle.checked;
	applyTheme(settings.darkMode);
	saveToLocalStorage("settings", settings);
});
loadSettings();
triggerAddNoteModal();
toggleFilterDropdown();

window.addEventListener("DOMContentLoaded", async () => {
	initToolbar();
	initIPC();
	await checkBackendHealth(true);

	setupQuillInstances().catch((err) => {
		console.error(
			"Delayed Quill engine initialization failed completely: ",
			err,
		);
	});
});


window.addEventListener("backend-status-change", (e) => {
	if (e.detail.online) {
		syncAll();
	}
});

window.addEventListener("online", () => {
	console.log("🌐 Network status: Online");
	checkBackendHealth(true);
});

window.addEventListener("offline", () => {
	checkBackendHealth(true);
});
setInterval(() => {
	checkBackendHealth();
}, 8000);
