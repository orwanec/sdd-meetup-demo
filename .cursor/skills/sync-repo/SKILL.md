---
name: sync-repo
description: >-
  Sync local git repo with remote: fetch and prune, switch to main, pull latest,
  and delete local branches whose upstream was removed on origin. Use when the
  user asks to update the repo, pull latest main, sync with remote, or clean up
  stale local branches after remote branch deletion.
disable-model-invocation: true
---

# Sync Repo

Keep the local clone aligned with `origin` after merged PRs delete remote branches.

## Invoke

Run explicitly via slash command:

```
/sync-repo
```

Also available in the `/` menu as **sync-repo**. Do not auto-invoke from ambient context.

## When to use

- User runs `/sync-repo`
- User asks to "update the repo", "pull latest", or "sync with remote"
- User wants local branches removed after they were deleted on GitHub
- Starting a new task and the working tree should be on current `main`

## Workflow

Run steps in order. Use [scripts/sync-repo.sh](scripts/sync-repo.sh) when a single command is enough; otherwise run the shell commands below.

```
Task progress:
- [ ] Step 1: Fetch and prune stale remote-tracking refs
- [ ] Step 2: Switch to main and pull
- [ ] Step 3: Delete local branches whose upstream is gone
- [ ] Step 4: Report final state
```

### Step 1: Fetch and prune

```bash
git fetch --prune origin
```

### Step 2: Switch to main and pull

Default branch is `main`. If the repo uses `master`, substitute accordingly.

```bash
git checkout main
git pull origin main
```

**Stop if the working tree is dirty** — report uncommitted changes and ask whether to stash, commit, or abort before switching branches.

### Step 3: Delete local branches with gone upstream

Only remove local branches whose upstream was deleted on the remote (`[gone]` in `git branch -vv`). Never delete `main`, `master`, or the current branch.

```bash
git branch -vv | grep ': gone]' | awk '{print $1}' | while read -r branch; do
  git branch -d "$branch" || echo "Skipped $branch (not fully merged; use git branch -D manually if intended)"
done
```

Prefer `-d` (safe delete). Do not use `-D` unless the user explicitly asks to force-delete unmerged branches.

### Step 4: Report

Summarize for the user:

- Current branch and whether it matches `origin/main`
- Commits pulled (if any)
- Local branches deleted (names)
- Branches skipped (with reason)
- Remaining local branches (`git branch`)

## Script

From the repository root:

```bash
bash .cursor/skills/sync-repo/scripts/sync-repo.sh
```

Optional flags:

- `--dry-run` — show branches that would be deleted without deleting
- `--base master` — use `master` instead of `main`

## Edge cases

| Situation | Action |
|-----------|--------|
| Dirty working tree | Stop before checkout; ask user |
| Branch delete fails (`-d`) | Report branch name; do not force-delete |
| No `origin` remote | Report error; stop |
| Already on `main` and up to date | Still run fetch/prune and gone-branch cleanup |

## Example

**User:** "pull the latest changes to main and delete unnecessary branches"

**Agent:**

1. Run `bash .cursor/skills/sync-repo/scripts/sync-repo.sh`
2. Report: pulled 2 commits, deleted `chore/sdd-workflow-planning-gate`, now on `main` with only `main` remaining locally
