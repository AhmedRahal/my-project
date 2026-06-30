import {quill,setQuillInstance} from "./config.js";

export async function initializeQuillEditor(id, options) {
    try {
        await window.api.loadQuillScript();
        
        // Ensure Quill actually attached to window
        if (!window.Quill) {
            throw new Error("Quill script loaded, but window.Quill is undefined.");
        }
        
        // 1. Create the instance locally
        const quillInstance = new window.Quill(id, options);

        // 2. Pass it back to your config store
        setQuillInstance(quillInstance);

        enableToolbarTooltips();
        
        return quillInstance; // Return it so you can use it if needed
    } catch (err) {
        console.error("Editor Setup Error:", err);
    }
}



export function enableToolbarTooltips(enable = true) {
    if (!enable) return;
    const tooltipTitles = {
        'bold': 'Bold (Ctrl+B)',
        'italic': 'Italic (Ctrl+I)',
        'underline': 'Underline (Ctrl+U)',
        'image': 'Insert Image',
        'code-block': 'Insert Code Block',
        'clean': 'Clear Formatting',
        'font': 'Font Family',
        'size': 'Text Size',
        'color': 'Text Color',
        'background': 'Background Highlight Color'
    };

    // Find all buttons and pickers inside your custom modern toolbar container
    const toolbarContainer = document.querySelector('.ql-toolbar');
    if (!toolbarContainer) return;

    // 1. Label standard buttons
    for (const [className, titleText] of Object.entries(tooltipTitles)) {
        const button = toolbarContainer.querySelector(`button.ql-${className}`);
        if (button) {
            button.setAttribute('title', titleText);
        }
    }

    // 2. Label drop-down pickers
    for (const [className, titleText] of Object.entries(tooltipTitles)) {
        const picker = toolbarContainer.querySelector(`.ql-picker.ql-${className}`);
        if (picker) {
            picker.setAttribute('title', titleText);
        }
    }
}