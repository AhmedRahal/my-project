// Generic "show the chosen filename next to a file input" helper.
// Kept in its own file because it's imported both here and from
// exeternalFilesManager/noteImportExport.js — it isn't userUi-specific
// behavior, it's a shared UI utility that happens to live alongside it.

export function inputImageHandler(input, fileText) {
	if (input) {
		input.addEventListener("change", function () {
			if (this.files && this.files.length > 0) {
				console.log("Selected file:", this.files[0]);
				fileText.textContent = this.files[0].name;
				fileText.style.opacity = "1";
			} else {
				console.log("Selected file:", this.files[0]);
				fileText.textContent = "No file chosen";
				fileText.style.opacity = "0.6";
			}
		});
	}
}
