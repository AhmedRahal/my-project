import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";

export const DEFAULT_PREFERENCES = {
	density: "comfortable",
	accent: "indigo",
	editorFontSize: "medium",
	defaultSort: "date",
	confirmDelete: true,
	focusMode: false,
};

export function getPreferences() {
	return {
		...DEFAULT_PREFERENCES,
		...(getFromLocalStorage("uiPreferences") || {}),
	};
}

export function updatePreferences(patch) {
	const next = { ...getPreferences(), ...patch };
	saveToLocalStorage("uiPreferences", next);
	applyPreferences(next);
	window.dispatchEvent(new CustomEvent("ui-preferences-change", { detail: next }));
	return next;
}

export function applyPreferences(preferences = getPreferences()) {
	const root = document.documentElement;
	root.dataset.density = preferences.density;
	root.dataset.editorFontSize = preferences.editorFontSize;
	if (preferences.accent) root.dataset.accent = preferences.accent;
}

export function initPreferences() {
	const preferences = getPreferences();
	applyPreferences(preferences);
	return preferences;
}
