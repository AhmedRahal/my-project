import { createTagsSuggestionUI } from "../tagsUI.js";
import { showNotification } from "../notification.js";

/**
 * Wires a note form's tag input + "add tag" button.
 * `tags` must be a mutable array the caller owns — this function only
 * ever mutates it in place (push / length = 0), it never reassigns it,
 * so closures holding a reference to the same array stay in sync.
 *
 * Used by both addNote.js and editNote.js so tag behavior only needs
 * to be built (and fixed) once as more note-form features get added.
 */
export function wireTagInput({ noteTagsInput, tagsSubmitbtn, tags, onChange }) {
	const addTagsFromInput = () => {
		if (noteTagsInput.value.trim().length === 0) {
			showNotification("info", "Please enter at least one tag.");
			noteTagsInput.focus();
			return;
		}
		const newTags = noteTagsInput.value
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);
		noteTagsInput.value = "";

		const merged = [...new Set([...tags, ...newTags])];
		tags.length = 0;
		tags.push(...merged);
		onChange(tags);
	};

	noteTagsInput.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			tagsSubmitbtn.click();
		}
	});

	noteTagsInput.addEventListener("input", () => {
		createTagsSuggestionUI(noteTagsInput.value, tags, (selectedTag) => {
			if (!tags.includes(selectedTag)) {
				tags.push(selectedTag);
				onChange(tags);
			}
			noteTagsInput.value = "";
			noteTagsInput.focus();
		});
	});

	tagsSubmitbtn.onclick = addTagsFromInput;
}
