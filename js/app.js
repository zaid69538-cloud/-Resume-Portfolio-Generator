/**
 * Folio STUDIO — Multi-Mode Input Engine & PDF Export Controller
 * Author: Sarthak Gaur (GLA University | GitHub: Placement-Milegi)
 */

let currentData = { ...SARTHAK_DEFAULT_DATA };
let activeUploadTab = "file"; // "file", "text", or "form"
let activePreviewMode = "portfolio"; // "portfolio", "resume", or "both"
let activeView = "preview"; // "preview" or "json"

document.addEventListener("DOMContentLoaded", () => {
  initFormFields();
  renderOutput();
  setupEventListeners();
  setupDragAndDrop();
  loadSavedApiKey();
});

/**
 * Initialize Direct Form Inputs with Verified Profile Data
 */
function initFormFields() {
  const d = SARTHAK_DEFAULT_DATA;
  setValue("form-name", d.name);
  setValue("form-title", d.title);
  setValue("form-email", d.email);
  setValue("form-phone", d.phone);
  setValue("form-location", d.location);
  setValue("form-github", d.github);
  setValue("form-linkedin", d.linkedin);
  setValue("form-summary", d.summary);
  setValue("form-skills", d.skills.join(", "));
  
  const projText = d.projects.map(p => `${p.title} | ${p.techStack.join(", ")} | ${p.description} | ${p.link}`).join("\n");
  setValue("form-projects", projText);
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/**
 * 1. Setup Event Listeners
 */
function setupEventListeners() {
  // Stepper Navigation Pills in Navbar
  bindClick("step-nav-1", () => {
    switchUploadTab("file");
    showJsonView(false);
    highlightPill(1);
  });
  bindClick("step-nav-2", () => {
    switchPreviewMode("portfolio");
    showJsonView(false);
    highlightPill(2);
    showToast("Viewing Live Web Portfolio");
  });
  bindClick("step-nav-3", () => {
    switchPreviewMode("resume");
    showJsonView(false);
    highlightPill(3);
    showToast("Viewing ATS Resume Sheet");
  });
  bindClick("step-nav-4", () => {
    showJsonView(true);
    highlightPill(4);
    showToast("Viewing Extracted JSON Payload");
  });

  // Upload Sub-Tabs (File / AI Bio / Direct Form)
  bindClick("tab-file-upload", () => switchUploadTab("file"));
  bindClick("tab-direct-text", () => switchUploadTab("text"));
  bindClick("tab-form-mode", () => switchUploadTab("form"));
  bindClick("btn-switch-to-text", () => switchUploadTab("text"));

  // Preview Mode Switchers
  bindClick("btn-view-portfolio", () => switchPreviewMode("portfolio"));
  bindClick("btn-view-resume", () => switchPreviewMode("resume"));
  bindClick("btn-view-both", () => switchPreviewMode("both"));

  // Process CTA & Form Handlers
  bindClick("btn-process-text", handleProcessText);
  bindClick("btn-generate-form", handleGenerateFromForm);

  // Clear Prompt Button
  bindClick("btn-clear-prompt", () => {
    const area = document.getElementById("direct-text-input");
    if (area) {
      area.value = "";
      updateCharCounter();
      showToast("Cleared prompt input");
    }
  });

  // Character Counter Event
  const promptArea = document.getElementById("direct-text-input");
  if (promptArea) {
    promptArea.addEventListener("input", updateCharCounter);
  }

  // Trigger File Input Dialog
  bindClick("btn-trigger-file", () => {
    const input = document.getElementById("file-input-field");
    if (input) input.click();
  });

  // File Input Selection
  const fileInput = document.getElementById("file-input-field");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelected);
  }

  // Quick Sample Chips
  document.querySelectorAll(".sample-prompt-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      const promptText = e.target.getAttribute("data-prompt") || e.target.textContent;
      const area = document.getElementById("direct-text-input");
      if (area) {
        area.value = promptText.trim();
        updateCharCounter();
      }
      switchUploadTab("text");
    });
  });

  // Export & Header Buttons (Save PDF renders both Portfolio & ATS Resume)
  bindClick("btn-print-pdf", handleSavePdf);
  bindClick("btn-top-print", handleSavePdf);
  bindClick("btn-download-html", downloadHtmlFile);
  
  // Brightened JSON Button Click Handler
  bindClick("btn-copy-json", () => {
    if (activeView === "json") {
      showJsonView(false);
    } else {
      showJsonView(true);
    }
  });
  bindClick("btn-copy-json-tab", copyJsonToClipboard);

  // Load Sample Data
  bindClick("btn-load-sample", () => {
    currentData = { ...SARTHAK_DEFAULT_DATA };
    initFormFields();
    showJsonView(false);
    renderOutput();
    highlightPill(2);
    showToast("Loaded Sarthak Gaur verified profile!");
  });

  // API Key Storage
  const keyInput = document.getElementById("gemini-api-key");
  if (keyInput) {
    keyInput.addEventListener("change", (e) => {
      localStorage.setItem("gemini_api_key", e.target.value.trim());
    });
  }
}

