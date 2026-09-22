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

	// Do a real check up front — without this, isOnline()/checkBackendHealth()
	// sit at their default (false) until the OS happens to fire an
	// "online"/"offline" event, which is what made the badge and the
	// online/offline gates on login/signup show stale info on launch.
	await checkBackendHealth(true);

	setupQuillInstances().catch((err) => {
		console.error(
			"Delayed Quill engine initialization failed completely: ",
			err,
		);
	});
});

// This is the actual trigger for "we're back, go sync" — checkBackendHealth()
// dispatches this event whenever the real status flips from offline to
// online, whether that's because the network reconnected OR because the
// local Python backend was just restarted. This is what was missing before:
// only the browser's network-level "online" event (below) called syncAll(),
// which never fires when your network connection never actually dropped.
window.addEventListener("backend-status-change", (e) => {
	if (e.detail.online) {
		syncAll();
	}
});

window.addEventListener("online", () => {
	console.log("🌐 Network status: Online");
	// Force a real check — if the backend is actually reachable, this flips
	// isOnline() and fires "backend-status-change" above, which is what
	// actually triggers syncAll().
	checkBackendHealth(true);
});

window.addEventListener("offline", () => {
	checkBackendHealth(true);
});

// The "online"/"offline" browser events only fire on network changes — they
// never fire just because your local Python backend was stopped or started
// while the network itself stayed up. Poll on a slow interval so both the
// badge AND the sync trigger above catch that case too.
setInterval(() => {
	checkBackendHealth();
}, 8000);
