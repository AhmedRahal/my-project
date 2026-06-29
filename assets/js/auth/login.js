import { login } from "../api/auth.js"
import { showNotification } from "../ui/notification.js";
import { showModal,closeModal } from "../ui/modals.js";
import { handlesUserUI } from "../ui/userUi.js";

export function loginUser() {
    const loginCard = document.getElementById("login-card");
    const submitLoginBtn = document.getElementById("submit-login");
    const loginUsernameInput = document.getElementById("login-username");
    const loginPasswordInput = document.getElementById("login-password");
    
    showModal(loginCard);
    submitLoginBtn.addEventListener("click", async () => {
        let username = loginUsernameInput.value.trim();
        let password = loginPasswordInput.value.trim();
        if (username === "" || password === "") {
            showNotification("error", "All fields are required");
            return;
        } else {
            await login(username, password);
        }
        closeModal(loginCard);
        loginUsernameInput.value = "";
        loginPasswordInput.value = "";
    });
}