import { initializeQuillEditor } from '../ui/editor.js';
import { setQuillTitleInstance, setQuillContentInstance } from '../ui/config.js';

let quillOptions = {
    theme: 'snow',
    placeholder: 'Write something amazing...',
    modules: {
        toolbar: [
            [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            ['code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['image', 'formula'],
            ['clean']
        ]
    }
};

let titlequillOptions = {
    theme: 'snow',
    placeholder: 'Enter note title...',
    modules: {
        toolbar: [
            [{ 'font': [] }, { 'size': ['small', false, 'large'] }],
            [{ 'color': [] }, { 'background': [] }],
        ],
        keyboard: {
            bindings: {
                blockEnter: {
                    key: 'Enter',
                    handler: function() { return false; }
                },
                blockShiftEnter: {
                    key: 'Enter',
                    shiftKey: true,
                    handler: function() { return false; }
                }
            }
        }
    }
};

// Export the initialization so it can be safely triggered once the UI elements exist
export async function setupQuillInstances() {
    // 1. Initialize Main Content Editor
    const contentInstance = await initializeQuillEditor('#editor-container', quillOptions);
    if (contentInstance) {
        setQuillContentInstance(contentInstance);

    }

    const titleEditorInstance = await initializeQuillEditor('#note-title', titlequillOptions);
    console.log("D");
    if (titleEditorInstance) {
        setQuillTitleInstance(titleEditorInstance);
        
        titleEditorInstance.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            delta.forEach((op) => {
                if (op.insert && typeof op.insert === 'string') {
                    op.insert = op.insert.replace(/\n/g, ' ');
                }
            });
            return delta;
        });
    }
}