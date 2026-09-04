import { getFromLocalStorage } from "../../utils/storage.js";
import { escapeHtml, sanitizeHtml } from "../notesUi/sanitize.js";
import {
	statTotal,
	statPinned,
	statTags,
	statWords,
	dashboardNewNoteBtn,
	dashboardRecentNotes,
	dashboardTags,
	dashboardActivityChart,
	viewAllNotesBtn,
} from "./dom.js";

function getPlainText(html) {
	if (!html) return "";

	const temp = document.createElement("div");
	temp.innerHTML = sanitizeHtml(html);

	return temp.textContent.replace(/\s+/g, " ").trim();
}

function getWordCount(text) {
	if (!text) return 0;

	return text.trim().split(/\s+/).filter(Boolean).length;
}

function getAllWords(notes) {
	return notes.reduce((total, note) => {
		const titleText = getPlainText(note.title);
		const contentText = getPlainText(note.content);

		return total + getWordCount(titleText) + getWordCount(contentText);
	}, 0);
}

function getUniqueTags(notes) {
	const tags = new Set();

	notes.forEach((note) => {
		if (!Array.isArray(note.tags)) return;

		note.tags.forEach((tag) => {
			if (tag && typeof tag === "string") {
				tags.add(tag.trim());
			}
		});
	});

	return [...tags];
}

function getTagUsage(notes) {
	const tagCounts = {};

	notes.forEach((note) => {
		if (!Array.isArray(note.tags)) return;

		note.tags.forEach((tag) => {
			if (!tag || typeof tag !== "string") return;

			const cleanTag = tag.trim();

			if (!cleanTag) return;

			tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
		});
	});

	return Object.entries(tagCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8);
}

function getRecentNotes(notes) {
	return [...notes]
		.sort((a, b) => {
			const dateA = new Date(a.updatedAt || a.createdAt || 0);
			const dateB = new Date(b.updatedAt || b.createdAt || 0);

			return dateB - dateA;
		})
		.slice(0, 5);
}

function formatDate(dateString) {
	if (!dateString) return "";

	const date = new Date(dateString);

	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

function renderRecentNotes(notes) {
	if (!dashboardRecentNotes) return;

	const recentNotes = getRecentNotes(notes);

	if (recentNotes.length === 0) {
		dashboardRecentNotes.innerHTML = `
			<div class="dashboard-empty">
				No notes yet.
			</div>
		`;

		return;
	}

	dashboardRecentNotes.innerHTML = recentNotes
		.map((note) => {
			const titleText = getPlainText(note.title) || "Untitled Note";

			const preview =
				getPlainText(note.content).replace(/\s+/g, " ").slice(0, 80) ||
				"No content";

			const date = formatDate(note.updatedAt || note.createdAt);

			return `
				<div class="recent-note" data-note-id="${escapeHtml(note.noteId)}">

					<div class="recent-note-icon">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14 2 14 8 20 8"/>
							<line x1="16" y1="13" x2="8" y2="13"/>
							<line x1="16" y1="17" x2="8" y2="17"/>
						</svg>
					</div>

					<div class="recent-note-info">
						<div class="recent-note-title">
							${escapeHtml(titleText)}
						</div>

						<div class="recent-note-preview">
							${escapeHtml(preview)}
						</div>

						<div class="recent-note-date">
							${escapeHtml(date)}
						</div>
					</div>

				</div>
			`;
		})
		.join("");
}

function renderTags(notes) {
	if (!dashboardTags) return;

	const tagUsage = getTagUsage(notes);

	if (tagUsage.length === 0) {
		dashboardTags.innerHTML = `
			<div class="dashboard-empty">
				No tags used yet.
			</div>
		`;

		return;
	}

	dashboardTags.innerHTML = tagUsage
		.map(([tag, count]) => {
			return `
				<div class="dashboard-tag">
					<span class="dashboard-tag-name">
						${escapeHtml(tag)}
					</span>

					<span class="dashboard-tag-count">
						${count}
					</span>
				</div>
			`;
		})
		.join("");
}

function getLastSevenDays(notes) {
	const days = [];

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);

		days.push({
			date,
			count: 0,
			label: date.toLocaleDateString(undefined, {
				weekday: "short",
			}),
		});
	}

	notes.forEach((note) => {
		if (!note.createdAt) return;

		const created = new Date(note.createdAt);

		if (Number.isNaN(created.getTime())) return;

		created.setHours(0, 0, 0, 0);

		const day = days.find(
			(item) => item.date.getTime() === created.getTime(),
		);

		if (day) {
			day.count++;
		}
	});

	return days;
}

function renderActivity(notes) {
	if (!dashboardActivityChart) return;

	const days = getLastSevenDays(notes);

	const maxCount = Math.max(...days.map((day) => day.count), 1);

	dashboardActivityChart.innerHTML = `
		<div class="chart-y-axis">
			<span>${maxCount}</span>
			<span>${Math.ceil(maxCount / 2)}</span>
			<span>0</span>
		</div>

		<div class="chart-area">

			<div class="chart-grid-lines">
				<span></span>
				<span></span>
				<span></span>
			</div>

			<div class="chart-bars">

				${days
					.map((day) => {
						const height =
							day.count === 0
								? 0
								: Math.max(8, (day.count / maxCount) * 100);

						return `
							<div class="chart-day">

								<div class="bar-wrapper">
									<div
										class="activity-bar"
										style="height: ${height}%"
										title="${day.count} note${day.count === 1 ? "" : "s"}"
									></div>
								</div>

								<span>
									${escapeHtml(day.label)}
								</span>

							</div>
						`;
					})
					.join("")}

			</div>
		</div>
	`;
}

function bindDashboardActions() {
	if (dashboardNewNoteBtn) {
		dashboardNewNoteBtn.onclick = () => {
			const addNoteBtn = document.getElementById("addNoteBtn");

			if (addNoteBtn) {
				addNoteBtn.click();
			}
		};
	}

	if (viewAllNotesBtn) {
		viewAllNotesBtn.onclick = () => {
			const backToNotesBtn = document.getElementById("back-to-notes-btn");

			if (backToNotesBtn) {
				backToNotesBtn.click();
			}
		};
	}
}

export function renderDashboard() {
	const notes = getFromLocalStorage("notes") || [];

	const pinnedNotes = notes.filter((note) => note.isPinned);

	const uniqueTags = getUniqueTags(notes);

	const wordCount = getAllWords(notes);

	if (statTotal) {
		statTotal.textContent = notes.length;
	}

	if (statPinned) {
		statPinned.textContent = pinnedNotes.length;
	}

	if (statTags) {
		statTags.textContent = uniqueTags.length;
	}

	if (statWords) {
		statWords.textContent = wordCount.toLocaleString();
	}

	renderRecentNotes(notes);
	renderTags(notes);
	renderActivity(notes);
	bindDashboardActions();
}