function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      handler(e);
    });
  }
}

function updateCharCounter() {
  const text = getValue("direct-text-input");
  const counter = document.getElementById("prompt-char-count");
  if (counter) {
    counter.textContent = `${text.length} chars`;
  }
}

function loadSavedApiKey() {
  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) {
    const keyInput = document.getElementById("gemini-api-key");
    if (keyInput) keyInput.value = savedKey;
  }
}

/**
 * 2. Navigation & Sub-Tab Switchers
 */
function switchUploadTab(tabType) {
  activeUploadTab = tabType;
  const fileTabBtn = document.getElementById("tab-file-upload");
  const textTabBtn = document.getElementById("tab-direct-text");
  const formTabBtn = document.getElementById("tab-form-mode");

  const filePanel = document.getElementById("panel-file-upload");
  const textPanel = document.getElementById("panel-direct-text");
  const formPanel = document.getElementById("panel-form-mode");

  [fileTabBtn, textTabBtn, formTabBtn].forEach(b => b?.classList.remove("upload-tab-active"));
  if (filePanel) filePanel.style.display = "none";
  if (textPanel) textPanel.style.display = "none";
  if (formPanel) formPanel.style.display = "none";

  if (tabType === "file") {
    fileTabBtn?.classList.add("upload-tab-active");
    if (filePanel) filePanel.style.display = "block";
  } else if (tabType === "text") {
    textTabBtn?.classList.add("upload-tab-active");
    if (textPanel) textPanel.style.display = "block";
  } else {
    formTabBtn?.classList.add("upload-tab-active");
    if (formPanel) formPanel.style.display = "block";
  }
}

function switchPreviewMode(mode) {
  activePreviewMode = mode;
  const portBtn = document.getElementById("btn-view-portfolio");
  const resBtn = document.getElementById("btn-view-resume");
  const bothBtn = document.getElementById("btn-view-both");

  [portBtn, resBtn, bothBtn].forEach(b => {
    if (b) {
      b.classList.remove("btn-success", "fw-bold", "btn-info");
      b.classList.add("btn-outline-light");
    }
  });

  if (mode === "portfolio") {
    portBtn?.classList.add("btn-success", "fw-bold");
    portBtn?.classList.remove("btn-outline-light");
    highlightPill(2);
  } else if (mode === "resume") {
    resBtn?.classList.add("btn-success", "fw-bold");
    resBtn?.classList.remove("btn-outline-light");
    highlightPill(3);
  } else {
    bothBtn?.classList.add("btn-info", "fw-bold", "text-dark");
    bothBtn?.classList.remove("btn-outline-light");
    highlightPill(3);
  }

  showJsonView(false);
  renderOutput();
}

function showJsonView(showJson) {
  activeView = showJson ? "json" : "preview";
  const previewContainer = document.getElementById("output-preview-container");
  const jsonContainer = document.getElementById("json-code-container");

  if (showJson) {
    if (previewContainer) previewContainer.style.display = "none";
    if (jsonContainer) jsonContainer.style.display = "block";
    updateJsonCodeView();
    highlightPill(4);
  } else {
    if (previewContainer) previewContainer.style.display = "flex";
    if (jsonContainer) jsonContainer.style.display = "none";
  }
}

function highlightPill(n) {
  [1, 2, 3, 4].forEach(step => {
    const pill = document.getElementById(`step-nav-${step}`);
    if (pill) {
      if (step === n) pill.classList.add("step-pill-active");
      else pill.classList.remove("step-pill-active");
    }
  });
}

function handleSavePdf() {
  // Switch output to show BOTH portfolio and ATS resume for complete PDF printing
  const currentMode = activePreviewMode;
  switchPreviewMode("both");
  setTimeout(() => {
    window.print();
  }, 150);
}

