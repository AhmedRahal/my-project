import { getTagsWith } from "../utils/tags.js";

let selectedIndex = -1;
const MAX_SUGGESTIONS = 5;

export function createTagsSuggestionUI(
	inputValue,
	currentNoteTags,
	onSelectCallback,
) {
	const dropdown = document.getElementById("tags-suggestion-dropdown");
	const noteTagsInput = document.querySelector(
		"#add-note-card .add-tag input",
	);
	if (!dropdown || !noteTagsInput) return;

	dropdown.innerHTML = "";
	selectedIndex = -1;

	const cleanInput = inputValue.trim().toLowerCase();
	if (!cleanInput) {
		dropdown.style.display = "none";
		return;
	}

	const matches = getTagsWith(cleanInput);
	const filteredMatches = matches.filter(
		(tag) => !currentNoteTags.includes(tag),
	);

	if (filteredMatches.length === 0) {
		dropdown.style.display = "none";
		return;
	}

	dropdown.style.display = "block";
	const limitedMatches = filteredMatches.slice(0, MAX_SUGGESTIONS);

	limitedMatches.forEach((tag, index) => {
		const item = document.createElement("div");
		item.classList.add("suggestion-item");
		item.setAttribute("data-index", index);
		item.innerHTML = `
            <span class="tag-text">${tag}</span>
            <span class="tag-status-badge">Saved</span>
        `;

		item.onclick = (e) => {
			e.stopPropagation();
			onSelectCallback(tag);
			closeDropdown(dropdown);
		};

		dropdown.appendChild(item);
	});

	noteTagsInput.onkeydown = (e) => {
		const items = dropdown.querySelectorAll(".suggestion-item");
		if (items.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			selectedIndex++;
			if (selectedIndex >= items.length) selectedIndex = 0;
			updateActiveItem(items);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			selectedIndex--;
			if (selectedIndex < 0) selectedIndex = items.length - 1;
			updateActiveItem(items);
		} else if (e.key === "Enter") {
			if (selectedIndex > -1 && items[selectedIndex]) {
				e.preventDefault();
				items[selectedIndex].click();
			}
		} else if (e.key === "Escape") {
			closeDropdown(dropdown);
		}
	};
}

function updateActiveItem(items) {
	items.forEach((item) => item.classList.remove("selected"));
	if (selectedIndex > -1 && items[selectedIndex]) {
		const activeItem = items[selectedIndex];
		activeItem.classList.add("selected");
		activeItem.scrollIntoView({ block: "nearest" });
	}
}

export function closeDropdown(dropdown) {
	dropdown.innerHTML = "";
	dropdown.style.display = "none";
	selectedIndex = -1;
}
export function createTagsUI(tags, tagsContainer) {
	tagsContainer.innerHTML = "";
	tags.forEach((tag) => {
		const tagElement = document.createElement("div");
		tagElement.classList.add("tag");

		const tagText = document.createElement("span");
		tagText.textContent = tag;
		tagElement.appendChild(tagText);

		const delBtn = document.createElement("button");
		delBtn.textContent = "x";
		delBtn.classList.add("delete-tag-btn");

		delBtn.onclick = () => {
			const index = tags.indexOf(tag);
			if (index > -1) {
				tags.splice(index, 1);
			}
			createTagsUI(tags, tagsContainer);
		};

		tagElement.appendChild(delBtn);
		tagsContainer.appendChild(tagElement);
	});
}
