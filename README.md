# AI Resume & Developer Portfolio Generator

A lightweight, distraction-free **AI Resume & Developer Portfolio Generator** built with pure vanilla web technologies (**HTML5, CSS3, JavaScript**) and powered by the **Google Gemini API**.

**Author**: **Sarthak Gaur**  
**Institute**: **GLA University, Mathura** (B.Tech CSE - AIML)  
**GitHub Profile**: [`@Placement-Milegi`](https://github.com/Placement-Milegi)  
**Repository**: [`Ai-Resume-and-Portfolio-Generator-Template`](https://github.com/Placement-Milegi/Ai-Resume-and-Portfolio-Generator-Template)

---

## 🌟 Key Features & Workflow

### 1. Two Generation Modes:
* **Option 1: Default Form Mode ("Default Way")**:
  - Direct structured input fields for Name, Title, Contact, Summary, Skills, Projects, Education, and Certifications.
  - **1-Click Load Sarthak's Data**: Pre-fills the entire form with verified credentials (GLA University AIML, Microsoft Azure AZ-900, 6 GitHub projects).
* **Option 2: Gemini AI Prompt Mode ("Prompt Way")**:
  - Enter raw natural language prompts (e.g. *"I am Sarthak Gaur, B.Tech CSE student at GLA University with AZ-900 certificate, skilled in Python, React, C++, and built DevBoard and Crop-Yield-Projection..."*).
  - Direct integration with **Google Gemini API** (`gemini-2.5-flash` / `gemini-1.5-flash`) with structured JSON schema extraction.
  - Built-in smart client-side NLP fallback engine when operating offline or without an API key.

### 2. Dual Live Output Views:
* **📄 ATS Resume View**:
  - Clean, high-contrast, single-column resume optimized for Automated Tracking Systems (ATS).
  - Proper typographic hierarchy and clean section dividers.
* **🌐 Web Portfolio View**:
  - Modern interactive developer portfolio preview featuring avatar, technical badges, repository cards with GitHub links, and verified certification badges.

### 3. Clean Export Actions:
* 🖨️ **Save as PDF / Print**: Uses `@media print` CSS rules for instant print-to-PDF formatting.
* 💾 **Download HTML File**: Generates a standalone, self-contained HTML file ready to share or host.
* 📋 **Copy Raw JSON**: Copies standardized structured JSON to clipboard.

### 4. Pure Vanilla Architecture (Zero-Build):
* No React, Node modules, Vite, or complex build tooling.
* Simply double-click `index.html` to open in any web browser!

---

## 📁 Project Structure

```text
Ai-Resume-and-Portfolio-Generator-Template/
├── index.html              # Main dual-pane generator web application
├── favicon.svg             # Brand vector icon
├── avatar.jpg              # Sarthak Gaur portrait avatar
├── .nojekyll               # GitHub Pages deployment configuration
├── css/
│   └── style.css           # Dual-pane styling, ATS resume paper & print CSS
├── js/
│   ├── geminiService.js    # Google Gemini API client & intelligent NLP parser
│   └── app.js              # Vanilla JS controller, form syncing & export logic
├── assets/
│   └── avatar.jpg          # Profile avatar asset
└── README.md
```

---

## 💻 How to Run & Host

### Run Locally:
Open `index.html` directly in Chrome, Edge, Firefox, or Safari:
```bash
# Or run with any local static server:
npx serve .
# Or Python:
python -m http.server 8000
```

### Host on GitHub Live (GitHub Pages):
1. Push to your repository:
   ```bash
   git add .
   git commit -m "Pure vanilla dual-mode AI Resume and Portfolio Generator with Gemini API"
   git push origin main
   ```
2. Go to **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **`main` / `(root)`** → Click **Save**.
3. Live URL: `https://placement-milegi.github.io/Ai-Resume-and-Portfolio-Generator-Template/`
