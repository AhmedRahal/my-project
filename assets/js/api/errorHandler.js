import { showNotification } from "../ui/notification.js";
import { logout } from "../auth/logout.js";
import { handlesSignUpUIError } from "../auth/signup.js";
import { stopLoading } from "../utils/requestManager.js";

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

    console.error("Unhandled API Error:", error);
    showNotification("error", error?.message || "An unexpected error occurred");
    throw error;
}