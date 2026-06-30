import { closeModal, showModal } from "./modals.js";
import { sendNoteToBackend, getNotesForUser } from "../api/notes.js";
import { timeAgo } from "../utils/time.js";
import { deleteNote } from "../api/notes.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { showNotification } from "./notification.js";
import { quill } from "./config.js"; // Imported directly from your config layer

const addNoteBtn = document.getElementById("addNoteBtn");

export function createNotes(notes) {
    const notesContainer = document.querySelector(".notes-content");
    notesContainer.innerHTML = ""; 
    let isPinnedNotes = notes.filter(note => note.isPinned);
    
    if (isPinnedNotes.length > 0) {
        const divider = document.createElement("div");
        divider.classList.add("grid-separator");
        divider.innerHTML = `<span>Pinned</span><hr>`;
        notesContainer.appendChild(divider);
               
        isPinnedNotes.forEach(note => {
            const noteElement = document.createElement("div");
            noteElement.id = `${note.id}`;
            noteElement.classList.add("note");
            noteElement.innerHTML = `
            <h2>${note.title}</h2>
            <div class="content">${note.content}</div> 
            <ul class="categories">
                ${note.tags.map(tag => `<li class="note-cat">${tag}</li>`).join('')}
            </ul>
            <div class="buttons">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
            <div class="time-line">
                <p class="created">Created: ${timeAgo(note.createdAt)}</p>
                <span class="updated">Updated: ${timeAgo(note.updatedAt)}</span>
            </div>`;
            notesContainer.appendChild(noteElement);
        });
    }
    
    if (isPinnedNotes.length > 0 && notes.length - isPinnedNotes.length > 0) {
        const divider = document.createElement("div");
        divider.classList.add("grid-separator");
        divider.innerHTML = `<span>Others</span><hr>`;
        notesContainer.appendChild(divider);
    }
    
    notes.forEach(note => {
        const noteElement = document.createElement("div");
        noteElement.id = `${note.id}`;
        if (!note.isPinned) {
            noteElement.classList.add("note");
            noteElement.innerHTML = `
            <h2>${note.title}</h2>
            <div class="content">${note.content}</div> 
            <ul class="categories">
                ${note.tags.map(tag => `<li class="note-cat">${tag}</li>`).join('')}
            </ul>
            <div class="buttons">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
            <div class="time-line">
                <p class="created">Created: ${timeAgo(note.createdAt)}</p>
                <span class="updated">Updated: ${timeAgo(note.updatedAt)}</span>
            </div>`;
            notesContainer.appendChild(noteElement);
        }
    });  

    let loggedInUser = getFromLocalStorage("loggedInUser");
    let deleteBtns = document.querySelectorAll(`.notes-content .delete-btn`);
    deleteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const noteId = btn.parentElement.parentElement.id;
            console.log(noteId);
            deleteNote(noteId, loggedInUser.token);
        });
    });
}

export function triggerAddNoteModal() {
    addNoteBtn.addEventListener("click", () => {
        let tags = [];
        closeModal(document.querySelector(".modal.active"));
        const addnoteCard = document.getElementById("add-note-card");
        showModal(addnoteCard);
        
        const submitNoteBtn = document.getElementById("save-note-btn");
        const noteTitleInput = document.getElementById("note-title");
        const noteTagsInput = document.querySelector("#add-note-card .add-tag input");
        const notePinnedInput = document.getElementById("pinNote");
        const tagsSubmitbtn = document.getElementById("add-tag-btn");
        const tagsContainer = document.querySelector("#add-note-card .tags");

        // Clear all initial text inputs
        noteTitleInput.value = "";
        notePinnedInput.checked = false;
        noteTagsInput.value = "";
        tagsContainer.innerHTML = "";
        
        // FIXED: Clear imported quill config context directly
        if (quill) {
            quill.setText('');
        }

        tagsSubmitbtn.onclick = () => {
            const newTags = noteTagsInput.value
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);

            newTags.forEach(tag => {
                if (tags.includes(tag)) return;

                tags.push(tag);

                const tagElement = document.createElement("div");
                tagElement.classList.add("tag");

                const tagText = document.createElement("span");
                tagText.textContent = tag;

                const delBtn = document.createElement("button");
                delBtn.textContent = "x";
                delBtn.classList.add("delete-tag-btn");

                delBtn.onclick = () => {
                    tags = tags.filter(t => t !== tag);
                    tagElement.remove();
                };

                tagElement.appendChild(tagText);
                tagElement.appendChild(delBtn);
                tagsContainer.appendChild(tagElement);
            });

            noteTagsInput.value = "";
        };

        submitNoteBtn.onclick = async () => {
            const User = localStorage.getItem("loggedInUser");
            const now = new Date().toISOString();
            const token = User ? JSON.parse(User).token : null;
            
            // FIXED: Extracting raw HTML formatted string content and checking length natively via imported config object
            const editorContent = quill ? quill.root.innerHTML.trim() : "";
            const isEditorEmpty = !quill || quill.getText().trim().length === 0;

            const newNote = {
                title: noteTitleInput.value.trim(),
                content: editorContent, 
                isPinned: notePinnedInput.checked,
                tags,
                createdAt: now,
                updatedAt: now
            };

            if (!newNote.title || isEditorEmpty) {
                showNotification("error", "Title and content cannot be empty.");
                return;
            }

            closeModal(addnoteCard);

            try {
                await sendNoteToBackend(newNote, token);
                await getNotesForUser(token);
            } catch (error) {
                console.error(error);
            }
        };
    });
}