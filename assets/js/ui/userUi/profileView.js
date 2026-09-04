import { getFromLocalStorage } from "../../utils/storage.js";
import { apiUrl } from "../../api/config.js";
import { checkStatus } from "../../utils/statue.js";
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

profileTabBtns.forEach((btn) => {
	btn.addEventListener("click", (e) => {
		profileTabBtns.forEach((b) => b.classList.remove("active"));

		e.target.classList.add("active");

		profileSections.forEach((section) => (section.style.display = "none"));

		const targetId = e.target.getAttribute("data-target");
		const targetSection = document.getElementById(targetId);
		if (targetSection) targetSection.style.display = "block";
	});
});

export function switchView(viewName) {
	const currentNotesContainer = document.querySelector(".notes-content");
	inputImageHandler(signUpImageinput, fileText);
	inputImageHandler(editAvatarInput, avatarInputText);

	if (viewName === "profile") {
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
				sidebarAvatar.src = loggedInUser.image.startsWith("assets/")
					? loggedInUser.image
					: `${apiUrl}auth/user_images/${loggedInUser.image}`;
			}

			if (editUsernameInput)
				editUsernameInput.value = loggedInUser.username;

			const statueBadge = document.querySelector(
				"#profile-view .status-badge",
			);
			if (statueBadge) {
				if (checkStatus(null, false)) {
					statueBadge.textContent = "Online";
					statueBadge.className = "status-badge online";
				} else {
					statueBadge.textContent = "Offline";
					statueBadge.className = "status-badge offline";
				}
			}

			const allNotes = getFromLocalStorage("notes") || [];
			const pinnedCount = allNotes.filter((note) => note.isPinned).length;

			refreshUserTags(loggedInUser.userId).then(() => {
				const uniqueTags = getFromLocalStorage("userTags") || [];
				if (statTags) statTags.textContent = uniqueTags.length;
			});
			let uniqueTags = getFromLocalStorage("userTags") || [];

			if (statTotal) statTotal.textContent = allNotes.length;
			if (statPinned) statPinned.textContent = pinnedCount;
			if (statTags) statTags.textContent = uniqueTags.length;
		}
		if (deleteAccountBtn) {
			deleteAccountBtn.onclick = () => {
				deleteAccountUI();
			};
		}
	} else if (viewName === "notes") {
		if (profileView) profileView.style.display = "none";
		if (currentNotesContainer) currentNotesContainer.style.display = "grid";
		if (addNoteFloatingBtn) addNoteFloatingBtn.style.display = "block";
	}
}
