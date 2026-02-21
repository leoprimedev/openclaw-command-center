#!/usr/bin/env bash
# push-default-layout.sh
# Pushes a sensible default canvas layout to the Leo Command Center.
# Run after the server is up: ./push-default-layout.sh [BASE_URL]

set -euo pipefail

BASE="${1:-http://localhost:3200}"
API="$BASE/api/canvas/render"

echo "Pushing default layout to $API …"

push() {
  local id="$1"
  local payload="$2"
  curl -sf -X POST "$API" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  ✓ {d.get(\"id\",\"?\")}')"
}

# Row 1: Leo status + Ollama monitor
push "leo-status" '{"id":"leo-status","component":"LeoStatus","props":{}}'
push "ollama"     '{"id":"ollama","component":"OllamaMonitor","props":{}}'

# Row 2: System health + Cost meter
push "sys-health" '{"id":"sys-health","component":"SystemHealth","props":{}}'
push "cost"       '{"id":"cost","component":"CostMeter","props":{}}'

# Row 3: Clock + Gateway log
push "clock"      '{"id":"clock","component":"Clock","props":{"timezone":"America/New_York"}}'
push "gwlog"      '{"id":"gwlog","component":"GatewayLog","props":{"limit":8}}'

echo "Done. Open $BASE in your browser."
