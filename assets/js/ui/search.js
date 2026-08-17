import { filterService } from "../utils/searchFilter.js";
import { getFromLocalStorage } from "../utils/storage.js";
import { showModal, closeModal,closeAllModals } from "./modals.js";
import { showNotification } from "./notification.js";
// --- 1. DOM Core Selector Element Handles ---
const filterToggleBtn = document.getElementById('filterToggleBtn');
const filterDropdownPanel = document.getElementById('filterDropdownPanel');
const noteSearchInput = document.getElementById('noteSearchInput');

const filterSortBy = document.getElementById('filterSortBy');
const filterSortOrder = document.getElementById('filterSortOrder');
const filterDateRange = document.getElementById('filterDateRange');
const filterTagInput = document.getElementById('filterTagInput');
const filterOnlyPinned = document.getElementById('filterOnlyPinned');
const filterOnlyUnpinned = document.getElementById('filterOnlyUnpinned');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const searchBar = document.querySelector('.search-bar');


export function toggleFilterDropdown() {

    if (filterToggleBtn && filterDropdownPanel) {
    filterToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (getFromLocalStorage("loggedInUser") == null) {
        showNotification("warning","please login to search your notes");
        return
    }
        showModal(filterDropdownPanel, { noOverlay: true,toggle: true, additionalModals: [searchBar] ,focusInputs: true, fromEvent: 'filterToggleBtn' });
        searchBar.focus();
    });
    document.addEventListener('click', (e) => {
        // console.log(e.target);
        // e.stopPropagation();
        if (!filterDropdownPanel.contains(e.target) && !filterToggleBtn.contains(e.target) && filterDropdownPanel.classList.contains("active") && searchBar.classList.contains("active")) {
            closeModal(filterDropdownPanel);
            closeModal(searchBar);
            console.log("Filter dropdown panel closed");
        }
    });
}

// --- 3. Sync Inputs & Controls into Filter Service Pipeline ---

// A) Live Text Search Input
if (noteSearchInput) {
    noteSearchInput.addEventListener('input', (e) => {
        filterService.setSearchQuery(e.target.value);
    });
}

// B) Change Sorting Target Criterion
if (filterSortBy) {
    filterSortBy.addEventListener('change', (e) => {
        filterService.setSortBy(e.target.value);
    });
}

// C) Change Ordering Sequence Direction
if (filterSortOrder) {
    filterSortOrder.addEventListener('change', (e) => {
        filterService.setSortOrder(e.target.value);
    });
}

// D) Change Date Horizon Constraints
if (filterDateRange) {
    filterDateRange.addEventListener('change', (e) => {
        filterService.setDateRange(e.target.value);
    });
}

// E) Category Tag Filtering Input
if (filterTagInput) {
    filterTagInput.addEventListener('input', (e) => {
        const queryTag = e.target.value.trim() === "" ? "all" : e.target.value;
        filterService.setSelectedTags(queryTag);
    });
}

// F) Pinned Only Checkbox
if (filterOnlyPinned) {
    filterOnlyPinned.addEventListener('change', (e) => {
        filterService.setPinnedOnly(e.target.checked);
        // Mutual exclusion: Uncheck Unpinned if Pinned is selected
        if (e.target.checked && filterOnlyUnpinned) {
            filterOnlyUnpinned.checked = false;
        }
    });
}

// G) Unpinned Only Checkbox
if (filterOnlyUnpinned) {
    filterOnlyUnpinned.addEventListener('change', (e) => {
        filterService.setUnpinnedOnly(e.target.checked);
        // Mutual exclusion: Uncheck Pinned if Unpinned is selected
        if (e.target.checked && filterOnlyPinned) {
            filterOnlyPinned.checked = false;
        }
    });
}

// H) Full Reset Event Link Button
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        // Reset HTML Inputs visually back to initial states
        if (noteSearchInput) noteSearchInput.value = "";
        if (filterSortBy) filterSortBy.value = "date";
        if (filterSortOrder) filterSortOrder.value = "desc";
        if (filterDateRange) filterDateRange.value = "all";
        if (filterTagInput) filterTagInput.value = "";
        if (filterOnlyPinned) filterOnlyPinned.checked = false;
        if (filterOnlyUnpinned) filterOnlyUnpinned.checked = false;

        // Reset underlying data state rules
        filterService.setSearchQuery("");
        filterService.setSelectedTags("all");
        filterService.clearPinFilters();
        filterService.setDateRange("all");
        filterService.setSortBy("date");
        filterService.setSortOrder("desc");
    });
}
}