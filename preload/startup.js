const { ipcRenderer } = require("electron");

module.exports = {
	setStartup: (value) => ipcRenderer.send("set-startup", value),
	getStartup: () => ipcRenderer.invoke("get-startup"),
};
