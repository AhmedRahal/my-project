export function applyTheme(isDark) {
    // 1. Update the DOM class
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 2. Handle the checkbox toggle safely
    if (typeof darkModeToggle !== 'undefined' && darkModeToggle) {
        darkModeToggle.checked = isDark;
    }
}