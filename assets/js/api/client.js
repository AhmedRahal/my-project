import { apiUrl } from "./config.js";

let backendIsOnline = false;
let lastCheckTime = 0;
const CHECK_INTERVAL = 5000; // Only check every 5 seconds

function announceIfChanged(wasOnline) {
    if (wasOnline !== backendIsOnline) {
        window.dispatchEvent(
            new CustomEvent("backend-status-change", { detail: { online: backendIsOnline } }),
        );
    }
}

export async function checkBackendHealth(forceCheck = false) {
    const now = Date.now();
    // Return cached result if checked recently
    if (!forceCheck && (now - lastCheckTime < CHECK_INTERVAL)) {
        return backendIsOnline;
    }

    const wasOnline = backendIsOnline;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // Fast 1.5s timeout

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

// Lets a real request's outcome update the status directly, without a
// separate /health round trip. apiRequest() uses these so the everyday case
// (just try the request) doesn't need to pre-flight a health check first —
// that check-before-every-request pattern was doubling the round trips for
// anything more than 5 seconds apart, which was a big part of the slowness.
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
