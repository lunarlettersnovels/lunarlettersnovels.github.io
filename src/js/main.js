// Styles first so they end up in main.css
import "../scss/main.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

// Bootstrap behaviour (collapse navbar, tabs, dropdowns…)
import "bootstrap";

// =============================================================
//  IndexedDB helper — bookmarks / history / reading progress
// =============================================================
const LibDB = {
  DB_NAME: "LunarLettersDB",
  DB_VERSION: 1,
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains("bookmarks")) {
          d.createObjectStore("bookmarks", { keyPath: "slug" }).createIndex("addedAt", "addedAt", { unique: false });
        }
        if (!d.objectStoreNames.contains("history")) {
          const h = d.createObjectStore("history", { keyPath: "id" });
          h.createIndex("readAt", "readAt", { unique: false });
          h.createIndex("seriesSlug", "seriesSlug", { unique: false });
        }
        if (!d.objectStoreNames.contains("progress")) {
          d.createObjectStore("progress", { keyPath: "seriesId" });
        }
      };
      req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
      req.onerror = (e) => reject(e.target.error);
    });
  },
  async toggleBookmark(entry) {
    await this.open();
    const store = this.db.transaction("bookmarks", "readwrite").objectStore("bookmarks");
    const existing = await new Promise((r) => { const q = store.get(entry.slug); q.onsuccess = () => r(q.result); });
    if (existing) { store.delete(entry.slug); return false; }
    store.put({ ...entry, addedAt: Date.now() });
    return true;
  },
  async isBookmarked(slug) {
    await this.open();
    return new Promise((r) => {
      const q = this.db.transaction("bookmarks", "readonly").objectStore("bookmarks").get(slug);
      q.onsuccess = () => r(!!q.result);
    });
  },
  async addToHistory(entry) {
    await this.open();
    this.db.transaction("history", "readwrite").objectStore("history").put({ ...entry, readAt: Date.now() });
  },
};
window.LibDB = LibDB;

// =============================================================
//  Theme toggle (Bootstrap-native data-bs-theme)
// =============================================================
function toggleTheme() {
  const next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", next);
  localStorage.setItem("theme", next);
}

// =============================================================
//  Bookmark icons
// =============================================================
function paintBookmark(btn, on) {
  const icon = btn.querySelector("i");
  if (icon) icon.className = on ? "bi bi-bookmark-fill" : "bi bi-bookmark";
  btn.classList.toggle("active", on);
}

// =============================================================
//  Boot
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
  // -- theme toggles (header + reader)
  document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", toggleTheme));

  // -- bookmark button (series page)
  const bmBtn = document.getElementById("bookmark-btn");
  if (bmBtn) {
    const meta = {
      slug: bmBtn.dataset.slug,
      title: bmBtn.dataset.title,
      author: bmBtn.dataset.author,
      cover: bmBtn.dataset.cover,
    };
    try {
      paintBookmark(bmBtn, await LibDB.isBookmarked(meta.slug));
      bmBtn.addEventListener("click", async () => paintBookmark(bmBtn, await LibDB.toggleBookmark(meta)));
    } catch (e) { console.error(e); }
  }

  // -- library home filter pills
  const pills = document.querySelectorAll(".filter-pills [data-filter]");
  const grid = document.getElementById("novel-grid");
  if (pills.length && grid) {
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const f = pill.dataset.filter;
        grid.querySelectorAll("[data-status]").forEach((card) => {
          const status = (card.dataset.status || "").toLowerCase();
          let show = f === "all";
          if (f === "ongoing") show = status.includes("ongoing") || status.includes("publishing");
          else if (f !== "all") show = status.includes(f);
          card.classList.toggle("d-none", !show);
        });
      });
    });
  }

  // -- reader: progress bar + auto-hiding bars
  const reader = document.getElementById("reader-wrapper");
  if (reader) {
    const bar = document.getElementById("reading-progress");
    const top = document.getElementById("reader-topbar");
    const bottom = document.getElementById("reader-bottombar");

    if (bar) {
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = Math.min((window.scrollY / h) * 100, 100) + "%";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (top && bottom) {
      const setBars = (on) => {
        top.classList.toggle("visible", on);
        bottom.classList.toggle("visible", on);
      };
      setBars(true);
      reader.addEventListener("click", (e) => {
        if (e.target.closest("a,button")) return;
        setBars(!top.classList.contains("visible"));
      });
    }

    // save reading progress (localStorage mirror + IndexedDB history)
    try {
      const b = document.body;
      const seriesId = parseInt(b.dataset.seriesId);
      const chapterId = parseInt(b.dataset.chapterId);
      if (seriesId && chapterId) {
        const progress = JSON.parse(localStorage.getItem("reading_progress") || "{}");
        if (!progress[seriesId]) progress[seriesId] = [];
        if (!progress[seriesId].includes(chapterId)) {
          progress[seriesId].push(chapterId);
          localStorage.setItem("reading_progress", JSON.stringify(progress));
        }
        LibDB.addToHistory({
          id: chapterId,
          title: b.dataset.chapterTitle,
          seriesTitle: b.dataset.seriesTitle,
          seriesSlug: b.dataset.seriesSlug,
          chapterNum: parseFloat(b.dataset.chapterNum),
        });
      }
    } catch (e) { console.error("progress save failed", e); }
  }

  // -- series page: mark already-read chapters
  const chapterList = document.getElementById("chapters");
  if (chapterList) {
    const seriesId = parseInt(chapterList.dataset.seriesId);
    const progress = JSON.parse(localStorage.getItem("reading_progress") || "{}");
    const read = progress[seriesId] || [];
    chapterList.querySelectorAll(".chapter-item").forEach((row) => {
      if (read.includes(parseInt(row.dataset.id))) {
        row.classList.add("read");
        const badge = row.querySelector(".ch-read-badge");
        if (badge) badge.classList.remove("d-none");
      }
    });
    if (read.length) {
      const cta = document.getElementById("start-reading-btn");
      if (cta) cta.innerHTML = '<i class="bi bi-book-half me-2"></i>Continue Reading';
    }
  }
});
