# 🌐 Full Stack Web Development - Class Notes & Tasks

Welcome to my **Full Stack Web Development** repository! This repository contains my college classroom lecture notes, practical exercises, daily tasks, and mini-projects covering **HTML5**, **CSS3**, **JavaScript**, and related modern web technologies.

---

## 📂 Repository Structure

Projects and class notes are organized chronologically by date or by topic:

```text
full-stack/
├── .github/                 # GitHub Actions CI workflow & issue/PR templates
│   ├── workflows/ci.yaml    # Automated code quality check
│   ├── ISSUE_TEMPLATE/      # Task question template
│   └── pull_request_template.md
├── 24-Sep/                  # Class: Space Explorer Landing Page
│   ├── index.html           # HTML5 structure & Bootstrap 5 components
│   └── style.css            # Custom CSS animations & keyframes
├── .editorconfig            # Code indentation & formatting rules
├── .gitattributes           # Git line-ending normalization & file types
├── .gitignore               # Ignored files (OS, IDE, browser & server caches)
├── .gitmessage              # Standard commit message template
├── CONTRIBUTING.md          # Contribution guidelines
├── LICENSE                  # MIT License
└── README.md                # Repository overview & navigation
```

---

## 📚 Class Notes & Practical Tasks Index

| Date | Topic / Project | Key Concepts | Files |
| :--- | :--- | :--- | :--- |
| **24-Sep** | **Space Explorer Landing Page** | Bootstrap 5 Navbar, Hero section, CSS Keyframe Animations (`rocketMove`, `astronautMove`), Responsive Design | [index.html](file:///home/shubham/full-stack/24-Sep/index.html) • [style.css](file:///home/shubham/full-stack/24-Sep/style.css) |

*(More classes, notes, and JavaScript exercises will be added here as the course progresses).*

---

## 🛠️ Tech Stack & Tools

- **Markup & Styling**: HTML5, CSS3, Bootstrap 5
- **Scripting**: Modern JavaScript (ES6+)
- **Version Control**: Git & GitHub
- **Editor**: Visual Studio Code (Live Server extension recommended)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ShubhamJain17r/full-stack.git
cd full-stack
```

### 2. View in Browser
- **Option A (VS Code Live Server)**: Right-click any `index.html` file in VS Code and select **"Open with Live Server"**.
- **Option B (Direct Open)**: Double-click the `.html` file to open it directly in your web browser (Chrome, Firefox, Edge, etc.).

---

## 🌿 Git Workflow

To keep the repository clean and structured, standard commit message prefixes are recommended:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `notes:` | Classroom notes and theory | `notes(html): add semantic tags reference` |
| `task:` | Practical lab assignments | `task(24-sep): create space explorer animations` |
| `feat:` | New feature or full page | `feat(js): add interactive quiz widget` |
| `style:` | CSS styling or visual tweaks | `style(css): adjust navbar hover states` |
| `fix:` | Bug fixes in layout or code | `fix(css): correct mobile layout overflow` |

*(Optional)* Configure Git to use the commit message template:
```bash
git config commit.template .gitmessage
```

---

## 📄 License

This repository is licensed under the [MIT License](file:///home/shubham/full-stack/LICENSE).
