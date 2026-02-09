const OWNER = "IamSamyak";
const REPO = "Algorithms";
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

let allAlgorithms = [];
let currentCode = "";
let meta = {};

/* ================= THEME HANDLING ================= */
const htmlEl = document.documentElement;

// Apply theme based on saved preference or system
function applyTheme(theme) {
    if (theme === "dark") {
        htmlEl.classList.add("dark");
    } else {
        htmlEl.classList.remove("dark");
    }
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
    updateThemeButton();
}

// Toggle theme on button click
function toggleTheme() {
    const isDark = htmlEl.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButton();
}

// Update toggle button text/icon
function updateThemeButton() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.textContent = htmlEl.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
}

/* ================= METADATA & ALGORITHM LOADING ================= */
async function loadMetadata() {
    const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/algorithms.json`);
    meta = await res.json();
}

async function loadAlgorithms() {
    await loadMetadata();

    const res = await fetch(BASE);
    const files = await res.json();

    const javaFiles = files.filter(f => f.type === "file" && f.name.endsWith(".java"));
    const mdFiles = files.filter(f => f.type === "file" && f.name.endsWith(".md"));

    allAlgorithms = javaFiles.map(java => {
        const name = java.name.replace(".java", "");
        const md = mdFiles.find(m => m.name === `${name}.md`);
        const info = meta[name];
        if (!info) return null;

        return {
            name,
            mdPath: md?.path || null,
            difficulty: info.difficulty,
            time: info.time,
            space: info.space,
            description: info.description
        };
    }).filter(Boolean);

    render(allAlgorithms);
    renderComplexityTable(allAlgorithms);
}

/* ================= RENDERING FUNCTIONS ================= */
function render(list) {
    const div = document.getElementById("list");
    div.innerHTML = "";

    if (list.length === 0) {
        div.innerHTML = `<p class="empty">No algorithms found 🚫</p>`;
        return;
    }

    list.forEach(a => {
        div.innerHTML += `
      <div class="card bg-white dark:bg-slate-800 rounded-xl p-4 shadow hover:shadow-lg transition">
        <div class="card-header flex justify-between items-center mb-2">
          <h3 class="font-bold text-lg">${a.name}</h3>
          <span class="badge px-2 py-1 bg-primary/10 text-primary rounded">${a.difficulty}</span>
        </div>
        <p class="desc mb-2">${a.description}</p>
        <div class="meta text-sm text-slate-500 dark:text-slate-400 mb-2 flex gap-4">
          <span>⏱ ${a.time.average}</span>
          <span>💾 ${a.space}</span>
        </div>
        <div class="actions flex gap-2">
          ${a.mdPath ? `<a href="algorithm.html?path=${a.mdPath}" class="px-3 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors">Read →</a>` : ""}
          <button class="preview-btn px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition" onclick="openPreview('${a.name}')">👁 Preview</button>
        </div>
      </div>`;
    });
}

function searchAlgo(query) {
    query = query.toLowerCase();
    const filtered = allAlgorithms.filter(a => a.name.toLowerCase().includes(query));
    render(filtered);
    renderComplexityTable(filtered);
}

/* ================= PREVIEW MODAL ================= */
async function openPreview(name) {
    const modal = document.getElementById("previewModal");
    const title = document.getElementById("modalTitle");
    const codeEl = document.getElementById("modalCode");

    title.textContent = `${name}.java`;
    codeEl.textContent = "Loading...";
    modal.classList.remove("hidden");

    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${name}.java`;
    const res = await fetch(url);
    const code = await res.text();

    currentCode = code;
    codeEl.textContent = code;

    codeEl.removeAttribute("data-highlighted");
    hljs.highlightElement(codeEl);
}

function closePreview() {
    document.getElementById("previewModal").classList.add("hidden");
}

function copyPreview() {
    navigator.clipboard.writeText(currentCode);
    alert("Code copied ✅");
}

/* ================= COMPLEXITY TABLE ================= */
function renderComplexityTable(list) {
    const tbody = document.querySelector("#complexityTable tbody");
    tbody.innerHTML = "";

    list.forEach(a => {
        tbody.innerHTML += `
        <tr>
          <td class="py-2 px-3 font-medium">${a.name}</td>
          <td class="py-2 px-3 font-mono text-emerald-500 text-xs">${a.time.best}</td>
          <td class="py-2 px-3 font-mono text-yellow-500 text-xs">${a.time.average}</td>
          <td class="py-2 px-3 font-mono text-red-500 text-xs">${a.time.worst}</td>
          <td class="py-2 px-3 font-mono text-slate-500 text-xs">${a.space}</td>
        </tr>`;
    });
}

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
    initTheme();          // Initialize theme
    loadAlgorithms();     // Load algorithm data

    // Theme toggle button
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});
