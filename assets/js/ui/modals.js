const overlay = document.querySelector('#overlay');

export function closeAllModals(exceptionModal = null) {
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


export function showModal(modal, options = {}) {
    if (!modal) return;
    
    const noOverlay = options.noOverlay || false;
    const fromEvent = options.fromEvent || 'null';
    const additionalModals = options.additionalModals || [];

    console.log("Showing modal:", modal, fromEvent);
    closeAllModals(modal);
    
    if (overlay && !noOverlay) overlay.classList.add("active");
    modal.classList.add("active");
    additionalModals.forEach(m => {
        if (m) m.classList.add("active");
    });
}

export function closeModal(modal) {
    if (modal) modal.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}