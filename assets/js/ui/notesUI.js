import { closeModal, showModal } from "./modals.js";
import {
	sendNoteToBackend,
	getNotesForUser,
	updateNote,
	deleteNote,
} from "../api/notes.js";
import { timeAgo } from "../utils/time.js";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { showNotification } from "./notification.js";
import { quillTitle, quillContent } from "./config.js";
import {
	createTagsSuggestionUI,
	createTagsUI,
	closeDropdown,
} from "./tagsUI.js";
import { getUserTags } from "../utils/tags.js";
import { showConfirm } from "./confirmUi.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";

let loggedInUser = getFromLocalStorage("loggedInUser");
const addNoteBtn = document.getElementById("addNoteBtn");
let notesContainer = document.querySelector(".notes-content");
const addnoteCard = document.getElementById("add-note-card");

function buildNoteHTML(note) {
	let processedContent = note.content;

	// Set the HTML attribute explicitly using your note.noteId property
	return `
        <div class="note-card" noteId="${note.noteId}">
            <div class="note-card-header">
                <div class="note-card-title ql-editor">${note.title}</div>
            </div>
            
            <div class="note-card-body content ql-editor">
                ${processedContent}
            </div> 
            
            <div class="note-card-footer">
                <div class="note-tags-wrapper">
                    <ul class="categories">
                        ${note.tags.map((tag) => `<li class="note-cat">${tag}</li>`).join("")}
                    </ul>
                </div>
                
                <div class="note-meta-timeline">
                    <div class="created">Created: ${timeAgo(note.createdAt)}</div>
                    <div class="updated">Updated: ${timeAgo(note.updatedAt)}</div>
                </div>
                
                <div class="note-action-row">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        </div>
    `;
}

export async function createNotes(notes, savedNotes = true) {
	if (savedNotes) {
		saveToLocalStorage("notes", notes);
	}
	notesContainer = document.querySelector(".notes-content");
	notesContainer.innerHTML = "";
	if (notes.length === 0) {
		console.log("creating notes in", notesContainer);
		notesContainer.innerHTML = `<span id = "message-0">No notes available. Click the "Add Note" button to create your first note.</span>`;
		return;
	}
	let isPinnedNotes = notes.filter((note) => note.isPinned);
	let regularNotes = notes.filter((note) => !note.isPinned);
	if (isPinnedNotes.length > 0) {
		const divider = document.createElement("div");
		divider.classList.add("grid-separator");
		divider.innerHTML = `<span>Pinned</span><hr>`;
		notesContainer.appendChild(divider);

		isPinnedNotes.forEach((note) => {
			notesContainer.insertAdjacentHTML("beforeend", buildNoteHTML(note));
		});
	}

	if (isPinnedNotes.length > 0 && regularNotes.length > 0) {
		const divider = document.createElement("div");
		divider.classList.add("grid-separator");
		divider.innerHTML = `<span>Others</span><hr>`;
		notesContainer.appendChild(divider);
	}

	regularNotes.forEach((note) => {
		notesContainer.insertAdjacentHTML("beforeend", buildNoteHTML(note));
	});
	let deleteBtns = document.querySelectorAll(`.notes-content .delete-btn`);
	deleteBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const noteId = btn.closest(".note-card").getAttribute("noteId");
			showConfirm(
				"Delete Note",
				"Are you sure you want to delete this note?",
				() => {
					deleteNote(noteId, loggedInUser.token);
				},
			);
		});
	});
	let editBtns = document.querySelectorAll(`.notes-content .edit-btn`);
	editBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const noteId = btn.closest(".note-card").getAttribute("noteId");
			console.log("NoteId:", noteId);
			console.log("Token:", loggedInUser.token, "user:", loggedInUser);
			updateNoteUi(noteId, loggedInUser.token);
		});
	});
}

