import { apiUrl } from './config.js';
import { showNotification } from '../ui/notification.js';
import { closeAllModals } from '../ui/modals.js';
import { handleApiError } from './errorHandler.js';
export async function login(username, password) {
    let loggedInUser = null;
    try {
        const response = await fetch(`${apiUrl}auth/login`, {
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
        const response = await fetch(`${apiUrl}auth/register`, {
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

export async function changePassword(oldPassword, newPassword, token) {
    try {
        const response = await fetch(`${apiUrl}auth/profile/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error) {
        handleApiError(error);
    }
}

export async function updateProfile(username, imageFile, token) {
    try {
        const formData = new FormData();
        if (username) formData.append('username', username);
        if (imageFile) formData.append('image', imageFile);
        console.log(token);

        const response = await fetch(`${apiUrl}auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw data;

        showNotification("success", "Profile updated successfully!");
        
   
        return data.userInfo; 
    } catch (error) {
        handleApiError(error);
    }
}

export async function deleteAccount(token) {
    try {
        const response = await fetch(`${apiUrl}auth/profile`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw data;

        showNotification("success", "Account deleted successfully.");
        
        // Redirect to login or register page after deletion
        localStorage.removeItem('token'); // Clear token
    } catch (error) {
        handleApiError(error);
    }
}