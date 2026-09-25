const { ipcRenderer } = require("electron");

module.exports = {
	dbrequest: (request) => ipcRenderer.invoke("db-request", request),
	saveNote: (data) => ipcRenderer.send("save-note", data),
	dbGetNotes: (userId) => ipcRenderer.invoke("db:get-notes", userId),
    dbSaveNote: (note) => ipcRenderer.invoke("db:save-note", note),
    dbGetDirtyNotes: () => ipcRenderer.invoke("db:get-dirty-notes"),
    dbMarkSynced: (ids) => ipcRenderer.invoke("db:mark-synced", ids),
	dbCacheNote: (note) => ipcRenderer.invoke("db:cache-note", note),
	dbCacheNotesBulk: (notes) => ipcRenderer.invoke("db:cache-notes-bulk", notes),
	dbDeleteNoteLocal: (noteId) => ipcRenderer.invoke("db:delete-note-local", noteId),
	dbCountDirtyNotes: (userId) => ipcRenderer.invoke("db:count-dirty-notes", userId),
};
