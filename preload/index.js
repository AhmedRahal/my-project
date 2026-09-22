const { contextBridge } = require("electron");
const windowControls = require("./windowControls.js");
const startup = require("./startup.js");
const theme = require("./theme.js");
const notes = require("./notes.js");
const offlineQueue = require("./offlineQueue.js");

contextBridge.exposeInMainWorld("api", {
	...windowControls,
	...startup,
	...theme,
	...notes,
	...offlineQueue,
});
