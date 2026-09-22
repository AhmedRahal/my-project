const { ipcRenderer } = require("electron");

module.exports = {
	updateTitleBarOverlay: (themeOptions) =>
		ipcRenderer.send("update-titlebar-overlay", themeOptions),
};
