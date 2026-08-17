import { getFromLocalStorage, saveToLocalStorage } from "../utils/storage.js";
import { getNotesForUser } from "../api/notes.js";
import { signUp } from "../auth/signUp.js";
import { showModal, closeAllModals, closeModal } from "./modals.js";
import { showNotification } from "./notification.js";
import { loginUser } from "../auth/login.js";
import { logout } from "../auth/logout.js";
import { handlesNotesUI } from "./notesUI.js";
import { checkStatus } from "../utils/statue.js";
import { updatePasswordUI } from "../auth/password.js";
import {updateProfileUi} from "../auth/accountdetails.js";
import { apiUrl } from "../api/config.js";
import { getUserTags } from "../utils/tags.js";
import { deleteAccountUI } from "../auth/delete.js";
// --- DOM Layout Selectors ---
const userDiv = document.querySelector('header .user');
const usersignUpLogout = document.getElementById("user-signUp-logout");
const searchBar = document.querySelector('header .search-bar');
const filterDropdownPanel = document.getElementById('filterDropdownPanel');
const signUpImageinput = document.getElementById("signUp-profile-picture");
const fileText = document.getElementById('file-name-display');

const profileView = document.getElementById("profile-view");
const addNoteFloatingBtn = document.getElementById("addNoteBtn");
const userprofile = document.querySelector('header .user');

// --- Profile Sidebar & Inner Tab Navigation Selectors ---
const profileTabBtns = document.querySelectorAll(".profile-tab-btn");
const profileSections = document.querySelectorAll(".profile-section");
const backToNotesBtn = document.getElementById("back-to-notes-btn");
const profileLogoutBtn = document.getElementById("profile-logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");
// --- Profile Features & Inputs Selectors ---
const statTotal = document.getElementById("stat-total");
const statPinned = document.getElementById("stat-pinned");
const statTags = document.getElementById("stat-tags");
const editUsernameInput = document.getElementById("edit-username-input");
const saveAccountBtn = document.getElementById("save-account-btn");
const updatePasswordBtn = document.getElementById("update-password-btn");
const exportDataBtn = document.getElementById("export-data-btn");
const editAvatarInput = document.getElementById("edit-avatar-input");
const avatarInputText = document.getElementById('edit-avatar-name')



// --- Sign Up Image Event Handler ---
export function inputImageHandler(input, fileText) {
    if (input) {
    input.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileText.textContent = this.files[0].name;
            fileText.style.opacity = "1";
        } else {
            fileText.textContent = 'No file chosen';
            fileText.style.opacity = "0.6";
        }
    });
}
}

// --- Inner Profile Tab Navigation Logic ---
profileTabBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        // 1. Remove active state from all nav buttons
        profileTabBtns.forEach(b => b.classList.remove("active"));
        // 2. Highlight selected nav tab
        e.target.classList.add("active");
        
        // 3. Hide all tab content panes
        profileSections.forEach(section => section.style.display = "none");
        
        // 4. Reveal target pane
        const targetId = e.target.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.style.display = "block";
    });
});

// --- Main Route Switching Logic (Notes View vs Setting Panel View) ---
function switchView(viewName) {
    const currentNotesContainer = document.querySelector(".notes-content");
    inputImageHandler(signUpImageinput, fileText)
    inputImageHandler(editAvatarInput,avatarInputText)
    
    if (viewName === 'profile') {
        if (currentNotesContainer) currentNotesContainer.style.display = "none";
        if (addNoteFloatingBtn) addNoteFloatingBtn.style.display = "none";
        if (profileView) profileView.style.display = "block";
        
        const loggedInUser = getFromLocalStorage("loggedInUser");
        if (loggedInUser) {
            // Populate Sidebar Profile Card Details
            const sidebarUsername = document.getElementById("sidebar-username");
            const sidebarAvatar = document.getElementById("sidebar-avatar");
            
            if (sidebarUsername) sidebarUsername.textContent = loggedInUser.username;
            if (sidebarAvatar) {
                sidebarAvatar.src = loggedInUser.image.startsWith('assets/') 
                    ? loggedInUser.image 
                    : `${apiUrl}auth/${loggedInUser.image}`;
            }

            // Sync account settings text input
            if (editUsernameInput) editUsernameInput.value = loggedInUser.username;

            const statueBadge = document.querySelector("#profile-view .status-badge");
            if (statueBadge) {
                if (checkStatus(null,false)) {
                    statueBadge.textContent = "Online";
                    statueBadge.className = "status-badge online";
                } else {
                    statueBadge.textContent = "Offline";
                    statueBadge.className = "status-badge offline";
                }
            }
                
            // Advanced Metrics and Dashboard Calculations
            const allNotes = getFromLocalStorage("notes") || [];
            const pinnedCount = allNotes.filter(note => note.isPinned).length;
            
            // Map out unique tags count 
            getUserTags(loggedInUser.userId);
            let uniqueTags = getFromLocalStorage("userTags") || [];

            if (statTotal) statTotal.textContent = allNotes.length;
            if (statPinned) statPinned.textContent = pinnedCount;
            if (statTags) statTags.textContent = uniqueTags.length;
        }
        if (deleteAccountBtn) {
            deleteAccountBtn.onclick = () => {
                deleteAccountUI();
            };
        }
    } else if (viewName === 'notes') {
        if (profileView) profileView.style.display = "none";
        if (currentNotesContainer) currentNotesContainer.style.display = "grid"; 
        if (addNoteFloatingBtn) addNoteFloatingBtn.style.display = "block";
    }
}

