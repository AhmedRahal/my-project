import { login } from "../api/auth.js";
import { showNotification } from "../ui/notification.js";
import { closeModal, showModal } from "../ui/modals.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";
import { saveToLocalStorage } from "../utils/storage.js";
import { handlesUserUI } from "../ui/userUi/index.js";
import { validateInput } from "../utils/validationHalnder.js";
export function loginUser() {
	const loginCard = document.getElementById("login-card");
	const submitLoginBtn = document.getElementById("submit-login");
	const loginUsernameInput = document.getElementById("login-username");
	const loginPasswordInput = document.getElementById("login-password");
	let loggedInUser = null;
	showModal(loginCard);

	submitLoginBtn.onclick = async () => {
		let username = loginUsernameInput.value.trim();
		let password = loginPasswordInput.value.trim();

		if (username === "" || password === "") {
			showNotification("error", "All fields are required");
			return;
		}

		const started = startLoading({ buttonElement: submitLoginBtn });
		if (!started) return;

		try {
			let result = await login(username, password);
			if (result.success === false) {
				return;
			}
			loggedInUser = {
				username: result.userInfo.username,
				image: result.userInfo.image,
				token: result.token,
				userId: result.userInfo.id,
			};
			saveToLocalStorage("loggedInUser", loggedInUser);
			saveToLocalStorage("userToken", result.token);

			showNotification("success", "Login successful");

			closeModal(loginCard);
		} catch (error) {
			console.error("Login component catch handler:", error);
		} finally {
			handlesUserUI(loggedInUser);
			stopLoading(submitLoginBtn);
			loginUsernameInput.value = "";
			loginPasswordInput.value = "";
		}
	};
}
