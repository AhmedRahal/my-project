import { getFromLocalStorage } from "../utils/storage.js";

export let quillTitle = null;
export let quillContent = null;
export const currentFilter = {
	searchQuery: "",
	selectedTags: "all",
	showOnlyPinned: false,
	showOnlyUnpinned: false,
	dateRange: "all",
	sortBy: "date",
	sortOrder: "desc",
};

export function setQuillTitleInstance(instance) {
	quillTitle = instance;
}

export function setQuillContentInstance(instance) {
	quillContent = instance;
}

export const settings = {
	darkMode: true,
	currentView: "notes",
	profileTab: "dashboard",
};
