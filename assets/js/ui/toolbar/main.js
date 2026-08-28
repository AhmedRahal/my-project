export function initToolbar() {
	let maximizeBtn = document.querySelector(".maximize-app-btn");
	let minimizeBtn = document.querySelector(".minimize-app-btn");
	let closeBtn = document.querySelector(".close-app-btn");
	if (maximizeBtn) {
		maximizeBtn.addEventListener("click", () => {
			window.api.toggleMaximizeWindow();
		});
	}

	if (minimizeBtn) {
		console.log(window.api, maximizeBtn);
		minimizeBtn.addEventListener("click", () => {
			window.api.minimizeWindow();
		});
	}

	if (closeBtn) {
		closeBtn.addEventListener("click", () => {
			window.api.closeWindow();
		});
	}
}
