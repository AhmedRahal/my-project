import { closeModal, showModal } from "../modals.js";
import { sendNoteToBackend } from "../../api/notes.js";
import { getFromLocalStorage } from "../../utils/storage.js";
import { showNotification } from "../notification.js";
import { quillTitle, quillContent } from "../config.js";
import { createTagsUI, closeDropdown } from "../tagsUI.js";
import { startLoading, stopLoading } from "../../utils/requestManager.js";
import { sanitizeHtml } from "./sanitize.js";
import { wireTagInput } from "./noteFormTags.js";
import { createNotes } from "./noteList.js";
import { addNoteBtn, addnoteCard } from "./dom.js";

export function triggerAddNoteModal() {
	const submitNoteBtn = document.getElementById("save-note-btn");
	const noteTagsInput = document.querySelector(
		"#add-note-card .add-tag input",
	);
	const notePinnedInput = document.getElementById("pinNote");
	const tagsSubmitbtn = document.getElementById("add-tag-btn");
	const tagsContainer = document.querySelector("#add-note-card .tags");

	// `tags` lives for the lifetime of the app and is only ever mutated
	// in place (never reassigned) — that's what lets us wire the tag
	// input listeners ONCE below instead of re-attaching them on every
	// "Add Note" click like the original code did.
	const tags = [];

	wireTagInput({
		noteTagsInput,
		tagsSubmitbtn,
		tags,
		onChange: (updatedTags) => createTagsUI(updatedTags, tagsContainer),
	});

	document.addEventListener("click", (e) => {
		const dropdown = document.getElementById("tags-suggestion-dropdown");
		if (dropdown && !noteTagsInput.contains(e.target)) {
			dropdown.style.display = "none";
		}
	});

	addNoteBtn.addEventListener("click", () => {
		closeModal(document.querySelector(".modal.active"));
		showModal(addnoteCard, { noOverlay: false });
		closeDropdown(document.getElementById("tags-suggestion-dropdown"));

		tags.length = 0; // reset for a fresh note
		submitNoteBtn.textContent = "Add Note";
		notePinnedInput.checked = false;
		noteTagsInput.value = "";
		tagsContainer.innerHTML = "";
		if (quillTitle) quillTitle.setText("");
		if (quillContent) quillContent.setText("");
	});

	submitNoteBtn.onclick = async () => {
		const sessionUser = getFromLocalStorage("loggedInUser");
		const token = sessionUser ? sessionUser.token : null;
		const now = new Date().toISOString();

		const rawTitle = quillTitle
			? typeof quillTitle.getSemanticHTML === "function"
				? quillTitle.getSemanticHTML().trim()
				: quillTitle.root.innerHTML.trim()
			: "";

		const rawContent = quillContent
			? typeof quillContent.getSemanticHTML === "function"
				? quillContent.getSemanticHTML().trim()
				: quillContent.root.innerHTML.trim()
			: "";

		const isTitleEmpty =
			!quillTitle || quillTitle.getText().trim().length === 0;
		const isContentEmpty =
			!quillContent || quillContent.getText().trim().length === 0;

		if (isTitleEmpty || isContentEmpty) {
			showNotification("error", "Title and content cannot be empty.");
			return;
		}

		const newNote = {
			title: sanitizeHtml(rawTitle),
			content: sanitizeHtml(rawContent),
			isPinned: notePinnedInput.checked,
			tags: [...tags],
			createdAt: now,
			updatedAt: now,
		};

		startLoading({ buttonElement: submitNoteBtn });

		try {
			const result = await sendNoteToBackend(newNote, token);
			closeModal(addnoteCard);

			const createdNote = { noteId: result.noteId, ...newNote };
			const currentNotes = getFromLocalStorage("notes") || [];
			createNotes([createdNote, ...currentNotes]);
		} catch (error) {
			console.error(error);
		} finally {
			stopLoading(submitNoteBtn);
		}
	};
}
