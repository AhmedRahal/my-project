const rootStyles = getComputedStyle(document.documentElement);
const primaryColor = rootStyles.getPropertyValue('--primary-color');
const secondaryColor = rootStyles.getPropertyValue('--secondary-color');
export function applyTheme(isDark) {
    if (isDark) {
        if (darkModeToggle) darkModeToggle.checked = true;
        document.documentElement.style.setProperty('--secondary-color', '#0d1117');     
        document.documentElement.style.setProperty('--primary-color', '#161b22');   
        document.documentElement.style.setProperty('--third-color', '#30363d');      
        document.documentElement.style.setProperty('--font-color', '#e6edf3');        
    } else {
        if (darkModeToggle) darkModeToggle.checked = false;
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--font-color', '#333');
        document.documentElement.style.setProperty('--third-color', '#ccc');
    }
}