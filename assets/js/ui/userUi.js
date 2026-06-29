/* --- FILE: assets/js/ui/userUi.js --- */

import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { getNotesForUser } from "../api/notes.js";
import { signUp } from "../auth/signUp.js";
import { showModal, closeAllModals } from "./modals.js";
import { showNotification } from "./notification.js";
import { loginUser } from "../auth/login.js";
import { logout } from "../auth/logout.js";

const userDiv = document.querySelector('header .user');
const usersignUpLogout = document.getElementById("user-signUp-logout");
const notesContainer = document.querySelector(".notes-content");
const searchBar = document.querySelector('header .search-bar');

export function handlesUserUI(loggedInUser) {
    const addNoteBtn = document.getElementById("addNoteBtn");
    const noNotesMessage = document.querySelector(".no-notes-message");

    if (!loggedInUser) {
        notesContainer.innerHTML = '';
        
        // Use an assignment property to avoid duplicate click bindings
        searchBar.onclick = () => {
            showNotification("warning", "Please log in to search your notes.");
            closeAllModals();
        };

        userDiv.children[0].src = "assets/images/df_user.png";
        userDiv.children[1].textContent = "Guest";
        noNotesMessage.style.display = "block";
        noNotesMessage.innerHTML = "Please log in to view your notes.";
        
        usersignUpLogout.innerHTML = `<button id="signUp-btn">signUp</button><br><button id="login-btn">log in</button>`;
        
        const signUpBtn = document.getElementById("signUp-btn");
        const loginBtn = document.getElementById("login-btn");
        addNoteBtn.style.display = "none";
        
        // Use .onclick to safely overwrite previous event listeners
        signUpBtn.onclick = () => {
            signUp();
        };
        
        loginBtn.onclick = () => {
            loginUser();
        };

    } else {
        noNotesMessage.style.display = "none";
        noNotesMessage.innerHTML = "";
        usersignUpLogout.innerHTML = `<button id="logout-btn">log out</button>`;
        
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.onclick = () => { 
            logout();
        };

        searchBar.onclick = () => {
            showModal(searchBar);
        };
        
        addNoteBtn.style.display = "block";
        saveToLocalStorage("loggedInUser", loggedInUser);
        
        if (loggedInUser.image.startsWith('assets/')) {
            userDiv.children[0].src = loggedInUser.image;
        } else {
            userDiv.children[0].src = `http://localhost:5000/${loggedInUser.image}`;
        }
        
        userDiv.children[1].textContent = loggedInUser.username || "User";
        getNotesForUser(loggedInUser.token);
    }
}