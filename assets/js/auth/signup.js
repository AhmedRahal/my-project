import { register } from "../api/auth.js";
import { showNotification } from "../ui/notification.js";
import { handlesUserUI } from "../ui/userUi/index.js";
import { showModal, closeModal } from "../ui/modals.js";
import { saveToLocalStorage, getFromLocalStorage } from "../utils/storage.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";
import {
	validateInput,
	getPasswordStrength,
} from "../utils/validationHalnder.js";
export function signUp() {
	const signUpUsernameInput = document.getElementById("signUp-username");
	const signUpPasswordInput = document.getElementById("signUp-password");
	const signUpImageinput = document.getElementById("signUp-profile-picture");
	const signUpCard = document.getElementById("signUp-card");
	const submitsignUpBtn = document.getElementById("submit-signUp");
	let loggedInUser = null;

	console.log("Sign Up function called");
	showModal(signUpCard);
	signUpPasswordInput.oninput = () => {
		let strength = getPasswordStrength(signUpPasswordInput.value);
		console.log(strength);
		if (strength.label === "Weak") {
			signUpPasswordInput.style.borderColor = "var(--warning-text-color)";
			signUpPasswordInput.style.color = "var(--warning-text-color)";
		} else if (strength.label === "Medium") {
			signUpPasswordInput.style.borderColor = "#f59e0b";
			signUpPasswordInput.style.color = "#f59e0b";
		} else if (strength.label === "Strong") {
			signUpPasswordInput.style.borderColor = "#10b981";
			signUpPasswordInput.style.color = "#10b981";
		} else if (strength.label === "Empty") {
			signUpPasswordInput.style.borderColor = "var(--accent-color)";
			signUpPasswordInput.style.color = "var(--font-color)";
		}
	};
	submitsignUpBtn.onclick = async () => {
		let password = signUpPasswordInput.value.trim();
		let username = signUpUsernameInput.value.trim();
		let image = signUpImageinput.files[0];

		if (username === "" || password === "" || !image) {
			console.log("Missing fields:", { username, password, image });
			showNotification("error", "All fields are required");
			return;
		}
		if (!validateInput({ username, password }).isValid) {
			showNotification(
				"error",
				validateInput({ username, password }).error,
			);
			return;
		}

		let formData = new FormData();
		formData.append("username", username);
		formData.append("password", password);
		formData.append("image", image);
		startLoading({ buttonElement: submitsignUpBtn });

		try {
			const result = await register(formData);

			if (result && result.success) {
				loggedInUser = {
					username: result.userInfo.username,
					image: result.userInfo.image,
					token: result.token,
					userId: result.userInfo.id,
				};

				console.log("Logged In Successfully:", loggedInUser);
				saveToLocalStorage("loggedInUser", loggedInUser);
				saveToLocalStorage("userToken", loggedInUser.token);
				console.log(loggedInUser);
				handlesUserUI(loggedInUser);
				showNotification("success", "Sign up successful");
				signUpCard.classList.remove("active");
				overlay.classList.remove("active");
				closeModal(signUpCard);

				signUpUsernameInput.value = "";
				signUpPasswordInput.value = "";
				signUpImageinput.value = "";
			}
		} catch (error) {
			console.error("Sign up error:", error.message);
		} finally {
			stopLoading(submitsignUpBtn);
		}
		overlay.onclick = () => {
			signUpUsernameInput.value = "";
			signUpPasswordInput.value = "";
			signUpImageinput.value = "";
		};
	};
}

export function handlesSignUpUIError(error) {
	if (error === "USERNAME TAKEN") {
		const usernameInput = document.getElementById("signUp-username");
		usernameInput.classList.add("erroranimated");
		setTimeout(() => {
			usernameInput.classList.remove("erroranimated");
		}, 500);
		showNotification(
			"error",
			`Username ${usernameInput.value} is already taken. Please try another username.`,
		);
	}
}
