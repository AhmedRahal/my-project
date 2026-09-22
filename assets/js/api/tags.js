import { apiRequest } from "./core.js";

export default async function getUserTagsApi(userId) {

	const data = await apiRequest({
		endpoint: "notes/tags",
		method: "GET",
		offlineFallback: async () => ({ tags: [] }),
	});
	return data || { tags: [] };
}
