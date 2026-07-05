const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    setStartup: (value) => ipcRenderer.send('set-startup', value),
    getStartup: () => ipcRenderer.invoke('get-startup'),
    saveNote: (data) => ipcRenderer.send('save-note', data),
loadQuillScript: () => {
    return new Promise((resolve, reject) => {
        if (window.Quill) {
            return resolve();
        }

        const existingScript = document.getElementById('quill-script-engine');
        if (existingScript) {
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
            script.dataset.loaded = "true"; 
            setTimeout(() => resolve(), 50);
        };
        script.onerror = () => reject("Failed to load local quill.js from node_modules");
        
        document.head.appendChild(script);
    });
}
});