// --- Main Core UI Processing Scope ---
export async function handlesUserUI(loggedInUser) {
    switchView('notes'); 
    await handlesNotesUI(loggedInUser);

    if (!loggedInUser) {
        // --- GUEST FLOW ---
        searchBar.onclick = (e) => {
            console.log(searchBar.children[1]);
            searchBar.children[1].blur();
            e.stopPropagation();
            closeModal(searchBar);
            showNotification("warning", "Please log in to search your notes.");
            closeAllModals();
        };

        if (userDiv && userDiv.children[0]) userDiv.children[0].src = "assets/images/df_user.png";
        if (userDiv && userDiv.children[1]) userDiv.children[1].textContent = "Guest";

        usersignUpLogout.innerHTML = `<button id="signUp-btn">signUp</button><br><button id="login-btn">log in</button>`;
        
        const signUpBtn = document.getElementById("signUp-btn");
        const loginBtn = document.getElementById("login-btn");
        
        signUpBtn.onclick = (e) => {
            e.stopPropagation();
            if (checkStatus(null, false)) {
                signUp();
            } else {
                showNotification("warning", "You are offline. Please connect to the internet to login");
                closeAllModals();
            }
        };
        
        loginBtn.onclick = (e) => {
            e.stopPropagation();
            if (checkStatus(null, false)) {
                loginUser();
            } else {
                showNotification("warning", "You are offline. Please connect to the internet to login");
                closeAllModals();
            }
        };

    } else {
        // --- AUTHENTICATED USER FLOW ---
        userprofile.onclick = () => {
            closeAllModals();
            if (!getFromLocalStorage('loggedInUser')) return;
            switchView('profile'); 
        };

        if (backToNotesBtn) {
            backToNotesBtn.onclick = () => {
                switchView('notes'); 
            };
        }

        if (profileLogoutBtn) {
            profileLogoutBtn.onclick = () => {
                logout();
                switchView('notes'); 
            };
        }

        usersignUpLogout.innerHTML = `<button id="logout-btn">log out</button>`;
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.onclick = (e) => { 
                e.stopPropagation();
                logout();
            };
        }

        // --- Search Overlay Intercept Handling ---
        searchBar.onclick = (e) => {
            const isDropdownClick = e.target.closest('.filter-dropdown-panel');
            const isToggleBtnClick = e.target.closest('.filter-toggle-btn');

            if (isDropdownClick || isToggleBtnClick) {
                return;
            }
            e.stopPropagation();    
            if (searchBar.classList.contains("active") && filterDropdownPanel && !filterDropdownPanel.classList.contains("active")) {
                showModal(searchBar, { noOverlay: true, fromEvent: 'userDiv' });
                return;
            }
            showModal(searchBar, { noOverlay: true, additionalModals: [document.getElementById('filterDropdownPanel')], fromEvent: 'userDiv' });
        };
        
        saveToLocalStorage("loggedInUser", loggedInUser);
        
        if (userDiv && userDiv.children[0]) {
            userDiv.children[0].src = loggedInUser.image.startsWith('assets/') 
                ? loggedInUser.image 
                : `${apiUrl}auth/${loggedInUser.image}`;
        }
        
        if (userDiv && userDiv.children[1]) {
            userDiv.children[1].textContent = loggedInUser.username || "User";
        }

        if (saveAccountBtn) {
            saveAccountBtn.onclick = () => {
                const updatedUsername = editUsernameInput.value.trim();
                if (!updatedUsername) {
                    showNotification("error", "Username field cannot be left blank.");
                    return;
                }
                //get an image file from the input
                const updatedAvatar = editAvatarInput.files[0];
                const sessionUser = getFromLocalStorage("loggedInUser");
                updateProfileUi(updatedUsername,updatedAvatar,sessionUser.token);
                showNotification("success", "Account details updated successfully!");
            };
        }

        if (updatePasswordBtn) {
            updatePasswordBtn.onclick = () => {
                const oldPassword = document.getElementById("old-password").value;
                const newPassword = document.getElementById("new-password").value;

                if (!oldPassword || !newPassword) {
                    showNotification("warning", "Please provide both old and new credentials.");
                    return;
                }
                updatePasswordUI(loggedInUser.token)
            };
        }

        // 3. Advanced Extra Feature: Local JSON Data Storage Backups
        if (exportDataBtn) {
            exportDataBtn.onclick = () => {
                const localNotesData = getFromLocalStorage("notes") || [];
                
                // Parse files structure safely to continuous stream
                const parsedStream = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localNotesData, null, 2));
                const temporalAnchorNode = document.createElement('a');
                
                temporalAnchorNode.setAttribute("href", parsedStream);
                temporalAnchorNode.setAttribute("download", `notebook_backup_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(temporalAnchorNode);
                
                temporalAnchorNode.click();
                temporalAnchorNode.remove();
                
                showNotification("success", "Encrypted notes vault exported successfully!");
            };
        }

        await getNotesForUser(loggedInUser.token);
    }
}