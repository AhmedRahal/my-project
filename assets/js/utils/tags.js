import { saveToLocalStorage, getFromLocalStorage } from './storage.js';
import getUserTagsApi from '../api/tags.js';

export function getUserTags(userId) {
    getUserTagsApi(userId).then(response => {
        let tags = response.tags;
        if (tags) saveToLocalStorage('userTags', tags);
    });
    return getFromLocalStorage('userTags') || [];
}

export function getTagsWith(userId, string) {
    const cachedTags = getUserTags(userId);
    if (!Array.isArray(cachedTags)) return [];
    return cachedTags.filter(tag => tag.toLowerCase().includes(string.toLowerCase()));
}