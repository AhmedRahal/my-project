import { timeAgo } from "../../utils/time.js";
import { sanitizeHtml, escapeHtml } from "./sanitize.js";

export function buildNoteHTML(note) {
	const safeTitle = sanitizeHtml(note.title);
	const safeContent = sanitizeHtml(note.content);
	const safeTags = note.tags
		.map((tag) => `<li class="note-cat">${escapeHtml(tag)}</li>`)
		.join("");

	return `
        <div class="note-card" noteId="${escapeHtml(note.noteId)}">
            <div class="note-card-header">
                <div class="note-card-title ql-editor">${safeTitle}</div>
            </div>

            <div class="note-card-body content ql-editor">
                ${safeContent}
            </div>

            <div class="note-card-footer">
                <div class="note-tags-wrapper">
                    <ul class="categories">${safeTags}</ul>
                </div>

                <div class="note-meta-timeline">
                    <div class="created">Created: ${timeAgo(note.createdAt)}</div>
                    <div class="updated">Updated: ${timeAgo(note.updatedAt)}</div>
                </div>

                <div class="note-action-row">
                    <button style='display:flex;align-items:center;gap:8px;' class="edit-btn">Edit
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-edit">
						<path d="M21.707,4.475,19.525,2.293a1,1,0,0,0-1.414,0L9.384,11.021a.977.977,0,0,0-.241.39L8.052,14.684A1,1,0,0,0,9,16a.987.987,0,0,0,.316-.052l3.273-1.091a.977.977,0,0,0,.39-.241l8.728-8.727A1,1,0,0,0,21.707,4.475Zm-9.975,8.56-1.151.384.384-1.151,7.853-7.854.768.768ZM2,6A1,1,0,0,1,3,5h8a1,1,0,0,1,0,2H4V20H17V13a1,1,0,0,1,2,0v8a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1Z" fill="currentColor"/>
						</svg>					
					</button>
                    <button class="delete-btn">Delete
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="icon icon-delete">
  <path d="M32 241.6c-11.2 0-20-8.8-20-20s8.8-20 20-20l940 1.6c11.2 0 20 8.8 20 20s-8.8 20-20 20L32 241.6zM186.4 282.4c0-11.2 8.8-20 20-20s20 8.8 20 20v688.8l585.6-6.4V289.6c0-11.2 8.8-20 20-20s20 8.8 20 20v716.8l-666.4 7.2V282.4z" fill="currentColor"/>
  <path d="M682.4 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM367.2 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM524.8 867.2c-11.2 0-20-8.8-20-20V372c0-11.2 8.8-20 20-20s20 8.8 20 20v475.2c0.8 11.2-8.8 20-20 20zM655.2 213.6v-48.8c0-17.6-14.4-32-32-32H418.4c-18.4 0-32 14.4-32 32.8V208h-40v-42.4c0-40 32.8-72.8 72.8-72.8H624c40 0 72.8 32.8 72.8 72.8v48.8h-41.6z" fill="currentColor"/>
</svg>
					</button>
                </div>
            </div>
        </div>
    `;
}
