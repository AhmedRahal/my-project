const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // 1. Existing paths
    setStartup: (value) => ipcRenderer.send('set-startup', value),
    getStartup: () => ipcRenderer.invoke('get-startup'),
    saveNote: (data) => ipcRenderer.send('save-note', data),

    // 2. Local Script Injector
    loadQuillScript: () => {
        return new Promise((resolve, reject) => {
            // If it's already injected on the page, don't duplicate it
            if (document.getElementById('quill-script-engine')) return resolve();

            const script = document.createElement('script');
            script.id = 'quill-script-engine';
            script.src = './node_modules/quill/dist/quill.js';
            
            script.onload = () => resolve();
            script.onerror = () => reject("Failed to load local quill.js from node_modules");
            
            document.head.appendChild(script);
        });
    }
});