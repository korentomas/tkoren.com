#!/usr/bin/env bash
# Rebuild the resume PDF from resume.json, publish it to the site, commit, and push.
# Usage: scripts/publish-resume.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RES="$ROOT/content/korenblit-resume/content"
DATE="$(date +%d-%m-%Y)"
DEST="/resume/$DATE.pdf"

echo "Building resume from resume.json ..."
cd "$RES"
node build_tex.cjs
pdflatex -interaction=nonstopmode korenblit-resume.tex >/dev/null
pdflatex -interaction=nonstopmode korenblit-resume.tex >/dev/null
pages="$(pdfinfo korenblit-resume.pdf | awk '/Pages/{print $2}')"
echo "Built ${pages} page(s)."

echo "Publishing to public${DEST} ..."
cp "$RES/korenblit-resume.pdf" "$ROOT/public/resume/${DATE}.pdf"

# Point the site at the new PDF (BSD/macOS sed).
sed -i '' 's#"resumeUrl": "[^"]*"#"resumeUrl": "'"${DEST}"'"#' "$ROOT/content/site.json"

cd "$ROOT"
git add -A
if git diff --cached --quiet; then
  echo "Nothing changed; nothing to push."
  exit 0
fi
git commit -m "Republish resume (${DATE})"
git push origin main
echo "Done. Live CV points at ${DEST}"
