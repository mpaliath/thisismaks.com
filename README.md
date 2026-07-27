# ThisIsMaks

Personal journal and identity site for
[thisismaks.com](https://thisismaks.com), built as a standalone static
Next.js website.

## Requirements

- [mise](https://mise.jdx.dev/)

## Local development

```bash
mise install
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The repository's `mise.toml` pins Node.js (including its bundled npm), so mise
selects the same toolchain locally and in GitHub Actions. If your shell does not
already activate mise, prefix commands with `mise exec --`, for example
`mise exec -- npm run dev`.

## Adding a journal post

The easiest option is the interactive helper:

```bash
npm run new:note
```

It asks for the title, excerpt, and tag; derives a URL-safe slug; and defaults
the date to today. New notes start with `draft: true`, so they will not appear
on the site until that line is removed.

You can also create a file manually:

Create one Markdown file in `content/posts/`. The filename becomes the URL
slug, so `a-new-note.md` is published at `/journal/a-new-note/`.

Start the file with:

```markdown
---
title: "A new note"
date: "2026-07-26"
excerpt: "A short description shown on the homepage and in link previews."
tag: "Notes"
readTime: "4 min read"
---

Write the post in Markdown here.
```

`title`, `date`, `excerpt`, and `tag` are required. `readTime` is optional; if
omitted, it is estimated from the post length. Add `draft: true` to keep a file
out of the build.

At build time, every published Markdown file is converted to its own static
page and automatically added to the homepage in reverse chronological order.
No application code needs to change.

### Publishing note-only changes

After writing one or more notes, run:

```bash
npm run deploy:notes
```

This guarded workflow:

1. Requires `main` to match `origin/main`.
2. Refuses to proceed if any code, configuration, deletion, or non-Markdown
   change is present.
3. Runs the full static build and test suite.
4. Shows which notes will publish and asks for confirmation.
5. Commits and pushes the note changes to `main`.
6. Waits for the Azure GitHub Actions deployment to finish.

Changed drafts may be included in the commit but are excluded from the site.
If every changed note is a draft, the command exits successfully without
committing, pushing, or triggering an Azure deployment.

Use the normal code-development workflow for functionality changes or note
deletions.

## Static production build

```bash
npm run build:azure
```

The deployable site is written to `out/`. It contains only static HTML, CSS,
JavaScript, fonts, images, and the Azure Static Web Apps configuration.

## Automatic Azure deployment

Pushes to `main` trigger
`.github/workflows/azure-static-web-apps-ashy-mushroom-07c568f10.yml`.
The workflow builds the static export and uploads `out/` to the existing
`ThisIsMaks` Azure Static Web App.

The workflow expects the deployment token in the repository secret
`AZURE_STATIC_WEB_APPS_API_TOKEN_ASHY_MUSHROOM_07C568F10`, which Azure created
when the GitHub integration was configured.

## Manual Azure deployment

Set the existing Static Web App deployment token in your shell and run:

```bash
export AZURE_STATIC_WEB_APPS_API_TOKEN="<deployment-token>"
npm run deploy:azure
```

The helper performs a clean static build and deploys `out/` using the official
Azure Static Web Apps CLI. The token is read only from the environment and must
never be committed.
