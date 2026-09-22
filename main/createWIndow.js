const { BrowserWindow, app } = require("electron");
const path = require("path");

function setupDevToolsBounds(win) {
	const updateBounds = () => {
		if (win.webContents.isDevToolsOpened()) {
			const [width, height] = win.getContentSize();
			const titlebarHeight = 40; // Height of your top .frame toolbar

			// Constrain DevTools below the 40px toolbar
			win.webContents.devToolsWebContents?.hostWebContents?.setBounds({
				x: 0,
				y: titlebarHeight,
				width: width,
				height: height - titlebarHeight,
			});
		}
	};

	win.webContents.on("devtools-opened", () => {
		setTimeout(updateBounds, 50);
	});

	win.on("resize", updateBounds);
}

function createWindow() {
	const win = new BrowserWindow({
		width: 1000,
		height: 700,
		minWidth: 800,
		minHeight: 500,
		backgroundColor: "#1e1e1e",
		titleBarStyle: "hidden",
		titleBarOverlay: {
			color: "#1e1e1e",
			symbolColor: "#ffffff",
			height: 40,
		},
		webPreferences: {
			preload: path.join(__dirname, "..", "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
		},
	});

	if (!app.isPackaged) {
		const devUrl =
			process.env["ELECTRON_RENDERER_URL"] ||
			process.env["VITE_DEV_SERVER_URL"] ||
			"http://localhost:5173";
		win.loadURL(devUrl);
	} else {
		win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
	}

	// Position DevTools below the top titlebar
	setupDevToolsBounds(win);

	// Only auto-open DevTools in dev — was previously unconditional, which
	// meant it also opened for end users in a packaged build.
	if (!app.isPackaged) {
		win.webContents.openDevTools({ mode: "right" });
	}

	win.webContents.on("did-finish-load", () => {
		win.webContents.send("window-is-maximized", win.isMaximized());
	});

	win.on("maximize", () => win.webContents.send("window-is-maximized", true));
	win.on("unmaximize", () =>
		win.webContents.send("window-is-maximized", false),
	);

	return win;
}

module.exports = { createWindow };