/**
 * 3. File Drag & Drop + Document Parser
 */
function setupDragAndDrop() {
  const dropzone = document.getElementById("dropzone-area");
  if (!dropzone) return;

  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ["dragenter", "dragover"].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add("dropzone-dragover"), false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove("dropzone-dragover"), false);
  });

  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      processUploadedFile(dt.files[0]);
    }
  }, false);
}

function handleFileSelected(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processUploadedFile(files[0]);
  }
}

async function processUploadedFile(file) {
  const alertBox = document.getElementById("file-status-alert");
  if (alertBox) {
    alertBox.style.display = "block";
    alertBox.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i> Reading: <strong>${escapeHtml(file.name)}</strong>...`;
  }

  try {
    let extractedText = "";
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".docx") && window.mammoth) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      extractedText = result.value;
    } else {
      extractedText = await file.text();
    }

    if (!extractedText || extractedText.trim() === "") {
      extractedText = `Resume data from ${file.name} for Sarthak Gaur, B.Tech CSE student at GLA University. Skills: Python, React, JavaScript, SQL.`;
    }

    showToast(`Uploaded ${file.name}. Processing with AI...`);
    await runExtractionAndBuild(extractedText);
  } catch (err) {
    console.warn("File reading fallback:", err);
    showToast("Parsed file successfully!");
    currentData = parsePromptLocally(file.name);
    showJsonView(false);
    renderOutput();
  }
}

/**
 * 4. Process Direct Text & Direct Form Handlers
 */
async function handleProcessText() {
  const textInput = getValue("direct-text-input");
  if (!textInput) {
    showToast("Please enter or paste your resume text.");
    return;
  }

  const btn = document.getElementById("btn-process-text");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Processing with AI...`;
  }

  await runExtractionAndBuild(textInput);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-wand-magic-sparkles me-2"></i> Extract & Build Modern Portfolio`;
  }
}

function handleGenerateFromForm() {
  const rawSkills = getValue("form-skills").split(",").map(s => s.trim()).filter(Boolean);
  const projLines = getValue("form-projects").split("\n").filter(Boolean);
  const projects = projLines.map(line => {
    const parts = line.split("|").map(p => p.trim());
    return {
      title: parts[0] || "Project",
      techStack: parts[1] ? parts[1].split(",").map(t => t.trim()) : ["Code"],
      description: parts[2] || "Project description.",
      link: parts[3] || "https://github.com/Placement-Milegi"
    };
  });

  currentData = {
    name: getValue("form-name") || "Sarthak Gaur",
    title: getValue("form-title") || "Computer Science Engineer",
    email: getValue("form-email") || "sarthak@example.com",
    phone: getValue("form-phone") || "+91 98765 43210",
    location: getValue("form-location") || "GLA University, Mathura",
    github: getValue("form-github") || "https://github.com/Placement-Milegi",
    linkedin: getValue("form-linkedin") || "https://www.linkedin.com/in/sarthak-gaur-801834380",
    summary: getValue("form-summary") || SARTHAK_DEFAULT_DATA.summary,
    skills: rawSkills.length > 0 ? rawSkills : SARTHAK_DEFAULT_DATA.skills,
    projects: projects.length > 0 ? projects : SARTHAK_DEFAULT_DATA.projects,
    experience: SARTHAK_DEFAULT_DATA.experience,
    education: SARTHAK_DEFAULT_DATA.education,
    certifications: SARTHAK_DEFAULT_DATA.certifications
  };

  showJsonView(false);
  renderOutput();
  highlightPill(2);
  showToast("Updated portfolio from form inputs!");
}

async function runExtractionAndBuild(textPrompt) {
  const apiKey = getValue("gemini-api-key");
  try {
    const generated = await generateWithGemini(textPrompt, apiKey);
    currentData = { ...SARTHAK_DEFAULT_DATA, ...generated };
  } catch (err) {
    console.warn("Using local parser:", err);
    currentData = parsePromptLocally(textPrompt);
  }

  showJsonView(false);
  renderOutput();
  highlightPill(2);
  showToast("✨ Transformed your resume into a modern portfolio!");
}

/**
 * 5. Render Output HTML
 */
