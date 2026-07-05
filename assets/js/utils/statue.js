import {showNotification} from "../ui/notification.js";

let onlineStatus = navigator.onLine;
export function checkStatus() {
    if (navigator.onLine) {
        showNotification("success", "You are online. You can sync your notes with the server.");
        console.log("Online");
        return true;
    } else {
        showNotification("warning", "You are in offline mode. All changes will be saved locally and synced when back online.");
        console.log("Offline");
        return false;
    }  
}