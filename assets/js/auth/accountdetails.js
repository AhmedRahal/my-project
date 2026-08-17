import {updateProfile} from "../api/auth.js";
import {showNotification} from "../ui/notification.js";
import {saveToLocalStorage} from "../utils/storage.js";
import {startLoading, stopLoading} from "../utils/requestManager.js";
import {handlesUserUI} from "../ui/userUi.js";

export async function updateProfileUi(username, imageFile, token) {
    const saveAccountBtn = document.getElementById("save-account-btn");
    try {
        startLoading({ buttonElement: saveAccountBtn });

        const data = await updateProfile(username, imageFile, token);

        showNotification("success", "Profile updated successfully!");
        console.log(data);
        saveToLocalStorage("loggedInUser", data); 
        handlesUserUI(data);
    } catch (error) {
        console.log("Error:", error);
    }
    finally {
        stopLoading(saveAccountBtn);
    }
}