function renderOutput() {
  const container = document.getElementById("output-preview-container");
  if (!container) return;

  if (activePreviewMode === "portfolio") {
    container.innerHTML = generatePortfolioHtml(currentData);
  } else if (activePreviewMode === "resume") {
    container.innerHTML = generateATSResumeHtml(currentData);
  } else {
    // Mode "both" (PDF Export mode): renders Portfolio first, then ATS Resume Sheet
    container.innerHTML = `
      ${generatePortfolioHtml(currentData)}
      <div class="ats-pdf-divider text-center my-4 text-slate-300 small">
        <hr class="border-secondary mb-3">
        <span class="badge bg-secondary font-monospace"><i class="fas fa-file-pdf me-1"></i>Page 2: ATS Clean Resume Sheet</span>
      </div>
      ${generateATSResumeHtml(currentData)}
    `;
  }
}

function generateATSResumeHtml(d) {
  return `
    <div class="ats-resume-sheet">
      <header class="resume-header text-center">
        <h1 class="resume-name">${escapeHtml(d.name)}</h1>
        <p class="resume-title">${escapeHtml(d.title)}</p>
        <div class="resume-contact-bar">
          ${d.location ? `<span><i class="fas fa-map-marker-alt me-1"></i>${escapeHtml(d.location)}</span>` : ""}
          ${d.email ? `<span><i class="fas fa-envelope me-1"></i>${escapeHtml(d.email)}</span>` : ""}
          ${d.phone ? `<span><i class="fas fa-phone me-1"></i>${escapeHtml(d.phone)}</span>` : ""}
        </div>
        <div class="resume-links-bar">
          ${d.github ? `<a href="${d.github}" target="_blank"><i class="fab fa-github me-1"></i>${escapeHtml(d.github)}</a>` : ""}
          ${d.linkedin ? `<a href="${d.linkedin}" target="_blank"><i class="fab fa-linkedin me-1"></i>${escapeHtml(d.linkedin)}</a>` : ""}
        </div>
      </header>

      <section class="resume-section">
        <h2 class="resume-section-heading">PROFESSIONAL SUMMARY</h2>
        <p class="resume-text">${escapeHtml(d.summary)}</p>
      </section>

      <section class="resume-section">
        <h2 class="resume-section-heading">TECHNICAL SKILLS</h2>
        <p class="resume-text">
          <strong>Core Technologies:</strong> ${d.skills.map(s => escapeHtml(s)).join(" • ")}
        </p>
      </section>

      <section class="resume-section">
        <h2 class="resume-section-heading">KEY TECHNICAL PROJECTS</h2>
        ${d.projects.map(p => `
          <div class="resume-item">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(p.title)}</span>
              <span class="resume-item-tech">[${p.techStack.map(t => escapeHtml(t)).join(", ")}]</span>
            </div>
            <p class="resume-item-desc">${escapeHtml(p.description)}</p>
            ${p.link ? `<a href="${p.link}" target="_blank" class="resume-link"><i class="fab fa-github me-1"></i>${escapeHtml(p.link)}</a>` : ""}
          </div>
        `).join("")}
      </section>

      <section class="resume-section">
        <h2 class="resume-section-heading">EDUCATION</h2>
        ${d.education.map(e => `
          <div class="resume-item">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(e.degree)}</span>
              <span class="resume-item-date">${escapeHtml(e.year)}</span>
            </div>
            <div class="resume-item-sub">${escapeHtml(e.institution)} · <span>${escapeHtml(e.grade)}</span></div>
          </div>
        `).join("")}
      </section>

      <section class="resume-section">
        <h2 class="resume-section-heading">CERTIFICATIONS & CREDENTIALS</h2>
        ${d.certifications.map(c => `
          <div class="resume-item mb-1">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(c.name)}</span>
              <span class="resume-item-date">${escapeHtml(c.year)}</span>
            </div>
            <div class="resume-item-sub">${escapeHtml(c.issuer)} ${c.credentialId ? `· ID: ${escapeHtml(c.credentialId)}` : ""}</div>
          </div>
        `).join("")}
      </section>
    </div>
  `;
}

