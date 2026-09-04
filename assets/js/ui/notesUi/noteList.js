import { deleteNote } from "../../api/notes.js";
import { getFromLocalStorage, saveToLocalStorage } from "../../utils/storage.js";
import { showConfirm } from "../confirmUi.js";
import { buildNoteHTML } from "./noteCard.js";
import { updateNoteUi } from "./editNote.js";
import { addNoteBtn } from "./dom.js";

let loggedInUser = getFromLocalStorage("loggedInUser");

export async function createNotes(notes, savedNotes = true) {
	if (savedNotes) {
		saveToLocalStorage("notes", notes);
	}

	const notesContainer = document.querySelector(".notes-content");
	notesContainer.innerHTML = "";

	if (notes.length === 0) {
		notesContainer.innerHTML = `<span id="message-0">No notes available. Click the "Add Note" button to create your first note.</span>`;
		return;
	}

	const pinnedNotes = notes.filter((note) => note.isPinned);
	const regularNotes = notes.filter((note) => !note.isPinned);

	if (pinnedNotes.length > 0) {
		const divider = document.createElement("div");
		divider.classList.add("grid-separator");
		divider.innerHTML = `<span>Pinned</span><hr>`;
		notesContainer.appendChild(divider);

		pinnedNotes.forEach((note) => {
			notesContainer.insertAdjacentHTML("beforeend", buildNoteHTML(note));
		});
	}

	if (pinnedNotes.length > 0 && regularNotes.length > 0) {
		const divider = document.createElement("div");
		divider.classList.add("grid-separator");
		divider.innerHTML = `<span>Others</span><hr>`;
		notesContainer.appendChild(divider);
	}

	regularNotes.forEach((note) => {
		notesContainer.insertAdjacentHTML("beforeend", buildNoteHTML(note));
	});

	bindNoteCardActions();
}

function bindNoteCardActions() {
	document.querySelectorAll(".notes-content .delete-btn").forEach((btn) => {
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

	document.querySelectorAll(".notes-content .edit-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const noteId = btn.closest(".note-card").getAttribute("noteId");
			updateNoteUi(noteId, loggedInUser.token);
		});
	});
}

export function handlesNotesUI(user) {
	return new Promise((resolve) => {
		loggedInUser = user;

		const existingWarning = document.querySelector(".no-notes-message");
		let currentNotesContainer = document.querySelector(".notes-content");

		if (user) {
			if (existingWarning) existingWarning.remove();

			if (!currentNotesContainer) {
				currentNotesContainer = document.createElement("div");
				currentNotesContainer.classList.add("notes-content");
				document.body.insertBefore(currentNotesContainer, addNoteBtn);
			}
			addNoteBtn.style.display = "block";
		} else {
			if (currentNotesContainer) currentNotesContainer.remove();
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
