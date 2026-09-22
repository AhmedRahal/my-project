const { ipcMain, BrowserWindow } = require("electron");

function registerWindowControlHandlers() {
	ipcMain.on("window-minimize", (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) win.minimize();
	});

	ipcMain.on("window-maximize-toggle", (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) {
			if (win.isMaximized()) {
				win.unmaximize();
			} else {
				win.maximize();
			}
		}
	});

	ipcMain.on("window-close", (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) win.close();
	});
}

module.exports = { registerWindowControlHandlers };
