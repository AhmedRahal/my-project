import { apiUrl } from "./config.js";
import { markOnline, markOffline } from "./client.js";
import { startLoading, stopLoading } from "../utils/requestManager.js";
import { handleApiError } from "./errorHandler.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { showNotification } from "../ui/notification.js";
import { queueAction } from "../utils/offlineQueue.js";


async function rawRequest({ endpoint, method = "GET", body = null, requiresAuth = true }) {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
        const user = getFromLocalStorage("loggedInUser");
        if (user?.token) {
            headers["Authorization"] = `Bearer ${user.token}`;
        } else {
            throw { code: "NO_TOKEN", message: "Please log in again." };
        }
    }

    const fetchOptions = { method, headers };
    if (body) fetchOptions.body = JSON.stringify(body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
        response = await fetch(`${apiUrl}${endpoint}`, { ...fetchOptions, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();
    if (!response.ok) throw data;

    return data;
}


function isConnectivityFailure(error) {
    return (
        error instanceof TypeError ||
        error?.name === "AbortError" ||
        (typeof error?.message === "string" &&
            (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")))
    );
}

/**
 * @param {Object} options
 * @param {string} options.endpoint - e.g., 'notes', 'auth/login'
 * @param {string} options.method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {Object} [options.body] - JSON body for POST/PUT
 * @param {boolean} [options.requiresAuth] - Default true
 * @param {string|HTMLElement} [options.loadingBtn] - ID or Element to show spinner
 * @param {boolean} [options.fullscreenLoad] - Show global blocker
 * @param {string} [options.loadMessage] - Message for global blocker
 * @param {Function} [options.offlineFallback] - Function to run if offline (receives body/method).
 *        Optional — if you don't provide one, a write request (POST/PUT/DELETE) is
 *        automatically saved to the local queue and replayed once you're back online.
 * @param {string} [options.label] - Human-readable description of this action, shown in
 *        "pending changes" UI and used as the queue entry's label. Defaults to the endpoint.
 */
export async function apiRequest({
    endpoint,
    method = 'GET',
    body = null,
    requiresAuth = true,
    loadingBtn = null,
    fullscreenLoad = false,
    loadMessage = "Processing...",
    offlineFallback = null,
    label = null,
}) {
    startLoading({
        buttonElement: loadingBtn,
        fullscreen: fullscreenLoad,
        message: loadMessage
    });

    try {

        try {
            const data = await rawRequest({ endpoint, method, body, requiresAuth });
            markOnline();
            return data;
        } catch (err) {
            if (!isConnectivityFailure(err)) throw err;

            markOffline();

            if (offlineFallback) {
                return await offlineFallback({ method, body });
            }

            if (method !== 'GET') {
                await queueAction({ endpoint, method, body, requiresAuth, label: label || endpoint });
                showNotification(
                    "info",
                    "You're offline — this change is saved and will sync automatically once you're back online.",
                );
                return { success: true, queued: true };
            }
            showNotification("warning", "You're offline and this hasn't been loaded yet.");
            return null;
        }

    } catch (error) {
        handleApiError(error);

        return null;
    } finally {
        stopLoading({ buttonElement: loadingBtn, fullscreen: fullscreenLoad });
    }
}

/**
 * For the sync engine ONLY. Unlike apiRequest(), this never swallows a
 * failure and never shows its own notification — a network error or a
 * non-2xx response throws straight to the caller. The sync engine relies on
 * that to decide whether something actually reached the backend before it
 * marks a note as synced or removes an item from the offline queue.
 */
export async function syncRequest({ endpoint, method = 'GET', body = null, requiresAuth = true }) {
    return await rawRequest({ endpoint, method, body, requiresAuth });
}
