// Fullscreen overlay is ref-counted so two concurrent requests (e.g. notes +
// tags both fetching at startup) don't stomp on each other — previously a
// single global "isRequestPending" boolean meant whichever request lost the
// race silently never showed its loader at all.
let activeFullscreenRequests = 0;
const blockerOverlay = document.getElementById("global-request-blocker");
const blockerText = document.getElementById("global-blocker-text");

function resolveButton(buttonElement) {
    if (!buttonElement) return null;
    return typeof buttonElement === "string" ? document.getElementById(buttonElement) : buttonElement;
}

export function startLoading({ buttonElement = null, fullscreen = false, message = "The app is loading something..." } = {}) {
    const btn = resolveButton(buttonElement);

    // Only refuse if THIS specific button is already mid-request — this is
    // what actually prevents double-submitting a form. It's scoped to the
    // button, not the whole app, unlike the old global lock.
    if (btn && btn.disabled) return false;

    if (fullscreen && blockerOverlay) {
        activeFullscreenRequests++;
        if (blockerText) blockerText.textContent = message;
        blockerOverlay.classList.add("active");
    }

    if (btn) {
        btn.classList.add("is-loading-btn");
        btn.disabled = true;
        const parentModal = btn.closest(".modal");
        if (parentModal) parentModal.classList.add("app-is-submitting");
    }
    return true;
}

/**
 * Accepts either:
 *   stopLoading()                                  — full reset (safety net, e.g. from a generic error handler)
 *   stopLoading(buttonElementOrId)                  — old call style, still works everywhere it's used
 *   stopLoading({ buttonElement, fullscreen })      — new style, used by apiRequest so the overlay ref-count is accurate
 */
export function stopLoading(arg) {
    if (arg === undefined || arg === null) {
        activeFullscreenRequests = 0;
        if (blockerOverlay) blockerOverlay.classList.remove("active");
        document.querySelectorAll(".is-loading-btn").forEach((b) => {
            b.classList.remove("is-loading-btn");
            b.disabled = false;
        });
        document.querySelectorAll(".app-is-submitting").forEach((m) => m.classList.remove("app-is-submitting"));
        return;
    }

    let buttonElement = null;
    let fullscreen = false;

    if (typeof arg === "string" || arg instanceof HTMLElement) {
        buttonElement = arg;
    } else if (typeof arg === "object") {
        buttonElement = arg.buttonElement ?? null;
        fullscreen = !!arg.fullscreen;
    }

    if (fullscreen && blockerOverlay) {
        activeFullscreenRequests = Math.max(0, activeFullscreenRequests - 1);
        if (activeFullscreenRequests === 0) blockerOverlay.classList.remove("active");
    }

    const btn = resolveButton(buttonElement);
    if (btn) {
        btn.classList.remove("is-loading-btn");
        btn.disabled = false;
        const parentModal = btn.closest(".modal");
        if (parentModal) parentModal.classList.remove("app-is-submitting");
    }
}

export function isAppBusy() {
    return activeFullscreenRequests > 0 || document.querySelectorAll(".is-loading-btn").length > 0;
}
