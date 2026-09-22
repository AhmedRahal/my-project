const { ipcMain, BrowserWindow, nativeTheme } = require("electron");

function registerThemeHandlers() {
	ipcMain.on("update-titlebar-overlay", (event, { isDark }) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		nativeTheme.themeSource = isDark ? "dark" : "light";
		if (win) {
			win.setTitleBarOverlay({
				color: isDark ? "#1e1e1e" : "#ffffff",
				symbolColor: isDark ? "#ffffff" : "#000000",
				height: 40,
			});
		}
	});
}

module.exports = { registerThemeHandlers };
