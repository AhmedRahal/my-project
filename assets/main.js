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
import {initIPC} from "./js/electron/ipc.js";
import { checkStatus } from "./js/utils/statue.js";
import {toggleFilterDropdown} from "./js/ui/search.js";

const settingsBtn = document.querySelector('header .settings-menu');
const settingsDropdown = document.querySelector('header .settings-dropdown');
const darkModeToggle = document.querySelector('header .settings-dropdown #dark-mode .toggle input');
const signUpCard = document.getElementById("signUp-card");
const addnoteCard = document.querySelector(".add-note-card");
let messageclosebtns = document.getElementsByClassName("close-message");
let loggedInUser = getFromLocalStorage("loggedInUser");
let settings = {
    darkMode: false,
};
overlay.addEventListener("click", () => {
    closeAllModals();
});


settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showModal(settingsDropdown,{fromEvent:'settingsBtn'});
});






darkModeToggle.addEventListener('change', () => {
    settings.darkMode = darkModeToggle.checked;
    applyTheme(settings.darkMode);
    saveToLocalStorage('settings', settings);
});
loadSettings();              
triggerAddNoteModal();   
toggleFilterDropdown();

window.addEventListener('DOMContentLoaded', () => {
    initIPC();
    checkStatus();
    setupQuillInstances().catch(err => {
        console.error("Delayed Quill engine initialization failed completely: ", err);
    });
});
window.addEventListener('online', () => {
    checkStatus();
});
window.addEventListener('offline', () => {
    checkStatus();
});