export function triggerAddNoteModal() {
	addNoteBtn.addEventListener("click", () => {
		let tags = [];
		closeModal(document.querySelector(".modal.active"));
		showModal(addnoteCard, { noOverlay: false });
		closeDropdown(document.getElementById("tags-suggestion-dropdown"));
		const submitNoteBtn = document.getElementById("save-note-btn");
		const noteTagsInput = document.querySelector(
			"#add-note-card .add-tag input",
		);
		const notePinnedInput = document.getElementById("pinNote");
		const tagsSubmitbtn = document.getElementById("add-tag-btn");
		const tagsContainer = document.querySelector("#add-note-card .tags");

		submitNoteBtn.textContent = "Add Note";
		notePinnedInput.checked = false;
		noteTagsInput.value = "";
		tagsContainer.innerHTML = "";
		if (quillTitle) quillTitle.setText("");
		if (quillContent) quillContent.setText("");

		noteTagsInput.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				tagsSubmitbtn.click();
			}
		});

		noteTagsInput.addEventListener("input", () => {
			createTagsSuggestionUI(
				noteTagsInput.value,
				tags,
				(selectedTag) => {
					if (!tags.includes(selectedTag)) {
						tags.push(selectedTag);
						createTagsUI(tags, tagsContainer);
					}
					noteTagsInput.value = "";
					noteTagsInput.focus();
				},
			);
		});

		document.addEventListener("click", (e) => {
			const dropdown = document.getElementById(
				"tags-suggestion-dropdown",
			);
			if (dropdown && !noteTagsInput.contains(e.target)) {
				dropdown.style.display = "none";
			}
		});

		tagsSubmitbtn.onclick = () => {
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
			tags = [...new Set([...tags, ...newTags])];
			createTagsUI(tags, tagsContainer);
		};

		submitNoteBtn.onclick = async () => {
			const User = localStorage.getItem("loggedInUser");
			const now = new Date().toISOString();
			const token = User ? JSON.parse(User).token : null;
			let noteTitle = "";
			if (quillTitle) {
				noteTitle =
					typeof quillTitle.getSemanticHTML === "function"
						? quillTitle.getSemanticHTML().trim()
						: quillTitle.root.innerHTML.trim();
			}

			let editorContent = "";
			if (quillContent) {
				editorContent =
					typeof quillContent.getSemanticHTML === "function"
						? quillContent.getSemanticHTML().trim()
						: quillContent.root.innerHTML.trim();
			}

			const isTitleEmpty =
				!quillTitle || quillTitle.getText().trim().length === 0;
			const isContentEmpty =
				!quillContent || quillContent.getText().trim().length === 0;

			if (isTitleEmpty || isContentEmpty) {
				showNotification("error", "Title and content cannot be empty.");
				return;
			}

			const newNote = {
				title: noteTitle,
				content: editorContent,
				isPinned: notePinnedInput.checked,
				tags,
				createdAt: now,
				updatedAt: now,
			};

			startLoading({ buttonElement: submitNoteBtn });

	try {
		const result = await sendNoteToBackend(newNote, token);
		closeModal(addnoteCard);

		const createdNote = { noteId: result.noteId, ...newNote };
		const currentNotes = getFromLocalStorage("notes") || [];
		createNotes([createdNote, ...currentNotes])
	} catch (error) {
		console.error(error);
	} finally {
		stopLoading(submitNoteBtn);
	}
		};
	});
}

export function handlesNotesUI(user) {
	return new Promise((resolve) => {
		loggedInUser = user;

		const existingWarning = document.querySelector(".no-notes-message");
		let currentNotesContainer = document.querySelector(".notes-content");

		if (user) {
			if (existingWarning) {
				existingWarning.remove();
			}

			if (!currentNotesContainer) {
				currentNotesContainer = document.createElement("div");
				currentNotesContainer.classList.add("notes-content");
				document.body.insertBefore(currentNotesContainer, addNoteBtn);
			}
			notesContainer = currentNotesContainer;
			addNoteBtn.style.display = "block";
		} else {
			if (currentNotesContainer) {
				currentNotesContainer.remove();
			}
			addNoteBtn.style.display = "none";

			if (!existingWarning) {
				const noNotesMessage = document.createElement("div");
				noNotesMessage.classList.add("no-notes-message");
				noNotesMessage.innerHTML = `
                    <img src="./assets/images/warning.png" alt="No Notes"> 
                    <p>Please log in to view your notes.</p>
                `;
				document.body.appendChild(noNotesMessage);
			}
		}
		resolve();
	});
}
export function updateNoteUi(noteId, token) {
	let notes = getFromLocalStorage("notes") || [];
	let note = notes.find((n) => n.noteId == noteId);

	if (!note) {
		console.error(`Note with ID ${noteId} not found in local storage.`);
		showNotification("error", "Failed to retrieve note records.");
		return;
	}

	let tags = [...note.tags];

	closeDropdown(document.getElementById("tags-suggestion-dropdown"));
	showModal(addnoteCard);
	const submitNoteBtn = document.getElementById("save-note-btn");
	const noteTagsInput = document.querySelector(
		"#add-note-card .add-tag input",
	);
	const notePinnedInput = document.getElementById("pinNote");
	const tagsSubmitbtn = document.getElementById("add-tag-btn");
	const tagsContainer = document.querySelector("#add-note-card .tags");

	noteTagsInput.value = "";
	submitNoteBtn.textContent = "Update Note";
	notePinnedInput.checked = note.isPinned;

	createTagsUI(tags, tagsContainer);
	noteTagsInput.addEventListener("input", () => {
		createTagsSuggestionUI(
			noteTagsInput.value,
			tags,
			(selectedTag) => {
				if (!tags.includes(selectedTag)) {
					tags.push(selectedTag);
					createTagsUI(tags, tagsContainer);
				}
				noteTagsInput.value = "";
				noteTagsInput.focus();
			},
		);
	});

	tagsSubmitbtn.onclick = () => {
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
		tags = [...new Set([...tags, ...newTags])];
		createTagsUI(tags, tagsContainer);
	};

	if (quillTitle) quillTitle.root.innerHTML = note.title;
	if (quillContent) {
		let cleanContent = note.content.replace(
			/<span class="ql-todo-icon">.*?<\/span>\s*/g,
			"",
		);

		quillContent.root.innerHTML = cleanContent;
	}

	submitNoteBtn.onclick = async () => {
		const now = new Date().toISOString();
		const updatedNote = {
			...note,
			title: quillTitle ? quillTitle.root.innerHTML.trim() : note.title,
			content: quillContent
				? quillContent.root.innerHTML.trim()
				: note.content,
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
