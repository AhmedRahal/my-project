import { apiUrl } from './config.js';
import { showNotification } from '../ui/notification.js';
import { closeAllModals } from '../ui/modals.js';
import { handleApiError } from './errorHandler.js';
export async function login(username, password) {
    let loggedInUser = null;
    try {
        const response = await fetch(`${apiUrl}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result && result.success) {
            return result;
        } else {
            showNotification("error", "Invalid credentials");
        }
    } catch (error) {
        console.error("Error during login:", error);
        showNotification("error", error.error || "An error occurred during login");
    }
    closeAllModals();
}

export async function register(formDataPayload) {
    try {
        const response = await fetch(`${apiUrl}register`, {
            method: 'POST',
            body: formDataPayload 
        });

        const data = await response.json();

        if (response.ok) {
            return data; 
        } else {
            throw data;
        }
    } catch (error) {
        handleApiError(error);
        return error;
    }
}