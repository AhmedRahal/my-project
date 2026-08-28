export function applyTheme(isDark) {
	if (isDark) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}

	if (typeof darkModeToggle !== "undefined" && darkModeToggle) {
		darkModeToggle.checked = isDark;
	}

	// Update native Windows toolbar overlay
	if (window.api && window.api.updateTitleBarOverlay) {
		window.api.updateTitleBarOverlay({ isDark });
	}
}
