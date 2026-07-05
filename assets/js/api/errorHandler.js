import { showNotification } from "../ui/notification.js";
import { logout } from "../auth/logout.js";

export function handleApiError(error) {
    console.log('API Error:', error);
    if (error.code === "TOKEN EXPIRED") {
        console.warn("sssss")
        showNotification("error", "Your session has expired. Please log in again.");
        logout();
    } else if (error.code === "INVALID TOKEN") {
        showNotification("error", "Invalid session. Please log in again.");
        logout();
    } else {
        showNotification("error", error || "An unexpected error occurred");
    }
}