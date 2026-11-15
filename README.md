# Fieldwork

A frontend learning workspace with one job preparation guide. Its chapters contain the related templates and files. Daily tasks, chapter checklists, reading progress, the focus timer, and application records use the browser's `localStorage`.

## Run it locally

You need Node.js 18 or later to use the preview server. From this folder, run:

```sh
npm start
```

Open **http://localhost:4173**. On macOS/Linux, `PORT=4174 npm start` uses a different port.

The preview server only serves static files. It has no API, database, or storage for user data. All application logic runs in the browser. There are no packages to install for the frontend.

## GitHub Pages

The public site is published from the root of `main`. The `.nojekyll` file lets GitHub Pages serve the files directly. Updates pushed to `main` publish automatically. The Node preview server and Python PDF tool are not needed to run the hosted site.

The hosted site has its own browser storage, separate from a localhost preview. Task checks and other records stay on the device where you use the site.

## Static hosting

To host the site, copy `index.html`, `styles.css`, `app.js`, `assets/`, and `resources/` to a static host. Keep the relative paths. Navigation uses URL hashes, so you do not need a rewrite rule. Fonts come from the device; the site makes no external font requests.

Opening `index.html` directly through `file://` prevents the browser from loading the JSON files. Use the preview server or a static host.

## What is included

- One guide with eleven chapters and a downloadable PDF.
- Checkboxes for each chapter's tasks, saved when you click them.
- Templates in the chapters about resumes, projects, and contacting recruiters.
- A direct Hinglish action chapter for freshers, with copyable introduction templates and a phone clipboard checklist.
- Search across the guide's text.
- A dated study plan with custom tasks and a 25-minute focus timer.
- An application tracker with notes, follow-up dates, and CSV export.

The interface follows the Swiss design described in `DESIGN.md`. The guide and interface copy were edited using the humanizer skill.

## Where your data goes

The browser saves state under `fieldwork.v1` in `localStorage`. This includes daily task checks, custom tasks, chapter checklists, finished chapters, your last chapter, timer state, and application records. The timer keeps its deadline across a reload and saves its remaining time when paused.

Data stays with the browser and origin you used. A different port, another browser, or clearing site data gives you a separate or empty workspace. Export application records if you want a backup. There is no sign-in or server sync.

The app does not submit applications or send recruiter messages. Those actions happen on the relevant job site or in your own email app.

## Analytics

The page loads the supplied Google Tag Manager container, `GTM-PT7FJCB9`, using Google's current installation snippet. Tags and their destinations are managed in that container. The application code does not push task checks, application notes, or clipboard text into the data layer. Analytics reporting depends on the tags published in the container.

The former separate library has been removed. Its old `#resources` URL opens the guide. Existing localStorage task and application records are retained. This version does not import personal files or use IndexedDB; any files imported into an earlier version's IndexedDB are left untouched.

## Add files to a chapter

Put the file in `resources/files/` and add an entry to `resources/manifest.json`. The entry's `chapters` array determines where it appears. See `resources/README.md` for an example.

## Edit the guide

Both the reader and PDF use `resources/booklet.json`. Edit the prose there. Chapter IDs identify saved reading progress. Checklist checks use the chapter ID and item index, so keep checklist order stable when you want existing checks to keep the same meaning.

To rebuild the PDF, use Python with ReportLab:

```sh
python3 -m pip install reportlab
npm run booklet
```

The output is `resources/files/job-ready-playbook.pdf`. It is already included; Python is only needed to rebuild it. The generation script is a local authoring tool, not part of the running website.

## Check changes

```sh
npm run check
```

This checks JavaScript syntax, guide structure, source references, file paths, and whether attached files name existing chapters. Browser checks cover saved state and the main interactions. The PDF is also rendered for visual review after changes.

The full 25-minute timer completion has not been waited through. Start, pause, reset, and reload persistence are checked separately.

Direct chapter links use `#booklet/<chapter-id>`, for example `#booklet/fresher-actions`. Adding a chapter updates the cover count, progress totals, and chapter selector automatically.
