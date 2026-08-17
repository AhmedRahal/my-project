import { changePassword } from "../api/auth.js";
import { showNotification } from "../ui/notification.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";
import { saveToLocalStorage } from "../utils/storage.js";
import { closeModal, showModal } from "../ui/modals.js";


export async function updatePasswordUI(token) {
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;

    if (!oldPassword || !newPassword) {
        showNotification("warning", "Please provide both old and new credentials.");
        return;
    }
    if (oldPassword === newPassword) {
        showNotification("warning", "Please provide different passwords.");
        return;
    }
    startLoading({ buttonElement: document.getElementById("update-password-btn") });
    try {
    let result = await changePassword( oldPassword,newPassword ,token);
        if (result.success === false) {
            return;
        }
    
        showNotification("success", "Password updated successfully!");
        console.log(result);
        document.getElementById("old-password").value = "";
        document.getElementById("new-password").value = "";
    }
        catch (error) {
        console.error(error);
    }
    finally {
        stopLoading(document.getElementById("update-password-btn"));
    } }