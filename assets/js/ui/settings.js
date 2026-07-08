import {getFromLocalStorage, saveToLocalStorage} from '../utils/storage.js';
import {showNotification} from './notification.js';
import {applyTheme} from './theme.js';
import {handlesUserUI} from './userUi.js';
export function loadSettings() {
    const savedSettings = getFromLocalStorage('settings');
    if (savedSettings) {
        
        applyTheme(savedSettings.darkMode);
    }
    
    const savedUser = getFromLocalStorage('loggedInUser');
        handlesUserUI(savedUser);
}