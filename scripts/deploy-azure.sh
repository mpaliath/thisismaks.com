#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ -z "${AZURE_STATIC_WEB_APPS_API_TOKEN:-}" ]]; then
  echo "AZURE_STATIC_WEB_APPS_API_TOKEN is required." >&2
  echo "Retrieve it from the Azure portal or with: az staticwebapp secrets list --name ThisIsMaks --resource-group Personal_group --query properties.apiKey -o tsv" >&2
  exit 1
fi

"$repo_root/scripts/build-static.sh"

npx --yes @azure/static-web-apps-cli deploy "$repo_root/out" \
  --deployment-token "$AZURE_STATIC_WEB_APPS_API_TOKEN" \
  --env production
