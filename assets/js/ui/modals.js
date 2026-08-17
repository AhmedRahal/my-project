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
    const toggle = options.toggle || false;
    const focusInputs = options.focusInputs || false;
    closeAllModals(modal);
    console.log(" fromEvent:", fromEvent);
    console.log("Showing modal:", modal);
    console.log(additionalModals);
    if (overlay && !noOverlay) {
        overlay.classList.add("active")
    };
    additionalModals.forEach(m => {
        console.log("Adding modal:", m);
        if (m) m.classList.add("active");
        if(focusInputs) {
            m.childNodes.forEach(c => {
                if (c.focus && c.tagName === "INPUT") {
                    console.log("Focusing modal:", c);
                    c.focus();
                }
            });
    }});
    if (toggle) {
        modal.classList.toggle("active");
        return;
    };
    modal.classList.add("active");
}

export function closeModal(modal) {
    if (modal) modal.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}