#!/usr/bin/env bash
# Uso: scripts/kanban-status.sh <numero-issue> "Todo|In Progress|Done"
set -e
OWNER=Batalha-Dev; P=2
PID=$(gh project view $P --owner $OWNER --format json --jq .id)
FIELD=$(gh project field-list $P --owner $OWNER --format json --jq '.fields[]|select(.name=="Status")')
FID=$(echo "$FIELD" | python -c "import sys,json;print(json.load(sys.stdin)['id'])")
OID=$(echo "$FIELD" | python -c "import sys,json;d=json.load(sys.stdin);print([o['id'] for o in d['options'] if o['name']==sys.argv[1]][0])" "$2")
IID=$(gh project item-list $P --owner $OWNER --format json --limit 100 | python -c "import sys,json;print([i['id'] for i in json.load(sys.stdin)['items'] if i['content'].get('number')==int(sys.argv[1])][0])" "$1")
gh project item-edit --id "$IID" --project-id "$PID" --field-id "$FID" --single-select-option-id "$OID" >/dev/null
echo "issue #$1 -> $2"
