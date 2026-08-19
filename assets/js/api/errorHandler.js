import { showNotification } from "../ui/notification.js";
import { logout } from "../auth/logout.js";
import { handlesSignUpUIError } from "../auth/signup.js";
<<<<<<< HEAD
import { stopLoading } from "../utils/requestManager.js";

=======
import {stopLoading} from "../utils/requestManager.js";
>>>>>>> 5baacea (added a profile section new refactored code bugs fixes and ui/ux improvements)
export function handleApiError(error) {
    // 1. Check for custom backend error codes first
    if (error?.code) {
        switch (error.code) {
            case "TOKEN EXPIRED":
                showNotification("error", "Your session has expired. Please log in again.");
                logout();
                throw error;

            case "INVALID TOKEN":
                showNotification("error", "Invalid session. Please log in again.");
                throw error;

            case "USERNAME TAKEN":
                handlesSignUpUIError(error.code);
                showNotification("error", "Username is already taken");
                throw error;

            case "INCORRECT PASSWORD":
                showNotification("error", "Incorrect old password");
                throw error;

            case "EMPTY FIELDS":
                showNotification("error", "Both old and new passwords are required");
                throw error;
        }
    } 

    if (
        error instanceof TypeError || 
        error?.name === "TypeError" || 
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError")
    ) {
        showNotification("error", "there was a problem trying to connect to the server.");
        stopLoading(); // Optional cleanup if needed
        return;
    }

<<<<<<< HEAD
    console.error("Unhandled API Error:", error);
    showNotification("error", error?.message || "An unexpected error occurred");
    throw error;
=======
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

>>>>>>> 5baacea (added a profile section new refactored code bugs fixes and ui/ux improvements)
}