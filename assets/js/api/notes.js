import { createNotes } from "../ui/notesUi.js";
import { showNotification } from "../ui/notification.js";
import { apiUrl } from "./config.js";
import { handleApiError } from "./errorHandler.js";


export async function getNotesForUser(token) { 
    try {
        const response = await fetch(`${apiUrl}notes/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }
        const notes = await response.json();
        console.log('Fetched notes:', notes);
        createNotes(notes);

    } catch (error) {
        handleApiError(error);
    }
}

// add note
export async function sendNoteToBackend(note, token) {
    await fetch(`${apiUrl}notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(note)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Note saved successfully:', data);
        showNotification("success", "Note saved successfully");
    })
    .catch(error => {
        handleApiError(error);
    });
}

// delete note
export function deleteNote(noteId, token) {
    fetch(`${apiUrl}delete/note/${noteId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            console.error(`Failed to delete note with id ${noteId}. Status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification("success", "Note deleted successfully");
            console.log(`Note with id ${noteId} deleted successfully.`, data);
            getNotesForUser(token);
        } else {
            showNotification("error", data.error || "Failed to delete note");
        }
    })
    .catch(error => {
        console.error('Error deleting note:', error);
        showNotification("error", error.message || "An error occurred while deleting the note");
    });
}
export async function updateNote(noteId, updatedNote, token) {
    try {
        const response = await fetch(`${apiUrl}update/note/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedNote)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }
        const data = await response.json();
        console.log('Note updated successfully:', data);
        showNotification("success", "Note updated successfully");
        getNotesForUser(token);
    } catch (error) {
        handleApiError(error);
    }
}