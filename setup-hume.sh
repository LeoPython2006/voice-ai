#!/usr/bin/env bash
# setup-hume.sh – bootstrap env vars, verify, and start dev server
set -euo pipefail

############## helpers ########################################################
usage() {
  cat <<EOF
Usage: $0 [--api-key KEY] [--secret-key KEY] [--start]

  --api-key       Hume public API key (pk_…)
  --secret-key    Hume secret key (sk_…)
  --start         Launch 'pnpm dev' after verifying credentials
  -h, --help      Show this help
EOF
  exit 1
}

need() { command -v "$1" >/dev/null 2>&1 || missing+="$1 "; }

install_pnpm() {
  echo "› Installing pnpm globally with corepack"
  corepack enable
  corepack prepare pnpm@latest --activate
}

install_jq() {
  echo "✖ jq not found – please install it (e.g. 'brew install jq' or 'apt-get install jq')"
  exit 1
}

write_env() {
  local file="$1"
  # preserve any other existing vars, replace or append ours
  grep -vE '^(HUME_API_KEY|HUME_SECRET_KEY)=' "$file" 2>/dev/null || true >"$file.tmp"
  {
    [ -n "${HUME_API_KEY-}" ]   && echo "HUME_API_KEY=$HUME_API_KEY"
    [ -n "${HUME_SECRET_KEY-}" ] && echo "HUME_SECRET_KEY=$HUME_SECRET_KEY"
  } >>"$file.tmp"
  mv "$file.tmp" "$file"
  echo "› Wrote credentials to $file"
}

verify_keys() {
  local resp token
  printf "› Verifying keys with Hume… "
  resp=$(curl -sS -u "$HUME_API_KEY:$HUME_SECRET_KEY" \
                -d grant_type=client_credentials \
                https://api.hume.ai/oauth2-cc/token) || {
                  echo "curl failed"; printf '%s\n' "$resp"; exit 1; }
  token=$(echo "$resp" | jq -r '.access_token // empty') || {
    echo; echo "jq parse failed – is jq installed?"; exit 1; }
  if [[ -z $token ]]; then
    echo "FAILED"
    echo "$resp" | jq .
    exit 1
  fi
  echo "OK"
}

###############################################################################
# 1 ─ Parse CLI args
###############################################################################
START_DEV=false
missing=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --api-key)     HUME_API_KEY="$2"; shift 2 ;;
    --secret-key)  HUME_SECRET_KEY="$2"; shift 2 ;;
    --start)       START_DEV=true; shift ;;
    -h|--help)     usage ;;
    *) echo "Unknown flag: $1"; usage ;;
  esac
done

###############################################################################
# 2 ─ Collect credentials interactively if still unset
###############################################################################
if [[ -z "${HUME_API_KEY-}" ]]; then
  read -rp "Enter HUME_API_KEY (pk_…): " HUME_API_KEY
fi
if [[ -z "${HUME_SECRET_KEY-}" ]]; then
  read -rsp "Enter HUME_SECRET_KEY (sk_…): " HUME_SECRET_KEY
  echo
fi

###############################################################################
# 3 ─ Ensure toolchain
###############################################################################
need pnpm
need jq
need curl

[[ -n $missing ]] && {
  [[ $missing == *pnpm* ]] && install_pnpm
  [[ $missing == *jq*   ]] && install_jq
}

###############################################################################
# 4 ─ Write .env.local
###############################################################################
ENV_FILE=".env.local"
write_env "$ENV_FILE"

###############################################################################
# 5 ─ Verify keys via OAuth2 call
###############################################################################
###############################################################################
# 5 ─ Verify keys via OAuth2 call (better diagnostics)
###############################################################################
verify_keys() {
  printf "› Verifying keys with Hume… "

  # Capture body *and* status code
  read -r -d '' body status < <(
    curl -sS -w '\n%{http_code}' \
      -u "$HUME_API_KEY:$HUME_SECRET_KEY" \
      -d grant_type=client_credentials \
      https://api.hume.ai/oauth2-cc/token
  )

  if [[ $status != 200 ]]; then
    echo "FAILED (HTTP $status)"
    printf '--- response body (first 20 lines) ---\n'
    printf '%s\n' "$body" | head -n 20
    exit 1
  fi

  if ! token=$(printf '%s' "$body" | jq -er '.access_token'); then
    echo "FAILED – payload wasn’t valid JSON:"
    printf '%s\n' "$body"
    exit 1
  fi

  echo "OK – token received"
}


###############################################################################
# 6 ─ Optionally start dev server
###############################################################################
if $START_DEV; then
  echo "› Starting Next.js dev server (pnpm dev)…"
  exec pnpm dev
else
  echo "✓ Setup complete – restart your dev server (pnpm dev) when ready."
fi
