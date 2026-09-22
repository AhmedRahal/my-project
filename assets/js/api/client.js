import { apiUrl } from "./config.js";

let backendIsOnline = false;
let lastCheckTime = 0;
const CHECK_INTERVAL = 5000;

function announceIfChanged(wasOnline) {
    if (wasOnline !== backendIsOnline) {
        window.dispatchEvent(
            new CustomEvent("backend-status-change", { detail: { online: backendIsOnline } }),
        );
    }
}

export async function checkBackendHealth(forceCheck = false) {
    const now = Date.now();
    if (!forceCheck && (now - lastCheckTime < CHECK_INTERVAL)) {
        return backendIsOnline;
    }

    const wasOnline = backendIsOnline;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); 

        await fetch(`${apiUrl}health`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        backendIsOnline = true;
    } catch {
        backendIsOnline = false;
    }

    lastCheckTime = now;
    announceIfChanged(wasOnline);
    return backendIsOnline;
}

export function isOnline() {
    return backendIsOnline;
}

export function markOnline() {
    const wasOnline = backendIsOnline;
    backendIsOnline = true;
    lastCheckTime = Date.now();
    announceIfChanged(wasOnline);
}

export function markOffline() {
    const wasOnline = backendIsOnline;
    backendIsOnline = false;
    lastCheckTime = Date.now();
    announceIfChanged(wasOnline);
}
