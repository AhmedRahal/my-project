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
		// Error is already handled by core.js/errorHandler.js, but we can add specific UI feedback here if needed
	} finally {
	
	}
}

export async function register(formDataPayload) {
	try {
		// Note: apiRequest currently expects JSON body.
		// For FormData (file upload), we might need a slight tweak in core.js or handle it specially.
		// For now, keeping your original fetch logic for FormData as it's complex to genericize without breaking multipart boundaries.
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
		// You can't sign up for an account you've never reached before — this
		// one genuinely does require a connection, so we just explain that
		// clearly rather than pretending we can queue it.
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
			// Changing your password offline can't be verified against the
			// real old password, so we intentionally don't queue this one —
			// just tell the person clearly instead of silently failing later.
			showNotification("warning", "You're offline — password changes need a connection.");
			return { success: false };
		},
	});
}

export async function updateProfile(username, imageFile, token) {
	const online = await checkBackendHealth();

	if (!online) {
		// Queue the change so it uploads for real once we're reconnected...
		const user = getFromLocalStorage("loggedInUser");
		let imageBase64 = null;
		if (imageFile) imageBase64 = await fileToBase64(imageFile);

		await queueAction({
			endpoint: "auth/profile",
			method: "PUT",
			body: { username, imageBase64, imageName: imageFile?.name },
			label: "Update profile",
		});

		// ...and update things locally right now so the UI doesn't just sit there.
		if (user) {
			if (username) user.username = username;
			if (imageBase64) {
				user.image = imageBase64; // a data: URI works fine directly as an <img> src
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

		// Using raw fetch for FormData again to ensure multipart boundary is correct
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
			// If offline, we can't delete from server, but we can clear local data
			removeLocalStorage(["loggedInUser", "userToken"]);
			return { success: true };
		}
	});

	// If successful online, clear local storage
	removeLocalStorage(["loggedInUser", "userToken"]);
}
