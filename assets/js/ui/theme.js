export function applyTheme(isDark) {
    if (isDark) {
        if (typeof darkModeToggle !== 'undefined' && darkModeToggle) darkModeToggle.checked = true;
        
        // GitHub-inspired Dark Theme Palette
        document.documentElement.style.setProperty('--primary-color', '#161b22');   
        document.documentElement.style.setProperty('--secondary-color', '#0d1117'); 
        document.documentElement.style.setProperty('--third-color', '#30363d');      
        document.documentElement.style.setProperty('--font-color', '#e6edf3');       
        document.documentElement.style.setProperty('--font-muted', '#8b949e'); // Dark mode muted text
    } else {
        if (typeof darkModeToggle !== 'undefined' && darkModeToggle) darkModeToggle.checked = false;
        
        // Matches your :root CSS values exactly
        document.documentElement.style.setProperty('--primary-color', '#ffffff');
        document.documentElement.style.setProperty('--secondary-color', '#f8fafc');
        document.documentElement.style.setProperty('--third-color', '#e2e8f0');
        document.documentElement.style.setProperty('--font-color', '#0f172a');
        document.documentElement.style.setProperty('--font-muted', '#64748b');
    }
}