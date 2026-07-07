import { login } from "../api/auth.js"
import { showNotification } from "../ui/notification.js";
import { closeModal,showModal } from "../ui/modals.js";
import { startLoading, stopLoading } from "../utils/requestManager.js"; 

export function loginUser() {
    const loginCard = document.getElementById("login-card");
    const submitLoginBtn = document.getElementById("submit-login");
    const loginUsernameInput = document.getElementById("login-username");
    const loginPasswordInput = document.getElementById("login-password");
    
    showModal(loginCard);
    
    submitLoginBtn.onclick = async () => {
        let username = loginUsernameInput.value.trim();
        let password = loginPasswordInput.value.trim();
        
        if (username === "" || password === "") {
            showNotification("error", "All fields are required");
            return;
        }

        // 1. Lock the fields inside the login modal and start the button spinner
        const started = startLoading({ buttonElement: submitLoginBtn });
        if (!started) return; 

        try {
            // 2. Perform authentication request.
            // Note: Your api/auth.js script internally runs handlesUserUI() upon success!
            await login(username, password);
            
            // 3. Clear credentials out of the DOM fields
            loginUsernameInput.value = "";
            loginPasswordInput.value = "";
            
            // 4. Dismiss the current active layout view context safely
            closeModal(loginCard);
        } catch (error) {
            console.error("Login component catch handler:", error);
        } finally {
            // 5. Always stop loading in the finally block to release the UI blocks
            stopLoading(submitLoginBtn);
        }
    };
}