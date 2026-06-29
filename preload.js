const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    setStartup: (value) => ipcRenderer.send('set-startup', value),
    getStartup: () => ipcRenderer.invoke('get-startup')
});