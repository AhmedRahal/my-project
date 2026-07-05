// ==================================================
// FILE: C:\DEV\my-project\assets\main.js
// ==================================================
import { loadSettings } from "./js/ui/settings.js";
import { getFromLocalStorage, saveToLocalStorage } from "./js/utils/storage.js";
import { handlesUserUI } from "./js/ui/userUi.js";
import { showModal, closeAllModals } from "./js/ui/modals.js";
import { getNotesForUser } from "./js/api/notes.js";
import { triggerAddNoteModal } from "./js/ui/notesUI.js";
import { setupQuillInstances } from "./js/quill/instances.js";
import { applyTheme } from "./js/ui/theme.js";

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
    showModal(settingsDropdown);
});

settingsDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
});

signUpImageinput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileText.textContent = this.files[0].name;
        fileText.style.opacity = "1";
    } else {
        fileText.textContent = 'No file chosen';
        fileText.style.opacity = "0.6";
    }
});

console.log(getFromLocalStorage('loggedInUser'));

darkModeToggle.addEventListener('change', () => {
    settings.darkMode = darkModeToggle.checked;
    applyTheme(settings.darkMode);
    saveToLocalStorage('settings', settings);
});
    // 1. Fire Settings initialization immediately (runs synchronously)
    loadSettings();              
    console.log("dom loaded")
    // 2. Bind UI elements
    triggerAddNoteModal();   
// CRITICAL LIFE CYCLE SYNC:

window.addEventListener('DOMContentLoaded', () => {
    

    // 3. Fire Quill text engines asynchronously on their own chain safely
    setupQuillInstances().catch(err => {
        console.error("Delayed Quill engine initialization failed completely: ", err);
    });
});