const { ipcRenderer } = require("electron");

module.exports = {
	dbQueueAction: (action) => ipcRenderer.invoke("db:queue-action", action),
	dbGetQueuedActions: (userId) => ipcRenderer.invoke("db:get-queued-actions", userId),
	dbClearQueuedAction: (id) => ipcRenderer.invoke("db:clear-queued-action", id),
	dbCountQueuedActions: (userId) => ipcRenderer.invoke("db:count-queued-actions", userId),
};
