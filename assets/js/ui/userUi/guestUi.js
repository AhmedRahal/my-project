import { closeAllModals, closeModal } from "../modals.js";
import { showNotification } from "../notification.js";
import { loginUser } from "../../auth/login.js";
import { signUp } from "../../auth/signup.js";
import { checkStatus } from "../../utils/statue.js";
import { userDiv, usersignUpLogout, searchBar } from "./dom.js";

export function renderGuestUi() {
	searchBar.onclick = (e) => {
		console.log(searchBar.children[1]);
		searchBar.children[1].blur();
		e.stopPropagation();
		closeModal(searchBar);
		showNotification("warning", "Please log in to search your notes.");
		closeAllModals();
	};

	if (userDiv && userDiv.children[0])
		userDiv.children[0].src = "assets/images/df_user.png";
	if (userDiv && userDiv.children[1])
		userDiv.children[1].textContent = "Guest";

	usersignUpLogout.innerHTML = `<button id="signUp-btn">signUp</button><br><button id="login-btn">log in</button>`;

	const signUpBtn = document.getElementById("signUp-btn");
	const loginBtn = document.getElementById("login-btn");

	signUpBtn.onclick = (e) => {
		e.stopPropagation();
		if (checkStatus(null, false)) {
			signUp();
		} else {
			showNotification(
				"warning",
				"You are offline. Please connect to the internet to login",
			);
			closeAllModals();
		}
	};

	loginBtn.onclick = (e) => {
		e.stopPropagation();
		if (checkStatus(null, false)) {
			loginUser();
		} else {
			showNotification(
				"warning",
				"You are offline. Please connect to the internet to login",
			);
			closeAllModals();
		}
	};
}
