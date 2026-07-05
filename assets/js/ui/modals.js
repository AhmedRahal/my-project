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