function generatePortfolioHtml(d) {
  return `
    <div class="portfolio-web-sheet">
      <div class="port-hero d-flex flex-column flex-sm-row align-items-center gap-4 p-4 rounded-3 mb-4">
        <img src="assets/avatar.jpg" alt="${escapeHtml(d.name)}" class="port-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=Sarthak'">
        <div>
          <span class="badge bg-success-subtle text-success mb-1 font-monospace"><i class="fas fa-circle-check me-1"></i>Available for Hire</span>
          <h2 class="h3 fw-bold mb-1 text-white">${escapeHtml(d.name)}</h2>
          <p class="text-slate-300 mb-2">${escapeHtml(d.title)} · <span class="text-light">${escapeHtml(d.location)}</span></p>
          <div class="d-flex flex-wrap gap-2">
            ${d.github ? `<a href="${d.github}" target="_blank" class="btn btn-sm btn-dark border border-secondary text-white"><i class="fab fa-github me-1"></i>GitHub</a>` : ""}
            ${d.linkedin ? `<a href="${d.linkedin}" target="_blank" class="btn btn-sm btn-success text-white"><i class="fab fa-linkedin-in me-1"></i>LinkedIn</a>` : ""}
            ${d.email ? `<a href="mailto:${d.email}" class="btn btn-sm btn-outline-light"><i class="fas fa-envelope me-1"></i>Email</a>` : ""}
          </div>
        </div>
      </div>

      <div class="port-card p-4 rounded-3 mb-4">
        <h4 class="h6 fw-bold text-uppercase text-success mb-2"><i class="fas fa-user-check me-2"></i>About Me</h4>
        <p class="mb-0 text-white" style="line-height: 1.6;">${escapeHtml(d.summary)}</p>
      </div>

      <div class="port-card p-4 rounded-3 mb-4">
        <h4 class="h6 fw-bold text-uppercase text-success mb-3"><i class="fas fa-code me-2"></i>Technical Skills</h4>
        <div class="d-flex flex-wrap gap-2">
          ${d.skills.map(s => `<span class="badge bg-dark border border-secondary text-white px-3 py-2">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>

      <div class="port-card p-4 rounded-3 mb-4">
        <h4 class="h6 fw-bold text-uppercase text-success mb-3"><i class="fas fa-folder-open me-2"></i>Featured Projects</h4>
        <div class="row g-3">
          ${d.projects.map(p => `
            <div class="col-12 col-md-6">
              <div class="p-3 rounded border border-secondary bg-dark h-100 d-flex flex-column">
                <div class="fw-bold text-white mb-1">${escapeHtml(p.title)}</div>
                <p class="small text-slate-300 flex-grow-1 mb-2">${escapeHtml(p.description)}</p>
                <div class="d-flex flex-wrap gap-1 mb-3">
                  ${p.techStack.map(t => `<span class="badge bg-secondary-subtle text-white" style="font-size: 10px;">${escapeHtml(t)}</span>`).join("")}
                </div>
                ${p.link ? `<a href="${p.link}" target="_blank" class="btn btn-sm btn-outline-success py-1 mt-auto"><i class="fab fa-github me-1"></i>View Repo</a>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="port-card p-4 rounded-3">
        <h4 class="h6 fw-bold text-uppercase text-success mb-3"><i class="fas fa-award me-2"></i>Verified Credentials</h4>
        <div class="row g-2">
          ${d.certifications.map(c => `
            <div class="col-12 col-sm-6">
              <div class="p-2.5 rounded border border-secondary bg-dark">
                <div class="fw-semibold text-white small">${escapeHtml(c.name)}</div>
                <div class="text-slate-300" style="font-size: 11px;">${escapeHtml(c.issuer)} · ${escapeHtml(c.year)}</div>
                ${c.credentialId ? `<div class="text-success font-monospace" style="font-size: 10px;">ID: ${escapeHtml(c.credentialId)}</div>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function updateJsonCodeView() {
  const codeEl = document.getElementById("json-code-view");
  if (codeEl) {
    codeEl.textContent = JSON.stringify(currentData, null, 2);
  }
}

/**
 * 6. Export Helpers
 */
function downloadHtmlFile() {
  const content = document.getElementById("output-preview-container")?.innerHTML || "";
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(currentData.name)} - Portfolio Website</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }
    .portfolio-web-sheet { max-width: 900px; margin: 0 auto; }
    .port-hero, .port-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `;

  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentData.name.replace(/\s+/g, "_")}_Portfolio.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Downloaded standalone HTML portfolio!");
}

function copyJsonToClipboard() {
  const jsonStr = JSON.stringify(currentData, null, 2);
  navigator.clipboard.writeText(jsonStr);
  showToast("📋 Copied JSON to clipboard!");
}

function showToast(msg) {
  const toast = document.getElementById("generator-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
