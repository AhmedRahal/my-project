import { getFromLocalStorage, saveToLocalStorage } from "../../utils/storage.js";
import { apiUrl } from "../../api/config.js";
import { closeAllModals, showModal } from "../modals.js";
import { logout } from "../../auth/logout.js";
import { switchView } from "./profileView.js";
import {
	userDiv,
	usersignUpLogout,
	searchBar,
	filterDropdownPanel,
	userprofile,
	backToNotesBtn,
	profileLogoutBtn,
} from "./dom.js";

export function renderAuthHeader(loggedInUser) {
	userprofile.onclick = () => {
		closeAllModals();
		if (!getFromLocalStorage("loggedInUser")) return;
		switchView("profile");
	};

	if (backToNotesBtn) {
		backToNotesBtn.onclick = () => {
			switchView("notes");
		};
	}

	if (profileLogoutBtn) {
		profileLogoutBtn.onclick = () => {
			logout();
			switchView("notes");
		};
	}

	usersignUpLogout.innerHTML = `<button id="logout-btn">log out</button>`;
	const logoutBtn = document.getElementById("logout-btn");
	if (logoutBtn) {
		logoutBtn.onclick = (e) => {
			e.stopPropagation();
			logout();
		};
	}

	searchBar.onclick = (e) => {
		const isDropdownClick = e.target.closest(".filter-dropdown-panel");
		const isToggleBtnClick = e.target.closest(".filter-toggle-btn");

		if (isDropdownClick || isToggleBtnClick) {
			return;
		}
		e.stopPropagation();
		if (
			searchBar.classList.contains("active") &&
			filterDropdownPanel &&
			!filterDropdownPanel.classList.contains("active")
		) {
			showModal(searchBar, { noOverlay: true, fromEvent: "userDiv" });
			return;
		}
		showModal(searchBar, {
			noOverlay: true,
			additionalModals: [document.getElementById("filterDropdownPanel")],
			fromEvent: "userDiv",
		});
	};

	saveToLocalStorage("loggedInUser", loggedInUser);

	if (userDiv && userDiv.children[0]) {
		userDiv.children[0].src = loggedInUser.image.startsWith("assets/")
			? loggedInUser.image
			: `${apiUrl}auth/user_images/${loggedInUser.image}`;
	}

	if (userDiv && userDiv.children[1]) {
		userDiv.children[1].textContent = loggedInUser.username || "User";
	}
}
