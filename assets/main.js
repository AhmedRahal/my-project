import {loadSettings} from "./js/ui/settings.js";
import { getFromLocalStorage ,saveToLocalStorage} from "./js/utils/storage.js";
import {handlesUserUI} from "./js/ui/userUi.js";
import { showModal,closeAllModals } from "./js/ui/modals.js";
import {getNotesForUser} from "./js/api/notes.js";
import {triggerAddNoteModal} from "./js/ui/notesUI.js";
import { applyTheme } from "./js/ui/theme.js";
import {initializeQuillEditor} from "./js/ui/editor.js";
const searchBar = document.querySelector('header .search-bar');

const settingsBtn = document.querySelector('header .settings-menu');
const settingsDropdown = document.querySelector('header .settings-dropdown');
const darkModeToggle = document.querySelector('header .settings-dropdown #dark-mode .toggle input');
const userDiv = document.querySelector('header .user');
const signUpUsernameInput = document.getElementById("signUp-username");
const signUpPasswordInput = document.getElementById("signUp-password");
const signUpImageinput = document.getElementById("signUp-profile-picture");
const signUpCard = document.getElementById("signUp-card");
const fileText = document.getElementById('file-name-display');
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const submitLoginBtn = document.getElementById("submit-login");
const adddNoteBtn = document.getElementById("addNoteBtn");
const addnoteCard = document.querySelector(".add-note-card");
let messageclosebtns = document.getElementsByClassName("close-message");
let loggedInUser = getFromLocalStorage("loggedInUser");
let userNotifications = [];
let settings = {
    darkMode: false,
};

overlay.addEventListener("click", () => {
    closeAllModals();
});

settingsBtn.addEventListener("click", (e) => {
    showModal(settingsDropdown)
    
    

})
let quillOptions = {
            theme: 'snow',
            placeholder: 'Write something amazing...',
            modules: {
            toolbar: [
                        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                        [ 'code-block'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                        [{ 'direction': 'rtl' }, { 'align': [] }],        // text direction & alignment
                        ['image', 'formula'],            // media links
                        ['clean']                                         // remove formatting button
                    ]
                }
            }
;(async () => {
    // 1. Initialize Main Editor
    await initializeQuillEditor('#editor-container', quillOptions);

    // 2. Title Editor Options (Explicitly NO lists or block features)
    let titlequillOptions = {
        theme: 'snow',
        placeholder: 'Enter note title...',
        modules: {
            // Title toolbar: Only text styling, NO lists or formatting blocks
            toolbar: [
                [{ 'font': [] }, { 'size': ['small', false, 'large'] }],
                [{ 'color': [] }, { 'background': [] }],
            ],
            // Block the Enter key from creating new lines/paragraphs
            keyboard: {
                bindings: {
                    handleEnter: {
                        key: 'Enter',
                        handler: function() {
                            // Do nothing, preventing line jumps entirely
                            return false; 
                        },
                        key: 'shift+Enter',
                        handler: function() {
                            // Do nothing, preventing line jumps entirely
                            return false;
                        }
                    }
                }
            }
        }
    };

    console.log('loading note title quill');
    // 3. Initialize Title Editor
    const titleEditorInstance = await initializeQuillEditor('#note-title', titlequillOptions);

    // 4. Extra safety fallback to catch pasted text with line breaks in the title
    if (titleEditorInstance) {
        titleEditorInstance.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            delta.forEach((op) => {
                if (op.insert && typeof op.insert === 'string') {
                    op.insert = op.insert.replace(/\n/g, ' '); // Turn enters into spaces
                }
            });
            return delta;
        });
    }
})();
settingsDropdown.addEventListener("click", (e) => {
    e.stopPropagation() })




signUpImageinput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileText.textContent = this.files[0].name;
        fileText.style.opacity = "1";
    } else {
        fileText.textContent = 'No file chosen';
        fileText.style.opacity = "0.6";
    }
});

// handlesUserUI(loggedInUser);







console.log(getFromLocalStorage('loggedInUser') 
);
darkModeToggle.addEventListener('change', () => {
    settings.darkMode = darkModeToggle.checked;
    applyTheme(settings.darkMode);
    saveToLocalStorage('settings', settings);
});

loadSettings();



triggerAddNoteModal();