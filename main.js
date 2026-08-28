const { app, BrowserWindow, ipcMain, Menu, nativeTheme } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
let pythonProcess = null;

function startPythonBackend() {
	if (!app.isPackaged) {
		console.log("Starting Python backend in dev mode...");

		const pythonExecutable = "py";
		const scriptPath = path.resolve("C:/DEV/python back end/app.py");

		pythonProcess = spawn(pythonExecutable, [scriptPath], {
			stdio: "inherit",
		});

		pythonProcess.on("error", (err) => {
			console.error("Failed to start Python process:", err);
		});
	}
}

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
			preload: path.join(__dirname, "preload.js"),
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
		win.loadFile(path.join(__dirname, "dist", "index.html"));
	}

	// Position DevTools below the top titlebar
	setupDevToolsBounds(win);

	// Dock DevTools to the right side
	win.webContents.openDevTools({ mode: "right" });

	win.webContents.on("did-finish-load", () => {
		win.webContents.send("window-is-maximized", win.isMaximized());
	});

	win.on("maximize", () => win.webContents.send("window-is-maximized", true));
	win.on("unmaximize", () =>
		win.webContents.send("window-is-maximized", false),
	);
}

app.whenReady().then(() => {
	nativeTheme.themeSource = "dark";
	startPythonBackend();
	createWindow();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on("will-quit", () => {
	if (pythonProcess) {
		console.log("Stopping Python backend...");
		pythonProcess.kill();
		pythonProcess = null;
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

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

ipcMain.on("set-startup", (event, value) => {
	app.setLoginItemSettings({ openAtLogin: value });
});

ipcMain.handle("get-startup", () => {
	return app.getLoginItemSettings().openAtLogin;
});

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
