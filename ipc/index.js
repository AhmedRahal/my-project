const { registerWindowControlHandlers } = require("./windowControls.js");
const { registerStartupHandlers } = require("./startup.js");
const { registerThemeHandlers } = require("./theme.js");

function registerIpcHandlers() {
	registerWindowControlHandlers();
	registerStartupHandlers();
	registerThemeHandlers();
}

module.exports = { registerIpcHandlers };
