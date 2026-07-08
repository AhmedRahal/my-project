import {saveToLocalStorage, getFromLocalStorage} from "../utils/storage.js";
import {showNotification} from "../ui/notification.js";
import {handlesUserUI} from "../ui/userUi.js";
import {closeAllModals} from "../ui/modals.js";
export function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    saveToLocalStorage("loggedInUser", null);
    closeAllModals();
    let loggedInUser = getFromLocalStorage("loggedInUser");
    handlesUserUI(loggedInUser);
    showNotification("success", "Logged out successfully");
}