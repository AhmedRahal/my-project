import {getFromLocalStorage, saveToLocalStorage} from '../utils/storage.js';
import {showNotification} from './notification.js';
import {applyTheme} from './theme.js';
import {handlesUserUI} from './userUi.js';
export function loadSittings() {
    const savedSittings = getFromLocalStorage('sittings');
    if (savedSittings) {
        
        applyTheme(savedSittings.darkMode);
    }
    
    const savedUser = getFromLocalStorage('loggedInUser');
        // fix  below for later
        console.log(savedUser);
        handlesUserUI(savedUser);
}
