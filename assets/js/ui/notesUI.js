import { closeModal, showModal } from "./modals.js";
import { sendNoteToBackend, getNotesForUser } from "../api/notes.js";
import { timeAgo } from "../utils/time.js";
import { deleteNote } from "../api/notes.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { showNotification } from "./notification.js";
import { quillTitle, quillContent } from "./config.js"; 

const addNoteBtn = document.getElementById("addNoteBtn");
const notesContainer = document.querySelector(".notes-content");

/**
 * Builds a highly professional note block using flat, reliable div structural blocks.
 */
function buildNoteHTML(note) {
    // 1. Process the content string to replace list structural items with clean symbols safely
    let processedContent = note.content;
    if (processedContent) {
        processedContent = processedContent
            .replace(/<li data-list="unchecked">/g, '<li data-list="unchecked"><span class="ql-todo-icon">&#9744;</span> ')
            .replace(/<li data-list="checked">/g, '<li data-list="checked"><span class="ql-todo-icon">&#9745;</span> ');
    }

    return `
        <div class="note-card" id="${note.id}">
            <div class="note-card-header">
                <div class="note-card-title ql-editor">${note.title}</div>
            </div>
            
            <div class="note-card-body content ql-editor">
                ${processedContent}
            </div> 
            
            <div class="note-card-footer">
                <div class="note-tags-wrapper">
                    <ul class="categories">
                        ${note.tags.map(tag => `<li class="note-cat">${tag}</li>`).join('')}
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

export function createNotes(notes) {
    notesContainer.innerHTML = ""; 
    
    const isPinnedNotes = notes.filter(note => note.isPinned);
    const regularNotes = notes.filter(note => !note.isPinned);
    
    // 1. Render Pinned Section
    if (isPinnedNotes.length > 0) {
        const divider = document.createElement("div");
        divider.classList.add("grid-separator");
        divider.innerHTML = `<span>Pinned</span><hr>`;
        notesContainer.appendChild(divider);
                
        isPinnedNotes.forEach(note => {
            notesContainer.insertAdjacentHTML('beforeend', buildNoteHTML(note));
        });
    }
    
    // 2. Section Divider Break
    if (isPinnedNotes.length > 0 && regularNotes.length > 0) {
        const divider = document.createElement("div");
        divider.classList.add("grid-separator");
        divider.innerHTML = `<span>Others</span><hr>`;
        notesContainer.appendChild(divider);
    }
    
    // 3. Render Standard Notes
    regularNotes.forEach(note => {
        notesContainer.insertAdjacentHTML('beforeend', buildNoteHTML(note));
    });  

    // Event Delegations
    let loggedInUser = getFromLocalStorage("loggedInUser");
    let deleteBtns = document.querySelectorAll(`.notes-content .delete-btn`);
    deleteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const noteId = btn.closest('.note-card').id;
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
        const noteTagsInput = document.querySelector("#add-note-card .add-tag input");
        const notePinnedInput = document.getElementById("pinNote");
        const tagsSubmitbtn = document.getElementById("add-tag-btn");
        const tagsContainer = document.querySelector("#add-note-card .tags");
        
        notePinnedInput.checked = false;
        noteTagsInput.value = "";
        tagsContainer.innerHTML = "";

        // Reset both Quill editors
        if (quillTitle) quillTitle.setText('');
        if (quillContent) quillContent.setText('');

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
        
        // FIX: Extract title as styled HTML instead of plain text
        let noteTitle = "";
        if (quillTitle) {
            noteTitle = typeof quillTitle.getSemanticHTML === 'function' 
                ? quillTitle.getSemanticHTML().trim() 
                : quillTitle.root.innerHTML.trim();
        }
        
        let editorContent = "";
        if (quillContent) {
            editorContent = typeof quillContent.getSemanticHTML === 'function' 
                ? quillContent.getSemanticHTML().trim() 
                : quillContent.root.innerHTML.trim();
        }
        
        // Empty checks (Checking against raw text length so empty HTML tags don't bypass validation)
        const isTitleEmpty = !quillTitle || quillTitle.getText().trim().length === 0;
        const isContentEmpty = !quillContent || quillContent.getText().trim().length === 0;

        const newNote = {
            title: noteTitle, // Now contains the inline-styled HTML string
            content: editorContent, 
            isPinned: notePinnedInput.checked,
            tags,
            createdAt: now,
            updatedAt: now
        };

        if (isTitleEmpty || isContentEmpty) {
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
export function handlesNotesUI(user) {
    const noNotesMessage = document.createElement("div");
    noNotesMessage.classList.add("no-notes-message");

    if (user) {
        addNoteBtn.style.display = "block";
        if (document.querySelector(".no-notes-message")) {
            document.querySelector(".no-notes-message").remove();
        }
    } else {
        notesContainer.innerHTML = "";
        noNotesMessage.style.display = "block";
        noNotesMessage.innerHTML = ` <img src="./assets/images/warning.png" alt="No Notes"> <p>Please log in to view your notes.</p>`;
        addNoteBtn.style.display = "none";
        document.body.appendChild(noNotesMessage);
    }
}
