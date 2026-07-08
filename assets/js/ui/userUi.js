import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { getNotesForUser } from "../api/notes.js";
import { signUp } from "../auth/signUp.js";
import { showModal, closeAllModals } from "./modals.js";
import { showNotification } from "./notification.js";
import { loginUser } from "../auth/login.js";
import { logout } from "../auth/logout.js";
import { handlesNotesUI } from "./notesUI.js";
import { checkStatus } from "../utils/statue.js"

const userDiv = document.querySelector('header .user');
const usersignUpLogout = document.getElementById("user-signUp-logout");
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

export async function handlesUserUI(loggedInUser) {
    // 1. Correctly wait for DOM container to be built/removed
            await handlesNotesUI(loggedInUser);
    if (!loggedInUser) {
        searchBar.addEventListener("click", (e) => {
            e.stopPropagation();
            showNotification("warning", "Please log in to search your notes.");
            closeAllModals();
        });

        userDiv.children[0].src = "assets/images/df_user.png";
        userDiv.children[1].textContent = "Guest";

        usersignUpLogout.innerHTML = `<button id="signUp-btn">signUp</button><br><button id="login-btn">log in</button>`;
        
        const signUpBtn = document.getElementById("signUp-btn");
        const loginBtn = document.getElementById("login-btn");
        
        signUpBtn.onclick = (e) => {
            e.stopPropagation();
            if (checkStatus(null, false)) {
                signUp();
            } else {
                showNotification("warning", "you are offline. please connect to the internet to login");
                closeAllModals();
            }
        };
        
        loginBtn.onclick = (e) => {
            e.stopPropagation();
            if (checkStatus(null, false)) {
                loginUser();
            } else {
                showNotification("warning", "you are offline. please connect to the internet to login");
                closeAllModals();
            }
        };

    } else {
        usersignUpLogout.innerHTML = `<button id="logout-btn">log out</button>`;
        
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.onclick = () => { 
            logout();
        };

        searchBar.addEventListener("click", (e) => {
            const isDropdownClick = e.target.closest('.filter-dropdown-panel');
            const isToggleBtnClick = e.target.closest('.filter-toggle-btn');

    // If it's either of those, do nothing and return early
    if (isDropdownClick || isToggleBtnClick) {
        return;
    }
            e.stopPropagation();        
            showModal(searchBar, {noOverlay: true, additionalModals: [document.getElementById('filterDropdownPanel')], fromEvent: 'userDiv' });
        });
        
        saveToLocalStorage("loggedInUser", loggedInUser);
        
        if (loggedInUser.image.startsWith('assets/')) {
            userDiv.children[0].src = loggedInUser.image;
        } else {
            userDiv.children[0].src = `http://localhost:5000/${loggedInUser.image}`;
        }
        
        userDiv.children[1].textContent = loggedInUser.username || "User";
        
        // 2. This will now flawlessly render notes because handlesNotesUI finished preparing the DOM node

        await getNotesForUser(loggedInUser.token);
    }

}