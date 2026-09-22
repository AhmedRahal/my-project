import { apiRequest } from "./core.js";

export default async function getUserTagsApi(userId) {
	// Tags are read-only here, so offline just means "nothing new to show" —
	// the cached tags in utils/tags.js are still used elsewhere in the UI.
	const data = await apiRequest({
		endpoint: "notes/tags",
		method: "GET",
		offlineFallback: async () => ({ tags: [] }),
	});
	return data || { tags: [] };
}
