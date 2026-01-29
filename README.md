# Zacro Technologies
Official static site for zacro.tech and the Zacro AI microsite.

> Fast, minimal, and build-free. Edit the HTML, refresh the page.

## Contents
| Area | Path | Purpose |
| --- | --- | --- |
| Main site | `index.html` | Zacro Technologies landing page |
| AI landing | `ai/index.html` | Zacro AI overview |
| Governance | `ai/governance.html` | Governance details |
| Roadmap | `ai/roadmap.html` | Product direction and milestones |
| How it works | `ai/how-it-works.html` | Process and approach |
| Credits | `ai/credits.html` | Acknowledgements |
| Shared assets | `ai/assets/` | Styles, scripts, and logos |

## Structure
```
.
├── index.html
└── ai/
    ├── index.html
    ├── how-it-works.html
    ├── roadmap.html
    ├── governance.html
    ├── credits.html
    └── assets/
```

## Local preview
1) Open `index.html` directly in your browser, or
2) run a local server:
```sh
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

## Editing guide
- Update the main brand site in `index.html`.
- Update the AI microsite pages in `ai/*.html`.
- Keep paths relative to support local previews and static hosting.

## Quality checklist
- Verify links between main site and AI pages.
- Scan pages on desktop and mobile widths.
- Confirm shared assets load from `ai/assets/`.
