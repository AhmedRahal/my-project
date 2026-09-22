import Quill from "quill";
import "quill/dist/quill.snow.css";

let stylesRegistered = false;

export async function initializeQuillEditor(id, options) {
	try {
		if (!stylesRegistered) {
			const ColorStyle = Quill.import("attributors/style/color");
			const BackgroundStyle = Quill.import(
				"attributors/style/background",
			);
			const AlignStyle = Quill.import("attributors/style/align");

			Quill.register(ColorStyle, true);
			Quill.register(BackgroundStyle, true);
			Quill.register(AlignStyle, true);

			stylesRegistered = true;
		}
		options.formats = options.formats || [
			"background",
			"bold",
			"color",
			"font",
			"code",
			"italic",
			"link",
			"size",
			"strike",
			"underline",
			"blockquote",
			"header",
			"indent",
			"list",
			"align",
			"direction",
			"code-block",
			"image",
			"video",
		];
		let quillInstance = new Quill(id, options);
		return quillInstance;
	} catch (err) {
		console.error("Editor Setup Error:", err);
	}
}

export function enableToolbarTooltips(quillInstance, enable = true) {
	if (!enable || !quillInstance) return;
	const tooltipTitles = {
		bold: "Bold (Ctrl+B)",
		italic: "Italic (Ctrl+I)",
		underline: "Underline (Ctrl+U)",
		image: "Insert Image",
		"code-block": "Insert Code Block",
		clean: "Clear Formatting",
		font: "Font Family",
		size: "Text Size",
		color: "Text Color",
		background: "Background Highlight Color",
	};

	const container = quillInstance.container.parentElement;
	const toolbarContainer = container.querySelector(".ql-toolbar");
	if (!toolbarContainer) return;

	for (const [className, titleText] of Object.entries(tooltipTitles)) {
		const button = toolbarContainer.querySelector(`button.ql-${className}`);
		if (button) button.setAttribute("title", titleText);

		const picker = toolbarContainer.querySelector(
			`.ql-picker.ql-${className}`,
		);
		if (picker) picker.setAttribute("title", titleText);
	}
}
