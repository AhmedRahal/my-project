
const startupToggle = document.getElementById("openAtStartupToggle");

// Keep track of your local editor instance in renderer.js

window.UI = {
    startupToggle: startupToggle,
    onStartupChange: function(callback) {
        if (startupToggle) {
            startupToggle.addEventListener("change", () => {
                callback(startupToggle.checked);
            });
        }
    }
};

window.api.getStartup().then(value => { 
    if (window.UI.startupToggle) {
        window.UI.startupToggle.checked = value;
    }
});

window.UI.onStartupChange((isChecked) => {
    window.api.setStartup(isChecked);
});
