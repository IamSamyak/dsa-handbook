const OWNER = "IamSamyak";
const REPO = "Algorithms";
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

let allAlgorithms = [];
let currentCode = "";
let meta = {};

/* LOAD METADATA */
async function loadMetadata() {
  const res = await fetch(
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/algorithms.json`
  );
  meta = await res.json();
}

async function loadAlgorithms() {
  await loadMetadata();

  const res = await fetch(BASE);
  const files = await res.json();

  const javaFiles = files.filter(
    f => f.type === "file" && f.name.endsWith(".java")
  );

  const mdFiles = files.filter(
    f => f.type === "file" && f.name.endsWith(".md")
  );

  allAlgorithms = javaFiles.map(java => {
    const name = java.name.replace(".java", "");
    const md = mdFiles.find(m => m.name === `${name}.md`);
    const info = meta[name];

    // Only show algorithms defined in algorithms.json
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
}

function render(list) {
  const div = document.getElementById("list");
  div.innerHTML = "";

  if (list.length === 0) {
    div.innerHTML = `<p class="empty">No algorithms found 🚫</p>`;
    return;
  }

  list.forEach(a => {
    div.innerHTML += `
      <div class="card">
        <div class="card-header">
          <h3>${a.name}</h3>
          <span class="badge">${a.difficulty}</span>
        </div>

        <p class="desc">${a.description}</p>

        <div class="meta">
          <span>⏱ ${a.time}</span>
          <span>💾 ${a.space}</span>
        </div>

        <div class="actions">
          ${
            a.mdPath
              ? `<a href="algorithm.html?path=${a.mdPath}" class="btn">Read →</a>`
              : ""
          }
          <button class="preview-btn" onclick="openPreview('${a.name}')">
            👁 Preview
          </button>
        </div>
      </div>
    `;
  });
}

/* SEARCH */
function searchAlgo(query) {
  query = query.toLowerCase();
  render(
    allAlgorithms.filter(a =>
      a.name.toLowerCase().includes(query)
    )
  );
}

/* PREVIEW MODAL */
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

  // Highlight the code block
  hljs.highlightElement(codeEl);
}

function closePreview() {
  document.getElementById("previewModal").classList.add("hidden");
}

function copyPreview() {
  navigator.clipboard.writeText(currentCode);
  alert("Code copied ✅");
}

loadAlgorithms();
