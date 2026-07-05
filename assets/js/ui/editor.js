export async function initializeQuillEditor(id, options) {
    try {
        // Wait completely until the script is injected and window.Quill is initialized
        await window.api.loadQuillScript();
        console.log("Quill script loaded successfully, window.Quill is now available.");
        if (!window.Quill) {
            throw new Error("Quill script loaded, but window.Quill remains undefined.");
        }

        // CRITICAL FIX: Only register global formats once to prevent registry corruption
        if (!window.Quill.__stylesRegistered) {
            const ColorStyle = window.Quill.import('attributors/style/color');
            const BackgroundStyle = window.Quill.import('attributors/style/background');
            // const SizeStyle = window.Quill.import('attributors/style/size');
            const AlignStyle = window.Quill.import('attributors/style/align');

            window.Quill.register(ColorStyle, true);
            window.Quill.register(BackgroundStyle, true);
            // window.Quill.register(SizeStyle, true);
            window.Quill.register(AlignStyle, true);
            
            window.Quill.__stylesRegistered = true;
        }

        // Explicitly format configuration constraints
        options.formats = options.formats || [
            'background', 'bold', 'color', 'font', 'code', 
            'italic', 'link', 'size', 'strike', 'underline', 
            'blockquote', 'header', 'indent', 'list', 'align', 
            'direction', 'code-block', 'image', 'video'
        ];

        // Create Instance safely
        let quillInstance = new window.Quill(id, options);
        return quillInstance; 
    } catch (err) {
        console.error("Editor Setup Error:", err);
    }
}

export function enableToolbarTooltips(quillInstance, enable = true) {
    if (!enable || !quillInstance) return;
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

    const container = quillInstance.container.parentElement;
    const toolbarContainer = container.querySelector('.ql-toolbar');
    if (!toolbarContainer) return;

    for (const [className, titleText] of Object.entries(tooltipTitles)) {
        const button = toolbarContainer.querySelector(`button.ql-${className}`);
        if (button) button.setAttribute('title', titleText);
        
        const picker = toolbarContainer.querySelector(`.ql-picker.ql-${className}`);
        if (picker) picker.setAttribute('title', titleText);
    }
}