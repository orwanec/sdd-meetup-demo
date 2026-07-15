#!/usr/bin/env bash
# Sync local repo: fetch/prune, checkout main, pull, delete local branches with gone upstream.
set -euo pipefail

BASE_BRANCH="main"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --base)
      BASE_BRANCH="${2:?--base requires a branch name}"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: sync-repo.sh [--dry-run] [--base main|master]" >&2
      exit 1
      ;;
  esac
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository." >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Error: no origin remote configured." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree has uncommitted changes. Commit, stash, or discard before syncing." >&2
  git status --short
  exit 1
fi

echo "==> Fetching and pruning origin"
git fetch --prune origin

CURRENT="$(git branch --show-current)"
if [[ "$CURRENT" != "$BASE_BRANCH" ]]; then
  echo "==> Switching to $BASE_BRANCH (from $CURRENT)"
  git checkout "$BASE_BRANCH"
else
  echo "==> Already on $BASE_BRANCH"
fi

BEFORE="$(git rev-parse HEAD)"
git pull origin "$BASE_BRANCH"
AFTER="$(git rev-parse HEAD)"
if [[ "$BEFORE" != "$AFTER" ]]; then
  echo "==> Updated $BASE_BRANCH: $BEFORE -> $AFTER"
else
  echo "==> $BASE_BRANCH already up to date with origin"
fi

mapfile -t GONE_BRANCHES < <(git branch -vv | grep ': gone]' | awk '{print $1}' | sed 's/^[* ] //' || true)

if [[ ${#GONE_BRANCHES[@]} -eq 0 ]]; then
  echo "==> No local branches with deleted upstream"
else
  echo "==> Local branches with gone upstream: ${GONE_BRANCHES[*]}"
  for branch in "${GONE_BRANCHES[@]}"; do
    if [[ "$branch" == "$BASE_BRANCH" || "$branch" == "master" ]]; then
      echo "    Skipped protected branch: $branch"
      continue
    fi
    if [[ "$DRY_RUN" == true ]]; then
      echo "    [dry-run] would delete: $branch"
      continue
    fi
    if git branch -d "$branch"; then
      echo "    Deleted: $branch"
    else
      echo "    Skipped $branch (not fully merged; delete manually with git branch -D if intended)" >&2
    fi
  done
fi

echo ""
echo "==> Done. Current branch: $(git branch --show-current)"
echo "==> Local branches:"
git branch
