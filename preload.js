const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // 1. Existing paths
    setStartup: (value) => ipcRenderer.send('set-startup', value),
    getStartup: () => ipcRenderer.invoke('get-startup'),
    saveNote: (data) => ipcRenderer.send('save-note', data),
loadQuillScript: () => {
    return new Promise((resolve, reject) => {
        // 1. If Quill is already fully loaded in the window global, resolve immediately!
        if (window.Quill) {
            return resolve();
        }

        const existingScript = document.getElementById('quill-script-engine');
        
        // 2. If script exists, check if it already finished loading or attach listeners safely
        if (existingScript) {
            // If it somehow finished loading before window.Quill bound, or is active
            if (existingScript.dataset.loaded === "true") {
                return resolve();
            }
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject("Failed loading local quill.js"));
            return;
        }

        const script = document.createElement('script');
        script.id = 'quill-script-engine';
        script.src = './node_modules/quill/dist/quill.js';
        
        script.onload = () => {
            script.dataset.loaded = "true"; // Mark it as loaded for subsequent calls
            setTimeout(() => resolve(), 50);
        };
        script.onerror = () => reject("Failed to load local quill.js from node_modules");
        
        document.head.appendChild(script);
    });
}
});