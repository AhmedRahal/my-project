import { closeModal, showModal } from "../modals.js";
import { updateNote } from "../../api/notes.js";
import { getFromLocalStorage } from "../../utils/storage.js";
import { showNotification } from "../notification.js";
import { quillTitle, quillContent } from "../config.js";
import { createTagsUI, closeDropdown } from "../tagsUI.js";
import { startLoading, stopLoading } from "../../utils/requestManager.js";
import { sanitizeHtml } from "./sanitize.js";
import { wireTagInput } from "./noteFormTags.js";
import { addnoteCard } from "./dom.js";

export function updateNoteUi(noteId, token) {
	const notes = getFromLocalStorage("notes") || [];
	const note = notes.find((n) => n.noteId == noteId);

	if (!note) {
		console.error(`Note with ID ${noteId} not found in local storage.`);
		showNotification("error", "Failed to retrieve note records.");
		return;
	}

	const tags = [...note.tags];

	closeDropdown(document.getElementById("tags-suggestion-dropdown"));
	showModal(addnoteCard);

	const submitNoteBtn = document.getElementById("save-note-btn");
	const notePinnedInput = document.getElementById("pinNote");
	const tagsSubmitbtn = document.getElementById("add-tag-btn");
	const tagsContainer = document.querySelector("#add-note-card .tags");

	// This function runs fresh every time an edit button is clicked, so a
	// plain addEventListener on the existing input would stack listeners
	// with every note you edit. Cloning-and-replacing the node strips any
	// listeners left over from a previous edit session before rewiring.
	const staleTagsInput = document.querySelector(
		"#add-note-card .add-tag input",
	);
	const noteTagsInput = staleTagsInput.cloneNode(true);
	staleTagsInput.replaceWith(noteTagsInput);

	noteTagsInput.value = "";
	submitNoteBtn.textContent = "Update Note";
	notePinnedInput.checked = note.isPinned;

	createTagsUI(tags, tagsContainer);

	wireTagInput({
		noteTagsInput,
		tagsSubmitbtn,
		tags,
		onChange: (updatedTags) => createTagsUI(updatedTags, tagsContainer),
	});

	if (quillTitle) quillTitle.root.innerHTML = sanitizeHtml(note.title);
	if (quillContent) {
		const cleanContent = note.content.replace(
			/<span class="ql-todo-icon">.*?<\/span>\s*/g,
			"",
		);
		quillContent.root.innerHTML = sanitizeHtml(cleanContent);
	}

	submitNoteBtn.onclick = async () => {
		const now = new Date().toISOString();
		const updatedNote = {
			...note,
			title: sanitizeHtml(
				quillTitle ? quillTitle.root.innerHTML.trim() : note.title,
			),
			content: sanitizeHtml(
				quillContent ? quillContent.root.innerHTML.trim() : note.content,
			),
			isPinned: notePinnedInput.checked,
			tags,
			updatedAt: now,
		};

		startLoading({ buttonElement: submitNoteBtn });

		try {
			await updateNote(noteId, updatedNote, token);
			closeModal(addnoteCard);
		} catch (error) {
			console.error(error);
			showNotification("error", "Failed to update note.");
		} finally {
			stopLoading(submitNoteBtn, "Update Note");
		}
	};
}
