import { apiRequest } from "./core.js";
import { apiUrl } from "./config.js";
import { checkBackendHealth } from "./client.js";
import { showNotification } from "../ui/notification.js";
import { closeAllModals } from "../ui/modals.js";
import { removeLocalStorage, getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { queueAction } from "../utils/offlineQueue.js";
import { fileToBase64, setCachedAvatar } from "../utils/imageCache.js";
import { handleApiError } from "./errorHandler.js";

export async function login(username, password) {
	try {
		const result = await apiRequest({
			endpoint: "auth/login",
			method: "POST",
			body: { username, password },
			requiresAuth: false,
			loadingBtn: "submit-login", 
		});

		if (result && result.success) {
			return result;
		} else {
			showNotification("error", "Invalid credentials");
			closeAllModals();
		}
	} catch (error) {
		console.error("Error during login:", error);
	} finally {
	
	}
}

export async function register(formDataPayload) {
	try {
		const response = await fetch(`${apiUrl}auth/register`, {
			method: "POST",
			body: formDataPayload,
		});

		const data = await response.json();

		if (response.ok) {
			return data;
		} else {
			throw data;
		}
	} catch (error) {
		if (error instanceof TypeError || error?.message?.includes("fetch")) {
			showNotification("error", "Can't sign up while offline — please connect and try again.");
			return { success: false };
		}
		import("./errorHandler.js").then(mod => mod.handleApiError(error));
		return error;
	}
}

export async function changePassword(oldPassword, newPassword, token) {
	return await apiRequest({
		endpoint: "auth/profile/password",
		method: "PUT",
		body: { oldPassword, newPassword },
		loadingBtn: "update-password-btn",
		label: "Change password",
		offlineFallback: async () => {
			showNotification("warning", "You're offline — password changes need a connection.");
			return { success: false };
		},
	});
}

export async function updateProfile(username, imageFile, token) {
	const online = await checkBackendHealth();

	if (!online) {
		const user = getFromLocalStorage("loggedInUser");
		let imageBase64 = null;
		if (imageFile) imageBase64 = await fileToBase64(imageFile);

		await queueAction({
			endpoint: "auth/profile",
			method: "PUT",
			body: { username, imageBase64, imageName: imageFile?.name },
			label: "Update profile",
		});
		if (user) {
			if (username) user.username = username;
			if (imageBase64) {
				user.image = imageBase64;
				setCachedAvatar(user.userId, imageBase64);
			}
			saveToLocalStorage("loggedInUser", user);
		}

		showNotification(
			"info",
			"You're offline — your profile changes are saved and will upload once you're back online.",
		);
		return user;
	}

	try {
		const formData = new FormData();
		if (username) formData.append("username", username);
		if (imageFile) formData.append("image", imageFile);

		const response = await fetch(`${apiUrl}auth/profile`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		const data = await response.json();
		if (!response.ok) throw data;

		showNotification("success", "Profile updated successfully!");
		return data.userInfo;
	} catch (error) {
		import("./errorHandler.js").then(mod => mod.handleApiError(error));
	}
}

export async function deleteAccount(token) {
	await apiRequest({
		endpoint: "auth/profile",
		method: "DELETE",
		label: "Delete account",
		offlineFallback: async () => {
			removeLocalStorage(["loggedInUser", "userToken"]);
			return { success: true };
		}
	});
	removeLocalStorage(["loggedInUser", "userToken"]);
}
