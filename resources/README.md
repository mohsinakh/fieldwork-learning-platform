# Files inside the guide

Each file appears in the chapters named by its manifest entry. There is no separate resource library.

## Add a file

1. Put the file in `resources/files/`.
2. Add an entry to `resources/manifest.json` with a unique ID:

```json
{
  "id": "interview-notes",
  "title": "Interview notes",
  "description": "Questions and notes for interview practice.",
  "format": "PDF",
  "path": "resources/files/interview-notes.pdf",
  "chapters": ["routine"]
}
```

Paths are relative to `index.html`. Keep valid JSON, including commas between entries, then refresh the browser. A static frontend cannot list a folder automatically, so each file needs a manifest entry.

A file can belong to more than one chapter. The resume checklist, for example, appears in `fresher`, `experience`, and `apply`.

The chapter IDs are:

- `direction`
- `story`
- `fresher`
- `experience`
- `projects`
- `search`
- `apply`
- `outreach`
- `routine`
- `review`
- `fresher-actions`

## Change the guide

Edit `booklet.json`, then run `npm run booklet` to update the PDF. PDF generation needs Python with ReportLab. The frontend itself has no Python dependency.

Templates are static files shipped with the frontend. User checks and progress are saved separately in browser `localStorage`.
