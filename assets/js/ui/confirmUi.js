import { showModal, closeModal } from "./modals.js";
import { showNotification } from "./notification.js";
    const confirmCard = document.getElementById("confirm-card");
    const submitConfirmBtn = document.getElementById("confirm-btn");
    const confirmTitle = document.querySelector("#confirm-card .confirm-title");
    const confirmMessage= document.querySelector("#confirm-card .confirm-message");
    const cancelConfirmBtn = document.getElementById("cancel-btn")
export function showConfirm(title, message, callback =  () => {}) {
    console.log(title, message, callback);
    confirmTitle.innerHTML = title;
    confirmMessage.innerHTML = message;
    showModal(confirmCard);
    submitConfirmBtn.onclick = () => {
        callback();
        closeModal(confirmCard);
    };
    cancelConfirmBtn.onclick = () => {
        closeModal(confirmCard);
    };

}