const { ipcMain, app } = require("electron");

function registerStartupHandlers() {
	ipcMain.on("set-startup", (event, value) => {
		app.setLoginItemSettings({ openAtLogin: value });
	});

	ipcMain.handle("get-startup", () => {
		return app.getLoginItemSettings().openAtLogin;
	});
}

module.exports = { registerStartupHandlers };
