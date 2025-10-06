#!/usr/bin/env bash
set -Eeuo pipefail

# Auto-Deploy Full Automation with Retry (GPT-5 Edition)
# - Creates/merges PR for a deployment branch
# - Triggers workflow autodeploy.yml
# - Polls status with retries
# - Sends Slack notification if SLACK_WEBHOOK_URL is set

# -----------------------------
# Configuration (overridable via env)
# -----------------------------
REPO="${REPO:-alzaem2002-ctrl/nursery-management-system-dari-alhanonah-system}"
BASE_BRANCH="${BASE_BRANCH:-main}"
BRANCH="${BRANCH:-ci/refactor-autodeploy}"
TITLE="${TITLE:-ci: refactor autodeploy.yml for simplified and stable deployment}"
BODY="${BODY:-Refactored autodeploy.yml for stable auto deployment}"
WORKFLOW_FILE="${WORKFLOW_FILE:-autodeploy.yml}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
SLEEP_SECONDS="${SLEEP_SECONDS:-20}"

# -----------------------------
# Helpers
# -----------------------------
log() {
  printf "%s\n" "$*"
}

warn() {
  printf "⚠️  %s\n" "$*" >&2
}

err() {
  printf "❌ %s\n" "$*" >&2
}

ok() {
  printf "✅ %s\n" "$*"
}

