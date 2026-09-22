import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";

const CACHE_KEY_PREFIX = "avatarCache_";

export function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export async function fileToBase64(file) {
	return blobToBase64(file);
}

/**
 * Fetches the avatar once (while online) and stashes it as a base64 data
 * URI, so the same image can still be shown once the backend goes away.
 * Safe to call opportunistically every time we're online — it's cheap and
 * just refreshes the cache.
 */
export async function cacheAvatarImage(userId, imageUrl) {
	if (!userId || !imageUrl) return;
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) throw new Error("avatar fetch failed");
		const blob = await response.blob();
		const base64 = await blobToBase64(blob);
		saveToLocalStorage(`${CACHE_KEY_PREFIX}${userId}`, base64);
	} catch (err) {
		// Non-fatal — worst case we fall back to the default avatar offline.
		console.warn("Couldn't cache avatar image:", err);
	}
}

export function getCachedAvatar(userId) {
	return getFromLocalStorage(`${CACHE_KEY_PREFIX}${userId}`);
}

export function setCachedAvatar(userId, base64) {
	saveToLocalStorage(`${CACHE_KEY_PREFIX}${userId}`, base64);
}

/**
 * The one place every avatar <img> in the app should go through, so the
 * offline/online behavior stays consistent everywhere instead of each file
 * re-implementing its own fallback logic.
 */
export function resolveAvatarSrc(loggedInUser, apiUrl, online) {
	if (!loggedInUser?.image) return "assets/images/df_user.png";

	if (
		loggedInUser.image.startsWith("assets/") ||
		loggedInUser.image.startsWith("data:")
	) {
		return loggedInUser.image;
	}

	const networkUrl = `${apiUrl}auth/user_images/${loggedInUser.image}`;

	if (!online) {
		const cached = getCachedAvatar(loggedInUser.userId);
		return cached || "assets/images/df_user.png";
	}

	// We're online — opportunistically refresh the cache for next time.
	cacheAvatarImage(loggedInUser.userId, networkUrl);
	return networkUrl;
}
