// ==================================================
// FILE: C:\DEV\my-project\assets\main.js
// ==================================================
// import styleText from "./scss/style.scss?inline";

// // Inject immediately before DOM elements render
// const style = document.createElement("style");
// style.textContent = styleText;
// document.head.appendChild(style);
import { loadSettings } from "./js/ui/settings.js";
import { getFromLocalStorage, saveToLocalStorage } from "./js/utils/storage.js";
import { handlesUserUI } from "./js/ui/userUi/index.js";
import { showModal, closeAllModals } from "./js/ui/modals.js";
import { getNotesForUser } from "./js/api/notes.js";
import { triggerAddNoteModal } from "./js/ui/notesUi/addNote.js";
import { setupQuillInstances } from "./js/quill/instances.js";
import { applyTheme } from "./js/ui/theme.js";
import { initIPC } from "./js/electron/ipc.js";
import { checkStatus } from "./js/utils/statue.js";
import { toggleFilterDropdown } from "./js/ui/search.js";
import { initToolbar } from "./js/ui/toolbar/main.js";
import { settings } from "./js/ui/config.js";
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

window.addEventListener("DOMContentLoaded", () => {
	initToolbar();
	initIPC();
	checkStatus();
	setupQuillInstances().catch((err) => {
		console.error(
			"Delayed Quill engine initialization failed completely: ",
			err,
		);
	});
});
window.addEventListener("online", () => {
	checkStatus();
});
window.addEventListener("offline", () => {
	checkStatus();
});
