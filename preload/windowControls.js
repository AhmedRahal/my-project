const { ipcRenderer } = require("electron");

module.exports = {
	minimizeWindow: () => ipcRenderer.send("window-minimize"),
	toggleMaximizeWindow: () => ipcRenderer.send("window-maximize-toggle"),
	closeWindow: () => ipcRenderer.send("window-close"),
	onMaximizedStateChange: (callback) => {
		const subscription = (_event, isMaximized) => callback(isMaximized);
		ipcRenderer.on("window-is-maximized", subscription);
		return () =>
			ipcRenderer.removeListener("window-is-maximized", subscription);
	},
};
