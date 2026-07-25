# Azure Deployment Plan

> **Status:** Deployed

Generated: 2026-07-25

---

## 1. Project Overview

**Goal:** Convert the personal journal into a standalone static website,
publish the complete source to GitHub, and deploy it exclusively to the
already-configured Azure Static Web App through GitHub Actions.

**Path:** Modernize existing non-Azure-specific application

---

## 2. Confirmed Azure Context

| Attribute | Value |
|-----------|-------|
| Classification | Production personal website |
| Scale | Small |
| Budget | Cost-optimized |
| Subscription | Azure subscription 1 (`f1f6e086-a0d2-4a09-a602-9d7c0c544faa`) |
| Existing resource | Static Web App `ThisIsMaks` |
| Resource group | `Personal_group` |
| Azure location | Global |
| SKU | Free |
| Source | GitHub branch `main` |
| Current endpoint | `https://ashy-mushroom-07c568f10.7.azurestaticapps.net` |

No new Azure resource will be provisioned. ChatGPT Sites is not a deployment
target and will not remain in the application architecture.

---

## 3. Components Detected

| Component | Type | Technology | Path |
|-----------|------|------------|------|
| Personal journal | Static frontend | Next.js static export | `app/`, `public/` |
| Legacy hosting adapter to remove | ChatGPT Sites / Cloudflare runtime | vinext, Vite, Wrangler | root, `worker/`, `build/`, `.openai/` |
| Deployment integration | GitHub Actions | Azure Static Web Apps workflow | GitHub repository |

---

## 4. Delivery Recipe

**Selected:** Existing GitHub-linked Azure Static Web Apps deployment

**Rationale:**

- Azure resource `ThisIsMaks` already exists.
- Azure already watches the GitHub `main` branch.
- Static Web Apps expects a static output directory; Next.js can emit `out/`.
- No Bicep, Terraform, AZD provisioning, or additional Azure service is needed.

---

## 5. Target Architecture

```text
GitHub main
    -> GitHub Actions
    -> npm ci
    -> npm run build
    -> Next.js static export in out/
    -> existing Azure Static Web App
```

| Component | Azure Service | SKU |
|-----------|---------------|-----|
| Static site output | Existing Azure Static Web App `ThisIsMaks` | Free |

Supporting services are unnecessary because the site has no API, database,
authentication, durable state, or secrets.

---

## 6. Provisioning and Capacity

| Resource Type | New Resources | Capacity Impact | Result |
|---------------|---------------|-----------------|--------|
| `Microsoft.Web/staticSites` | 0 | None; existing Free resource is reused | No quota check required |

No provisioning operation will run. Existing resource settings, access control,
deployment token, and custom domains will not be changed.

---

## 7. Execution Checklist

### Repository modernization

- [x] Configure Next.js for static export to `out/`.
- [x] Remove all ChatGPT Sites and Cloudflare integration code, including
      vinext, Vite, Wrangler, D1/R2, ChatGPT authentication, `.openai/`,
      `worker/`, `build/`, database starter files, and related examples.
- [x] Simplify package scripts for standard Next.js development and static build.
- [x] Add `staticwebapp.config.json` to the exported site.
- [x] Replace the starter README with standalone development and deployment
      documentation.

### Build and deployment automation

- [x] Preserve the existing Azure-generated GitHub Actions workflow and configure
      it for app location `/`, no API, and static output location `out`.
- [x] Add a local Azure deployment helper that builds and deploys to the existing
      Static Web App using a deployment token supplied through the environment.
- [x] Ensure no deployment token or Azure credential is committed.

### Validation and delivery

- [x] Install from the clean lockfile and run the production static build.
- [x] Verify `out/index.html`, assets, metadata, and routing configuration.
- [x] Run Azure readiness validation.
- [x] Commit the complete portable source.
- [x] Push to GitHub `mpaliath/thisismaks.com` on `main`.
- [x] Monitor the existing GitHub Actions workflow until the commit is deployed
      successfully to `https://ashy-mushroom-07c568f10.7.azurestaticapps.net`.
- [x] Verify the Azure URL serves the new site.

### Explicitly out of scope

- No deployment or update to ChatGPT Sites.
- No ChatGPT Sites runtime, authentication, hosting metadata, or Cloudflare
  worker remains in the standalone source.
- No additional Azure Static Web App is created.

---

## 8. Files Expected to Change

| File or path | Purpose |
|--------------|---------|
| `next.config.ts` | Enable static export |
| `package.json`, `package-lock.json` | Remove platform-specific packages and add portable scripts |
| `public/staticwebapp.config.json` | Azure Static Web Apps routing and response headers |
| `.github/workflows/azure-static-web-apps-*.yml` | Existing Azure deployment workflow |
| `scripts/deploy-azure.sh` | Optional manual deployment helper |
| `README.md` | Standalone setup and deployment guide |
| `.gitignore` | Ignore static build and local secrets |

Platform-specific starter files will be removed only after their replacements
are in place.

---

## 9. Validation Proof

| Check | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| Clean dependency install | `npm ci` | Pass | 2026-07-25 |
| Static production build and rendered output tests | `npm test` | Pass: 2 tests | 2026-07-25 |
| Source lint | `npm run lint` | Pass | 2026-07-25 |
| Deployment script syntax | `bash -n scripts/build-static.sh scripts/deploy-azure.sh` | Pass | 2026-07-25 |
| GitHub Actions workflow syntax | Ruby YAML parse | Pass | 2026-07-25 |
| Patch formatting | `git diff --check` | Pass | 2026-07-25 |

RBAC verification: not applicable. The repository contains no infrastructure
templates, managed identities, APIs, data-plane operations, or role
assignments. The existing GitHub integration supplies its deployment token
through the Azure-created repository secret.

Validated by: azure-validate workflow

---

## 10. Current Phase

Deployment completed successfully through GitHub Actions run `30165124794`.
The Azure endpoint returned HTTP 200 and the deployed homepage content and
security headers were verified on 2026-07-25.

Live RBAC verification: not applicable. This deployment reuses the existing
Static Web Apps GitHub integration and has no managed identity or data-plane
role requirements.
