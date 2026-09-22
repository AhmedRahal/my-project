const { app, BrowserWindow, nativeTheme } = require("electron");
const { createWindow } = require("./createWIndow.js");
const { startPythonBackend, stopPythonBackend } = require("./pythonbackend.js");
const { setupDatabase } = require("./database.js");
const { registerIpcHandlers } = require("../ipc/index.js");
const { registerDbHandlers } = require("./dbhandlers.js");
app.whenReady().then(() => {
	nativeTheme.themeSource = "dark";
	registerDbHandlers();
	setupDatabase();
	registerIpcHandlers();
	startPythonBackend();
	createWindow();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on("will-quit", () => {
	stopPythonBackend();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
