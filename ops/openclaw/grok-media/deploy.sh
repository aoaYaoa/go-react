#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSH_HOST="${SSH_HOST:-root@194.127.193.199}"
SSH_PORT="${SSH_PORT:-2222}"
CONTAINER_NAME="${CONTAINER_NAME:-1Panel-openclaw-HftU}"
REMOTE_DIR="${REMOTE_DIR:-/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media}"
REMOTE_INDEX="$REMOTE_DIR/index.ts"
REMOTE_MANIFEST="$REMOTE_DIR/openclaw.plugin.json"
LOCAL_INDEX="$SCRIPT_DIR/index.ts"
LOCAL_MANIFEST="$SCRIPT_DIR/openclaw.plugin.json"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

for file in "$LOCAL_INDEX" "$LOCAL_MANIFEST"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

run_remote() {
  ssh -p "$SSH_PORT" "$SSH_HOST" "$@"
}

print_plan() {
  cat <<PLAN
Deploy plan:
- upload $LOCAL_INDEX -> $REMOTE_INDEX
- upload $LOCAL_MANIFEST -> $REMOTE_MANIFEST
- backup remote files under $REMOTE_DIR/*.bak-<timestamp>
- docker restart $CONTAINER_NAME
- docker logs --since 20s $CONTAINER_NAME
PLAN
}

if [[ "$DRY_RUN" == "1" ]]; then
  print_plan
  exit 0
fi

print_plan

timestamp="$(date +%Y%m%d-%H%M%S)"
run_remote "mkdir -p '$REMOTE_DIR' && if [ -f '$REMOTE_INDEX' ]; then cp '$REMOTE_INDEX' '$REMOTE_INDEX.bak-$timestamp'; fi && if [ -f '$REMOTE_MANIFEST' ]; then cp '$REMOTE_MANIFEST' '$REMOTE_MANIFEST.bak-$timestamp'; fi"
run_remote "cat > '$REMOTE_INDEX'" < "$LOCAL_INDEX"
run_remote "cat > '$REMOTE_MANIFEST'" < "$LOCAL_MANIFEST"
run_remote "docker restart '$CONTAINER_NAME' >/dev/null && sleep 4 && docker logs --since 20s '$CONTAINER_NAME' 2>&1 | tail -n 120"
