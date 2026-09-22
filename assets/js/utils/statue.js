import { apiUrl } from "./config.js";

let backendIsOnline = false;

export async function checkBackendHealth() {
    try {
        await fetch(`${apiUrl}health`, { 
            method: 'GET', 
            signal: AbortSignal.timeout(2000) 
        });
        backendIsOnline = true;
    } catch {
        backendIsOnline = false;
    }
    return backendIsOnline;
}

export function isOnline() {
    return backendIsOnline;
}