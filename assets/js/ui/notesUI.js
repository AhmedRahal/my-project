import { closeModal, showModal } from "./modals.js";
import { sendNoteToBackend, getNotesForUser } from "../api/notes.js";
import {timeAgo} from "../utils/time.js";
import { deleteNote } from "../api/notes.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { showNotification } from "./notification.js";
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
            <p class="content">${note.content}</p>
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
            <p class="content">${note.content}</p>
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
        let loggedInUser = getFromLocalStorage("loggedInUser")
        let deleteBtns = document.querySelectorAll(`.notes-content .delete-btn`);
            deleteBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    const noteId = btn.parentElement.parentElement.id;
                    console.log( noteId);
                    deleteNote(noteId, loggedInUser.token);
                })});
}

export function triggerAddNoteModal() {
    addNoteBtn.addEventListener("click", () => {
        let tags = [];
        closeModal(document.querySelector(".modal.active"));
        const addnoteCard = document.getElementById("add-note-card");
        showModal(addnoteCard);
        const submitNoteBtn = document.getElementById("save-note-btn");
        const noteTitleInput = document.getElementById("note-title");
        const noteContentInput = document.getElementById("note-content");
        const noteTagsInput = document.querySelector("#add-note-card .add-tag input");
        const notePinnedInput = document.getElementById("pinNote");
        const tagsSubmitbtn = document.getElementById("add-tag-btn");
        const tagsContainer = document.querySelector("#add-note-card .tags");

        noteTitleInput.value = "";
        noteContentInput.value = "";
        notePinnedInput.checked = false;
        noteTagsInput.value = "";
        tagsContainer.innerHTML = "";

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
            const token = localStorage.getItem("userToken");
            const now = new Date().toISOString();
            const newNote = {
                title: noteTitleInput.value.trim(),
                content: noteContentInput.value.trim(),
                isPinned: notePinnedInput.checked,
                tags,
                createdAt: now,
                updatedAt: now
            };

            if (!newNote.title || !newNote.content) {
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