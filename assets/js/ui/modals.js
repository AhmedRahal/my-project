// --- FILE: C:\DEV\my project\assets\js\ui\modals.js ---
const overlay = document.querySelector('#overlay');

/**
 * Closes all open popups/modals except the optional exception modal
 */
export function closeAllModals(exceptionModal = null) {
    // Dynamically grab anything that could act as an active popup container
    const activePopups = document.querySelectorAll('.modal.active, .settings-dropdown.active, .search-bar.active');
    
    activePopups.forEach(popup => {
        if (popup !== exceptionModal) {
            popup.classList.remove('active');
        }
    });
    
    if (!exceptionModal && overlay) {
        overlay.classList.remove('active');
    }
}


export function showModal(modal) {
    if (!modal) return;
    console.log("Showing modal:", modal);
    closeAllModals(modal);
    
    
    if (overlay) overlay.classList.add("active");
    modal.classList.add("active");
}

export function closeModal(modal) {
    if (modal) modal.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}