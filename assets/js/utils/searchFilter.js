import { getFromLocalStorage } from "../utils/storage.js";
import { createNotes } from "../ui/notesUI.js";
import { currentFilter } from "../ui/config.js";

export function applyFilters() {
    const allNotes = getFromLocalStorage("notes") || [];
    const query = (currentFilter.searchQuery || "").toLowerCase().trim();
    const filterTag = (currentFilter.selectedTags || "").toLowerCase().trim();

    // --- PHASE 1: FILTERING ---
    let processedNotes = allNotes.filter(note => {
        
        // A) Text Search matching (Title OR Content)
        const matchesSearch = !query || 
            (note.title && note.title.toLowerCase().includes(query)) ||
            (note.content && note.content.toLowerCase().includes(query));

        // B) Improved Tags matching (Partial match + Array support)
let matchesTags = true;
        if (currentFilter.selectedTags && currentFilter.selectedTags !== 'all' && currentFilter.selectedTags.trim() !== "") {
            // Split by comma, trim whitespace, and remove empty strings
            const searchTags = currentFilter.selectedTags.split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t !== "");

            // Normalize note tags into a flat array of lowercase strings
            const noteTags = Array.isArray(note.tags) ? note.tags : (note.tag ? [note.tag] : []);
            const normalizedNoteTags = noteTags.map(t => t.toLowerCase());

            // LOGIC: Check if the note contains at least one of the tags provided in the search
            // If you want the note to contain ALL search tags, change .some() to .every()
            matchesTags = searchTags.some(searchTag => 
                normalizedNoteTags.some(noteTag => noteTag.includes(searchTag))
            );
        }

        // C) Pin Status matching
        const isPinned = !!note.isPinned;
        let matchesPinStatus = true;
        if (currentFilter.showOnlyPinned && !isPinned) matchesPinStatus = false;
        if (currentFilter.showOnlyUnpinned && isPinned) matchesPinStatus = false;

        // D) Timestamp Date matching
        let matchesDate = true;
        if (currentFilter.dateRange && currentFilter.dateRange !== 'all') {
            const noteTimestamp = note.updatedAt || note.createdAt;
            if (!noteTimestamp) {
                matchesDate = false;
            } else {
                const noteDate = new Date(noteTimestamp);
                const now = new Date();
                
                if (currentFilter.dateRange === 'today') {
                    matchesDate = noteDate.toDateString() === now.toDateString();
                } else if (currentFilter.dateRange === 'week') {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    matchesDate = noteDate >= oneWeekAgo;
                } else if (currentFilter.dateRange === 'month') {
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    matchesDate = noteDate >= oneMonthAgo;
                }
            }
        }

        return matchesSearch && matchesTags && matchesPinStatus && matchesDate;
    });

    // --- PHASE 2: SORTING ---
    processedNotes.sort((a, b) => {
        let comparison = 0;
        if (currentFilter.sortBy === 'date') {
            const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            comparison = timeA - timeB; 
        } else if (currentFilter.sortBy === 'alphabetical') {
            const titleA = (a.title || "").replace(/<[^>]*>/g, '').toLowerCase();
            const titleB = (b.title || "").replace(/<[^>]*>/g, '').toLowerCase();
            comparison = titleA.localeCompare(titleB);
        }
        return currentFilter.sortOrder === 'desc' ? -comparison : comparison;
    });

    createNotes(processedNotes, false);
}
export const filterService = {
    setSearchQuery(query) { currentFilter.searchQuery = query; applyFilters(); },
    setSelectedTags(tag) { currentFilter.selectedTags = tag; applyFilters(); },
    setPinnedOnly(showPinned) { 
        currentFilter.showOnlyPinned = showPinned; 
        if (showPinned) currentFilter.showOnlyUnpinned = false; 
        applyFilters(); 
    },
    setUnpinnedOnly(showUnpinned) { 
        currentFilter.showOnlyUnpinned = showUnpinned;
        if (showUnpinned) currentFilter.showOnlyPinned = false;
        applyFilters(); 
    },
    clearPinFilters() { 
        currentFilter.showOnlyPinned = false; 
        currentFilter.showOnlyUnpinned = false; 
        applyFilters(); 
    },
    setDateRange(range) { currentFilter.dateRange = range; applyFilters(); },
    setSortBy(criteria) { currentFilter.sortBy = criteria; applyFilters(); },
    setSortOrder(order) { currentFilter.sortOrder = order; applyFilters(); },
    getActiveFilters() { return { ...currentFilter }; }
};