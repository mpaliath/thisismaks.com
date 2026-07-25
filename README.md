# ThisIsMaks

Personal journal and identity site for
[thisismaks.com](https://thisismaks.com), built as a standalone static
Next.js website.

## Requirements

- Node.js 20.9 or newer
- npm

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
