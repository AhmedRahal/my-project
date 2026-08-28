import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";
import getUserTagsApi from "../api/tags.js";

export function refreshUserTags(userId) {
	return getUserTagsApi(userId).then((response) => {
		const tags = response.tags;
		if (tags) saveToLocalStorage("userTags", tags);
		return tags || [];
	});
}

export function getUserTags() {
	return getFromLocalStorage("userTags") || [];
}

export function getTagsWith(string) {
	const cachedTags = getUserTags();
	if (!Array.isArray(cachedTags)) return [];
	return cachedTags.filter((tag) =>
		tag.toLowerCase().includes(string.toLowerCase()),
	);
}
