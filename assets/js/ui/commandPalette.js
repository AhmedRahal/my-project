import { closeAllModals, showModal } from "./modals.js";
import { showNotification } from "./notification.js";

const actions = [
	{ id: "new-note", label: "Create a new note", shortcut: "N" },
	{ id: "search", label: "Search notes", shortcut: "/" },
	{ id: "settings", label: "Open settings", shortcut: "" },
	{ id: "profile", label: "Open profile", shortcut: "" },
];

export function initCommandPalette() {
	const palette = document.getElementById("command-palette");
	const input = document.getElementById("command-palette-input");
	const results = document.getElementById("command-palette-results");
	if (!palette || !input || !results) return;

	const render = (query = "") => {
		const normalized = query.trim().toLowerCase();
		const visible = actions.filter((action) =>
			action.label.toLowerCase().includes(normalized),
		);
		results.innerHTML = visible.length
			? visible
					.map(
						(action) => `
							<button type="button" class="command-item" data-command="${action.id}">
								<span>${action.label}</span><kbd>${action.shortcut}</kbd>
							</button>`,
					)
					.join("")
			: '<p class="command-empty">No matching actions</p>';
	};

	const run = (id) => {
		closeAllModals();
		const addNoteButton = document.getElementById("addNoteBtn");
		const searchInput = document.getElementById("noteSearchInput");
		const settingsButton = document.querySelector("header .settings-menu");
		const profileButton = document.querySelector("header .user");
		if (id === "new-note") addNoteButton?.click();
		if (id === "search") {
			document.querySelector(".search-bar")?.classList.add("active");
			searchInput?.focus();
		}
		if (id === "settings") settingsButton?.click();
		if (id === "profile") profileButton?.click();
	};

	const open = () => {
		showModal(palette);
		input.value = "";
		render();
		input.focus();
	};

	input.addEventListener("input", () => render(input.value));
	results.addEventListener("click", (event) => {
		const item = event.target.closest("[data-command]");
		if (item) run(item.dataset.command);
	});
	document.addEventListener("keydown", (event) => {
		const modifier = event.ctrlKey || event.metaKey;
		if (modifier && event.key.toLowerCase() === "k") {
			event.preventDefault();
			open();
			return;
		}
		if (palette.classList.contains("active") && event.key === "Enter") {
			event.preventDefault();
			results.querySelector("[data-command]")?.click();
		}
		if (palette.classList.contains("active") && event.key === "Escape") {
			closeAllModals();
		}
	});
}
