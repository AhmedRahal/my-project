import { renderDashboard } from "./dashboard.js";
import {
	getFromLocalStorage,
	saveToLocalStorage,
} from "../../utils/storage.js";
import { apiUrl } from "../../api/config.js";
import { checkBackendHealth } from "../../api/client.js";
import { resolveAvatarSrc } from "../../utils/imageCache.js";
import { getPendingActionsCount } from "../../utils/offlineQueue.js";
import { refreshUserTags } from "../../utils/tags.js";
import { deleteAccountUI } from "../../auth/delete.js";
import { inputImageHandler } from "./imageInput.js";
import {
	profileView,
	addNoteFloatingBtn,
	profileTabBtns,
	profileSections,
	editUsernameInput,
	statTotal,
	statPinned,
	statTags,
	deleteAccountBtn,
	signUpImageinput,
	fileText,
	editAvatarInput,
	avatarInputText,
} from "./dom.js";
const settings = getFromLocalStorage("settings") || {};

profileTabBtns.forEach((btn) => {
	btn.addEventListener("click", (e) => {
		profileTabBtns.forEach((b) => b.classList.remove("active"));

		e.currentTarget.classList.add("active");

		profileSections.forEach((section) => (section.style.display = "none"));
		const targetId = e.currentTarget.getAttribute("data-target");
		const targetSection = document.getElementById(targetId);
		console.log(targetId);
		if (targetSection) {
			targetSection.style.display = "block";
			settings.profileTab = targetId;
			saveToLocalStorage("settings", settings);
		}
	});
});

function renderStatusBadge(online) {
	const statueBadge = document.querySelector("#profile-view .status-badge");
	if (!statueBadge) return;

	if (online) {
		statueBadge.textContent = "Online";
		statueBadge.className = "status-badge online";
	} else {
		statueBadge.textContent = "Offline";
		statueBadge.className = "status-badge offline";
	}
}

async function renderPendingChangesNote() {
	const pendingNote = document.querySelector("#profile-view .pending-changes-note");
	if (!pendingNote) return; // fine if this element isn't in the HTML yet

	const count = await getPendingActionsCount();
	if (count > 0) {
		pendingNote.textContent = `${count} change${count === 1 ? "" : "s"} waiting to sync`;
		pendingNote.style.display = "inline-block";
	} else {
		pendingNote.style.display = "none";
	}
}

// Keeps the badge honest even if nothing else on screen changes — reacts to
// the real, live status instead of whatever it happened to be when the
// profile page was opened.
window.addEventListener("backend-status-change", (e) => {
	renderStatusBadge(e.detail.online);
	if (e.detail.online) renderPendingChangesNote();
});

export async function switchView(viewName) {
	// A real check, not the cached isOnline() read — this is what was making
	// the badge freeze on whatever status happened to be true the moment the
	// app booted.
	let online = await checkBackendHealth();
	const currentNotesContainer = document.querySelector(".notes-content");
	inputImageHandler(signUpImageinput, fileText);
	inputImageHandler(editAvatarInput, avatarInputText);
	settings.currentView = viewName;
	saveToLocalStorage("settings", settings);
	if (viewName === "profile") {
		let tab = settings.profileTab;
		console.log(tab);
		if (!tab) tab = "profile";
		console.log(tab);
		profileTabBtns.forEach((b) => b.classList.remove("active"));
		document.querySelector(`[data-target="${tab}"]`).click();
		if (currentNotesContainer) currentNotesContainer.style.display = "none";
		if (addNoteFloatingBtn) addNoteFloatingBtn.style.display = "none";
		if (profileView) profileView.style.display = "block";

		const loggedInUser = getFromLocalStorage("loggedInUser");
		if (loggedInUser) {
			const sidebarUsername = document.getElementById("sidebar-username");
			const sidebarAvatar = document.getElementById("sidebar-avatar");

			if (sidebarUsername)
				sidebarUsername.textContent = loggedInUser.username;
			if (sidebarAvatar) {
				sidebarAvatar.src = resolveAvatarSrc(loggedInUser, apiUrl, online);
			}

			if (editUsernameInput)
				editUsernameInput.value = loggedInUser.username;

			renderStatusBadge(online);
			renderPendingChangesNote();

			renderDashboard();
			if (deleteAccountBtn) {
				deleteAccountBtn.onclick = () => {
					deleteAccountUI();
				};
			}
		}
	} else if (viewName === "notes") {
		if (profileView) profileView.style.display = "none";
		if (currentNotesContainer) currentNotesContainer.style.display = "grid";
		if (addNoteFloatingBtn) addNoteFloatingBtn.style.display = "block";
	}
}
