import {saveToLocalStorage} from "../utils/storage.js";
import {showNotification} from "../ui/notification.js";
import {handlesUserUI} from "../ui/userUi.js";
export function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    saveToLocalStorage("loggedInUser", null);
    handlesUserUI();
    showNotification("success", "Logged out successfully");
}