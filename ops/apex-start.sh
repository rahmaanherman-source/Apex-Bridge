#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
printf '\nAPEX START — %s\n' "$(basename "$ROOT")"
if [[ -f .env.local ]]; then set -a; source .env.local; set +a; elif [[ -f .env ]]; then set -a; source .env; set +a; fi
[[ -f ops/apex-guard.sh ]] && bash ops/apex-guard.sh
if [[ -f package.json ]]; then command -v node >/dev/null && command -v npm >/dev/null || { echo 'ERROR: Node.js + npm required.' >&2; exit 1; }; [[ -d node_modules ]] || { [[ -f package-lock.json ]] && npm ci || npm install; }; if node -e 'const p=require("./package.json"); process.exit(p.scripts?.dev ? 0 : 1)' 2>/dev/null; then exec npm run dev; fi; if node -e 'const p=require("./package.json"); process.exit(p.scripts?.start ? 0 : 1)' 2>/dev/null; then exec npm start; fi; fi
[[ -n "${APEX_START_CMD:-}" ]] && exec bash -lc "$APEX_START_CMD"
echo 'No startup contract found. Set APEX_START_CMD="your command".' >&2; exit 1
