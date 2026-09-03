#!/bin/bash
# CI check: Verify crawler-UA regex has not regressed with known drift issues
# Prevents: instagram (extra), zyborgi (typo), hubspot crawler, screaming frog seo spider, sebot-wa (extras)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANONICAL_FILE="$REPO_ROOT/docs/prerendering/shared/crawler-ua-regex.md"

if [ ! -f "$CANONICAL_FILE" ]; then
  echo "ERROR: Could not find $CANONICAL_FILE"
  exit 1
fi

FAILURES=0
CHECKED=0

# Check for known drift issues
check_file_for_drift() {
  local file="$1"

  if ! grep -q "ahrefsbot" "$file" 2>/dev/null; then
    # File doesn't contain crawler regex, skip
    return 0
  fi

  CHECKED=$((CHECKED + 1))
  local has_drift=0

  # DRIFT ISSUE #1: 'instagram' term that shouldn't be in canonical
  # This appeared in Apache, Nginx, Caddy templates in ostrio-agent-skills
  if grep -q "|instagram|" "$file" 2>/dev/null || grep -q "'instagram'" "$file" 2>/dev/null; then
    echo "FAIL: $file - contains 'instagram' which is NOT in canonical crawler regex"
    has_drift=1
  fi

  # DRIFT ISSUE #2: 'zyborgi' typo (should be 'zyborg')
  # This appeared in Apache, Nginx, Caddy templates in ostrio-agent-skills
  if grep -q "zyborgi" "$file" 2>/dev/null; then
    echo "FAIL: $file - contains 'zyborgi' typo, should be 'zyborg'"
    has_drift=1
  fi

  # DRIFT ISSUE #3: 'hubspot\ crawler' extra in ostrio-agent-skills templates
  # This is extra and should not be there
  if grep -q "hubspot.*crawler" "$file" 2>/dev/null && [ "${file##*agent-skills*}" != "$file" ]; then
    echo "FAIL: $file - contains 'hubspot crawler' which is NOT in canonical"
    has_drift=1
  fi

  # DRIFT ISSUE #4: 'screaming\ frog\ seo\ spider' extra in ostrio-agent-skills templates
  # This is extra in cloudflare.worker.js, nextjs-middleware.ts, supabase-shared.ts
  if [ "${file##*agent-skills*templates/(cloudflare|nextjs|supabase)*}" != "$file" ]; then
    if grep -q "screaming.*frog.*seo.*spider" "$file" 2>/dev/null; then
      echo "FAIL: $file - contains 'screaming frog seo spider' which is NOT in canonical"
      has_drift=1
    fi
  fi

  # DRIFT ISSUE #5: 'sebot\-wa' extra in ostrio-agent-skills templates
  if grep -q "sebot.*-wa" "$file" 2>/dev/null && [ "${file##*agent-skills*}" != "$file" ]; then
    echo "FAIL: $file - contains 'sebot-wa' which is NOT in canonical"
    has_drift=1
  fi

  if [ $has_drift -eq 0 ]; then
    echo "PASS: $file"
  fi

  return $has_drift
}

echo "Checking crawler-UA regex for known drift issues..."
echo ""

# Check all files that might contain the crawler regex in boris_git
cd "$REPO_ROOT"
for file in $(find docs -type f \( -name "*.md" -o -name "*.conf" -o -name "*.htaccess" -o -name "*.caddyfile" -o -name "*.worker.js" -o -name "*.js" \) 2>/dev/null | grep prerendering); do
  check_file_for_drift "$file" || FAILURES=$((FAILURES + 1))
done

# Also check agent-skills templates if accessible
if [ -d "../ostrio-agent-skills/skills/ostrio-prerendering/templates" ]; then
  for file in ../ostrio-agent-skills/skills/ostrio-prerendering/templates/*; do
    if [ -f "$file" ]; then
      check_file_for_drift "$file" || FAILURES=$((FAILURES + 1))
    fi
  done
fi

echo ""
echo "========================================="
echo "Checked $CHECKED files with crawler regex"
echo "Failures: $FAILURES"
echo "========================================="

if [ $FAILURES -gt 0 ]; then
  echo ""
  echo "ERROR: Crawler-UA regex drift detected!"
  echo "Please review fixes and reconcile with:"
  echo "  $CANONICAL_FILE"
  exit 1
else
  echo ""
  echo "SUCCESS: No known drift issues detected"
  exit 0
fi
