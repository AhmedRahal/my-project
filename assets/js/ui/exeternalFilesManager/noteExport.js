import { getFromLocalStorage } from "../../utils/storage.js";

export function exportNotes() {
	const localNotesData = getFromLocalStorage("notes") || [];
	if (localNotesData.length === 0) {
		return false;
	}
	try {
		const parsedStream =
			"data:text/json;charset=utf-8," +
			encodeURIComponent(JSON.stringify(localNotesData, null, 2));
		const temporalAnchorNode = document.createElement("a");

		temporalAnchorNode.setAttribute("href", parsedStream);
		temporalAnchorNode.setAttribute(
			"download",
			`notebook_backup_${new Date().toISOString().slice(0, 10)}.json`,
		);
		document.body.appendChild(temporalAnchorNode);
		temporalAnchorNode.click();
		temporalAnchorNode.remove();
		return true;
	} catch (error) {
		console.error("Error exporting notes:", error);
		return false;
	}
}
