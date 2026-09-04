import DOMPurify from "dompurify";

// Whitelist matched to what Quill's toolbar can actually produce
// (headers, formatting, lists/checklists, code blocks, links, images,
// indent/align classes, and now color/background which Quill applies as
// inline style). Tighten or extend this if your toolbar config changes —
// anything not listed here gets stripped, not just "hidden."
const ALLOWED_TAGS = [
	"p", "br", "span",
	"b", "strong", "i", "em", "u", "s", "strike",
	"h1", "h2", "h3",
	"blockquote", "pre", "code",
	"ul", "ol", "li",
	"a", "img",
	"sub", "sup",
];

const ALLOWED_ATTR = [
	"href", "target", "rel",
	"src", "alt",
	"class",
	"data-list", "data-checked",
	// Quill's color/background toolbar options apply as inline style
	// (e.g. <span style="color: rgb(...)">). DOMPurify still filters
	// dangerous CSS constructs within the attribute value even when it's
	// allowed, so this doesn't reopen the original XSS hole.
	"style",
];

/**
 * Sanitizes rich-text HTML (note titles/content coming out of Quill).
 * Use this any time note.title / note.content is written into innerHTML,
 * OR before it's sent to the backend on save.
 */
export function sanitizeHtml(dirty) {
	if (!dirty) return "";
	return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}

/**
 * Escapes plain-text user input (tags, ids used as HTML attributes) so it
 * can be safely interpolated into a template string. Not for rich text —
 * tags should never contain markup at all, so we escape rather than sanitize.
 */
export function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}
