let isRequestPending = false;

const blockerOverlay = document.getElementById("global-request-blocker");
const blockerText = document.getElementById("global-blocker-text");

/**
 * Starts a monitored operational block across components.
 * @param {Object} options Configuration attributes.
 * @param {HTMLButtonElement} [options.buttonElement] - The button context to attach the spinner to.
 * @param {boolean} [options.fullscreen=false] - Freeze input globally with a status banner.
 * @param {string} [options.message="The app is loading something..."] - Custom banner details text.
 */
export function startLoading({
	buttonElement = null,
	fullscreen = false,
	message = "The app is loading something...",
} = {}) {
	if (isRequestPending) return false; // Hard barrier blocking multi-click requests
	isRequestPending = true;
	if (fullscreen && blockerOverlay) {
		if (blockerText) blockerText.textContent = message;
		blockerOverlay.classList.add("active");
	}
	if (buttonElement) {
		buttonElement.classList.add("is-loading-btn");
		buttonElement.disabled = true;
		const parentModal = buttonElement.closest(".modal");
		if (parentModal) {
			parentModal.classList.add("app-is-submitting");
		}
	}

	return true;
}

/**
 * Terminates all ongoing operational locks and recovers view layers.
 * @param {HTMLButtonElement} [buttonElement] - The active element being localized.
 */
export function stopLoading(buttonElement = null) {
	isRequestPending = false;
	if (blockerOverlay) {
		blockerOverlay.classList.remove("active");
	}
	if (buttonElement) {
		buttonElement.classList.remove("is-loading-btn");
		buttonElement.disabled = false;

		const parentModal = buttonElement.closest(".modal");
		if (parentModal) {
			parentModal.classList.remove("app-is-submitting");
		}
	} else {
		document.querySelectorAll(".is-loading-btn").forEach((btn) => {
			btn.classList.remove("is-loading-btn");
			btn.disabled = false;
		});
		document.querySelectorAll(".app-is-submitting").forEach((modal) => {
			modal.classList.remove("app-is-submitting");
		});
	}
}

/**
 * Helper guard checking execution state.
 */
export function isAppBusy() {
	return isRequestPending;
}
