import { showNotification } from "../ui/notification.js";
import { logout } from "../auth/logout.js";
import { handlesSignUpUIError } from "../auth/signup.js";
import {stopLoading} from "../utils/requestManager.js";
export function handleApiError(error) {
    console.log('API Error:', error);
    if (error.code === "TOKEN EXPIRED") {
        showNotification("error", "Your session has expired. Please log in again.");
        logout();
        throw error;
    } else if (error.code === "INVALID TOKEN") {
        showNotification("error", "Invalid session. Please log in again.");
        throw error;
    } else if (error.code === "USERNAME TAKEN") {
        handlesSignUpUIError(error.code);
        throw error;
    }

    else if (error.code === "INCORRECT PASSWORD") {
        showNotification("error", "Incorrect old password");
        throw error;
    }
    else if (error.code === "EMPTY FIELDS") {
        showNotification("error", "Both old and new passwords are required");
        throw error;
    }
    else if (error.code === "USERNAME TAKEN") {
        showNotification("error", "Username is already taken");
        throw error;
    }
    
    else {
        showNotification("error", error || "An unexpected error occurred");

        throw error;
    }

}