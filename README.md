# Sakib Raihan — Portfolio

Personal portfolio site. Plain HTML, CSS and a little JavaScript, with no build step. It is hosted on GitHub Pages.

**Live:** https://sakib9797.github.io

## Interactions

Every effect runs on plain JavaScript with no libraries, and each one is turned off when a visitor has "reduce motion" set in their OS.

- **Ambient background:** slow-drifting sage, mist and lavender gradients with light film grain.
- **Entrances:** the name animates in letter by letter, and sections fade and rise into view with a soft blur as you scroll.
- **Rotating tagline:** "I build *LLM agents / RAG pipelines / vision models / full-stack AI apps*".
- **"How I build AI systems" diagram:** five pipeline steps with flowing connectors. Hover or tap a step to read about it; otherwise it advances on its own.
- **Count-up highlights:** Top 17, 57% mAP, and 0% hallucination counting down from 100.
- **Project filters:** All, LLM & Agents, ML & Vision and Full-stack, with a sliding pill. Project cards glow where the cursor is and expand to show "How it works".
- **Timelines:** the line fills in as you scroll and lights each dot it reaches.
- **Command menu:** press `Ctrl K` (`⌘K` on Mac) or `/` to jump to sections, open links, copy the email or switch themes.
- **Theme switch:** light and dark themes, switched with a circular reveal.
- **Phones:** a compact top bar shows the current section and opens the menu.
- **Small touches:** magnetic buttons, a copy-email toast and a scroll progress bar.

If `main.js` fails to load, a small inline script reveals all content after 2.5 seconds, so nothing stays hidden.

## Structure

```
index.html                    All page content
assets/css/style.css          Styles (colors are tokens at the top)
assets/js/main.js             All interactions (see list above)
assets/favicon.svg            Tab icon
assets/Sakib-Raihan-Resume.pdf
.nojekyll                     Tells GitHub Pages to serve the files as-is
```

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

1. On GitHub, create a **public** repository named exactly `Sakib9797.github.io`.
2. Push this folder to that repository's `main` branch:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial portfolio"
   git remote add origin https://github.com/Sakib9797/Sakib9797.github.io.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. After about a minute, the site is live at https://sakib9797.github.io.

To update the site, edit `index.html`, then commit and push again.

## Editing tips

- **Add a project:** copy one `<article class="card">` block in `index.html`. Set `data-cat` to one or more of `llm`, `ml` and `web` so the filters and their counts pick it up. Give its `.more` panel a unique `id` that matches the button's `aria-controls`.
- **Change the pipeline steps:** edit the `data-desc` text on each `.flow-node` button.
- **Change the accent color:** edit `--accent` and `--accent-soft` in `style.css`. Both the light and dark blocks define them.
- **Update the résumé:** replace `assets/Sakib-Raihan-Resume.pdf` and keep the same filename.
