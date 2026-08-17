import {saveToLocalStorage, getFromLocalStorage} from "../utils/storage.js";
import {showNotification} from "../ui/notification.js";
import {handlesUserUI} from "../ui/userUi.js";
import {closeAllModals} from "../ui/modals.js";
export function logout(message = true) {
    console.log("Logging out"); 
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    saveToLocalStorage("loggedInUser", null);
    let loggedInUser = getFromLocalStorage("loggedInUser");
    handlesUserUI(loggedInUser);
    
    if (message) {
        showNotification("success", "Logged out successfully");
    }
    closeAllModals();
}