
import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { getNotesForUser } from "../api/notes.js";
import { signUp } from "../auth/signUp.js";
import { showModal, closeAllModals } from "./modals.js";
import { showNotification } from "./notification.js";
import { loginUser } from "../auth/login.js";
import { logout } from "../auth/logout.js";
import { handlesNotesUI } from "./notesUI.js";

const userDiv = document.querySelector('header .user');
const usersignUpLogout = document.getElementById("user-signUp-logout");
const notesContainer = document.querySelector(".notes-content");
const searchBar = document.querySelector('header .search-bar');
const signUpImageinput = document.getElementById("signUp-profile-picture");
const fileText = document.getElementById('file-name-display');

signUpImageinput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileText.textContent = this.files[0].name;
        fileText.style.opacity = "1";
    } else {
        fileText.textContent = 'No file chosen';
        fileText.style.opacity = "0.6";
    }
});


export function handlesUserUI(loggedInUser) {
    handlesNotesUI(loggedInUser);
    if (!loggedInUser) {
        searchBar.onclick = () => {
            showNotification("warning", "Please log in to search your notes.");
            closeAllModals();
        };

        userDiv.children[0].src = "assets/images/df_user.png";
        userDiv.children[1].textContent = "Guest";

        
        usersignUpLogout.innerHTML = `<button id="signUp-btn">signUp</button><br><button id="login-btn">log in</button>`;
        
        const signUpBtn = document.getElementById("signUp-btn");
        const loginBtn = document.getElementById("login-btn");
        signUpBtn.onclick = () => {
            signUp();
        };
        loginBtn.onclick = () => {
            loginUser();
        };

    } else {

        usersignUpLogout.innerHTML = `<button id="logout-btn">log out</button>`;
        
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.onclick = () => { 
            logout();
        };

        searchBar.onclick = () => {
            showModal(searchBar);
        };
        
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