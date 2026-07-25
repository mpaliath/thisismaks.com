#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build

test -f out/index.html
test -f out/staticwebapp.config.json

echo "Static site ready in $repo_root/out"
