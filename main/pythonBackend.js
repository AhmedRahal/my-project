const { app } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let pythonProcess = null;

function startPythonBackend() {
	if (!app.isPackaged) {
		console.log("Starting Python backend in dev mode...");

		const pythonExecutable = "py";
		const scriptPath = path.resolve("C:/DEV/python back end/app.py");

		pythonProcess = spawn(pythonExecutable, [scriptPath], {
			stdio: "inherit",
		});

		pythonProcess.on("error", (err) => {
			console.error("Failed to start Python process:", err);
		});
	}
}

function stopPythonBackend() {
	if (pythonProcess) {
		console.log("Stopping Python backend...");
		pythonProcess.kill();
		pythonProcess = null;
	}
}

module.exports = { startPythonBackend, stopPythonBackend };