info() {
  printf "ℹ️  %s\n" "$*"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Ensure we are at a git repo root containing the workflow
ensure_repo_state() {
  if [ ! -d .git ]; then
    err "Not inside a git repository. Please run from your repo root."
    exit 1
  fi
  if [ ! -f ".github/workflows/${WORKFLOW_FILE}" ]; then
    err "File .github/workflows/${WORKFLOW_FILE} not found."
    exit 1
  fi
}

# Ensure gh CLI exists
ensure_gh() {
  if command_exists gh; then
    return 0
  fi
  warn "GitHub CLI (gh) is not installed."
  # Best-effort hints; do not auto-install to avoid privilege prompts
  cat >&2 <<'EOF'
Please install GitHub CLI (gh) and re-run:
- Ubuntu/Debian:  sudo apt update && sudo apt install -y gh
- Fedora/CentOS:  sudo dnf install -y gh   OR   sudo yum install -y gh
- Arch:           sudo pacman -S gh
- macOS (Homebrew): brew install gh
Docs: https://cli.github.com/manual/installation
EOF
  exit 127
}

# Obtain token (repo scope). Prefer env; otherwise prompt securely
ensure_token() {
  # Prefer existing environment variables
  if [ -n "${GH_TOKEN:-}" ]; then
    TOKEN="$GH_TOKEN"
  elif [ -n "${GITHUB_TOKEN:-}" ]; then
    TOKEN="$GITHUB_TOKEN"
  elif [ -n "${GITHUB_PAT:-}" ]; then
    TOKEN="$GITHUB_PAT"
  else
    # Prompt user
    read -rsp "🔐 أدخل الـ GitHub Token (repo scope): " TOKEN
    echo
  fi

  if [ -z "${TOKEN:-}" ]; then
    err "لم يتم إدخال التوكن. تم الإنهاء."
    exit 1
  fi

  export GH_TOKEN="$TOKEN"
  export GITHUB_TOKEN="$TOKEN"
  export GITHUB_PAT="$TOKEN"
}

# Create PR if needed and return PR number via stdout
get_or_create_pr_number() {
  local pr_number
  set +e
  GH_TOKEN="$TOKEN" gh pr create \
    --repo "$REPO" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH" \
    --title "$TITLE" \
    --body "$BODY"
  local create_exit=$?
  set -e
  if [ $create_exit -ne 0 ]; then
    info "الـ PR موجود مسبقًا — نكمل."
  fi

  # Retrieve PR number for the head branch
  if pr_number=$(GH_TOKEN="$TOKEN" gh pr view --repo "$REPO" --head "$BRANCH" --json number -q '.number' 2>/dev/null); then
    if [ -n "$pr_number" ]; then
      printf "%s" "$pr_number"
      return 0
    fi
  fi

  # Fallback to list/search
  if pr_number=$(GH_TOKEN="$TOKEN" gh pr list --repo "$REPO" --search "head:$BRANCH base:$BASE_BRANCH" --json number -q '.[0].number' 2>/dev/null); then
    if [ -n "$pr_number" ]; then
      printf "%s" "$pr_number"
      return 0
    fi
  fi

  err "Could not determine PR number for head '$BRANCH'."
  exit 1
}

merge_pr_auto() {
  local pr_number="$1"
  set +e
  GH_TOKEN="$TOKEN" gh pr merge --repo "$REPO" "$pr_number" --auto --squash
  local merge_exit=$?
  set -e
  if [ $merge_exit -ne 0 ]; then
    info "تم الدمج مسبقًا أو ليس ضروريًا."
  fi
}

trigger_workflow() {
  GH_TOKEN="$TOKEN" gh workflow run "$WORKFLOW_FILE" --repo "$REPO"
}

# Read latest run JSON for our workflow
get_latest_run_json() {
  GH_TOKEN="$TOKEN" gh run list \
    --repo "$REPO" \
    --workflow "$WORKFLOW_FILE" \
    --limit 1 \
    --json status,conclusion,htmlUrl,headBranch,displayTitle,createdAt
}

# Parse field from a small one-item JSON array without jq
# Usage: parse_field "$json" status
parse_field() {
  local json="$1" key="$2"
  # This is a simple heuristic since we use --limit 1
  printf '%s' "$json" | sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -n1
}

poll_workflow_until_complete() {
  local attempt=1
  local status="in_progress"
  local conclusion=""
  local url=""

  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    log "⏳ المحاولة $attempt من $MAX_ATTEMPTS..."
    sleep "$SLEEP_SECONDS"

    local json
    if ! json=$(get_latest_run_json); then
      warn "Failed to get workflow run list. Retrying..."
      attempt=$((attempt+1))
      continue
    fi

    status=$(parse_field "$json" status)
    conclusion=$(parse_field "$json" conclusion)
    url=$(parse_field "$json" htmlUrl)

    log "📊 الحالة الحالية: ${status}${conclusion:+ ($conclusion)}"

    if [ "$status" = "completed" ]; then
      if [ "${conclusion:-}" = "success" ]; then
        ok "اكتملت العملية بنجاح!"
        printf "%s\n%s\n" "$status" "$url"
        return 0
      else
        warn "Workflow completed with conclusion: ${conclusion:-unknown}."
        # If we still have attempts left, re-run
        if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
          warn "إعادة تشغيل workflow..."
          trigger_workflow || warn "Failed to trigger workflow rerun."
          attempt=$((attempt+1))
          continue
        else
          err "فشل النشر بعد $MAX_ATTEMPTS محاولات."
          printf "%s\n%s\n" "$status" "$url"
          return 1
        fi
      fi
    else
      # still in_progress/queued etc.
      if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
        attempt=$((attempt+1))
        continue
      fi
      # last attempt, try one more explicit trigger
      warn "لم تكتمل بعد — إعادة تشغيل workflow..."
      trigger_workflow || warn "Failed to trigger workflow rerun."
      attempt=$((attempt+1))
    fi
  done

  # If we exit the loop naturally, treat as failure
  err "Reached maximum attempts without successful completion."
  printf "%s\n%s\n" "unknown" "${url:-}"
  return 1
}

notify_slack() {
  local final_status="$1" final_url="$2" final_conclusion="$3"
  if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
    return 0
  fi
  local emoji="✅"
  if [ "$final_status" != "completed" ] || [ "${final_conclusion:-}" != "success" ]; then
    emoji="❌"
  fi
  local text
  text="${emoji} *Auto Deploy Status:* ${final_status} ${final_conclusion:+($final_conclusion)}\n🔗 ${final_url:-N/A}"
  curl -sS -X POST -H "Content-type: application/json" \
    --data "{\"text\": \"${text//\"/\\\"}\"}" \
    "$SLACK_WEBHOOK_URL" >/dev/null && info "📢 تم إرسال إشعار إلى Slack."
}

maybe_open_url() {
  local url="$1"
  if [ -z "$url" ]; then
    warn "لم يتم العثور على رابط الـ Workflow."
    return 0
  fi
  log "🔗 رابط الـ Workflow: $url"
  if command_exists open; then
    open "$url" || true
  elif command_exists xdg-open; then
    xdg-open "$url" || true
  fi
}

main() {
  log "🚀 بدء عملية النشر التلقائي الذكي..."
  ensure_repo_state
  ensure_gh
  ensure_token

  # Create PR (idempotent) and auto-merge
  pr_number=$(get_or_create_pr_number)
  info "PR number: #$pr_number"
  merge_pr_auto "$pr_number"

  # Trigger workflow, then poll
  trigger_workflow
  status_and_url=$(poll_workflow_until_complete || true)

  # Extract final status and URL from the poll function output
  final_status=$(printf "%s" "$status_and_url" | sed -n '1p')
  final_url=$(printf "%s" "$status_and_url" | sed -n '2p')

  # Best-effort fetch of final conclusion for Slack display
  final_conclusion=""
  if json=$(get_latest_run_json 2>/dev/null); then
    final_conclusion=$(parse_field "$json" conclusion || true)
    [ -z "$final_url" ] && final_url=$(parse_field "$json" htmlUrl || true)
    [ -z "$final_status" ] && final_status=$(parse_field "$json" status || true)
  fi

  notify_slack "$final_status" "$final_url" "$final_conclusion"
  maybe_open_url "$final_url"

  log "🏁 انتهى التنفيذ — الحالة النهائية: ${final_status:-unknown}${final_conclusion:+ ($final_conclusion)}"
}

main "$@"
