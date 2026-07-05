const MAX_VISIBLE = 3;

let activeNotifications = [];
let queue = [];

export function showNotification(type, messageText) {
    const notification = { type, messageText };
    if (activeNotifications.length < MAX_VISIBLE) {
        renderNotification(notification);
    } else {
        queue.push(notification);
    }
}

function renderNotification({ type, messageText }) {
    const messagesContainer = document.querySelector(".notification-container");

    const box = document.createElement("div");
    box.className = `message-display  ${type}`;

    const id = crypto.randomUUID();
    box.dataset.id = id;

    box.innerHTML = `
        <button class="close-message">x</button>
        <div class="message-content">
            <h3 class="title">${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <span class="message-text">${messageText}</span>
        </div>
    `;
    activeNotifications.push({ id, element: box });
    killNotificationAfterDelay(id, 5000); //

    box.querySelector(".close-message").addEventListener("click", () => {
        removeNotification(id);
    });

    messagesContainer.appendChild(box);
}

export function removeNotification(id) {
    const messagesContainer = document.querySelector(".notification-container");

    activeNotifications = activeNotifications.filter(n => {
        if (n.id === id) {
            n.element.remove();
            return false;
        }
        return true;
    });

    if (queue.length > 0 && activeNotifications.length < MAX_VISIBLE) {
        const next = queue.shift();
        renderNotification(next);
    }
}

export function killNotificationAfterDelay(id, delay) {
    setTimeout(() => {
        const notification = activeNotifications.find(n => n.id === id);

        if (!notification) return;

        notification.element.style.animation = "fadeOut 500ms forwards";

        notification.element.addEventListener(
            "animationend",
            () => {
                removeNotification(id);
            },
            { once: true }
        );
    }, delay);
}