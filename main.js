const { app, BrowserWindow, ipcMain, Menu ,nativeTheme} = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        backgroundColor: '#1e1e1e',
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');
}


app.whenReady().then(() => {

    nativeTheme.themeSource = 'dark';
    createWindow();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS ---
ipcMain.on('set-startup', (event, value) => {
    app.setLoginItemSettings({ openAtLogin: value });
});

ipcMain.handle('get-startup', () => {
    return app.getLoginItemSettings().openAtLogin;
});