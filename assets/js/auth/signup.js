import { register } from "../api/auth.js";
import { showNotification } from "../ui/notification.js";
import { handlesUserUI } from "../ui/userUi.js";
import { showModal, closeModal } from "../ui/modals.js";
import { saveToLocalStorage } from "../utils/storage.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";
export function signUp() {
    const signUpUsernameInput = document.getElementById("signUp-username");
    const signUpPasswordInput = document.getElementById("signUp-password");
    const signUpImageinput = document.getElementById("signUp-profile-picture");
    const signUpCard = document.getElementById("signUp-card");
    const submitsignUpBtn = document.getElementById("submit-signUp");
    let loggedInUser = null;

    console.log("Sign Up function called");
    showModal(signUpCard);

    submitsignUpBtn.addEventListener("click", async () => {
        let password = signUpPasswordInput.value.trim();
        let username = signUpUsernameInput.value.trim();
        let image = signUpImageinput.files[0];
        
        if (username === "" || password === "" || !image) {
            console.log("Missing fields:", { username, password, image });
            showNotification("error", "All fields are required");
            return;
        }

        let formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('image', image);

        // Start loading animation
        startLoading({ buttonElement: submitsignUpBtn });

        try {
            const result = await register(formData);
            
            if (result && result.success) {
                loggedInUser = {
                    username: result.userInfo.username,
                    image: result.userInfo.image,
                    token: result.token,
                    userId: result.userInfo.id
                };
                
                console.log("Logged In Successfully:", loggedInUser);
                saveToLocalStorage("loggedInUser", loggedInUser);
                saveToLocalStorage("userToken", loggedInUser.token);
                handlesUserUI(loggedInUser);
                showNotification("success", "Sign up successful");
                
                // ONLY close the modal and clear inputs if it actually succeeds!
                signUpCard.classList.remove("active");
                overlay.classList.remove("active"); 
                closeModal(signUpCard);
                
                signUpUsernameInput.value = "";
                signUpPasswordInput.value = "";
                signUpImageinput.value = "";
            } else {
                showNotification("error", result ? result.message || "Sign up failed" : "An error occurred during sign up");
            }

        } catch (error) {
            console.error("Sign up error:", error.message);
        } finally {
            stopLoading(submitsignUpBtn);
        }
            overlay.onclick = () => {
                signUpUsernameInput.value = "";
                signUpPasswordInput.value = "";
                signUpImageinput.value = "";
            };
    });
}

export function handlesSignUpUIError(error) {
    if (error = 'USERNAME TAKEN') {
                const usernameInput = document.getElementById("signUp-username");
        usernameInput.classList.add("erroranimated");
        setTimeout(() => {
            usernameInput.classList.remove("erroranimated");
        }, 500);
        showNotification("error", `Username ${usernameInput.value} is already taken. Please try another username.`);}
}