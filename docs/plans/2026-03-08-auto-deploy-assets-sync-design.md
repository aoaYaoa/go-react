# Auto Deploy Assets Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Check the verified VPS auto-deploy systemd assets into the repository and remove stale deploy hooks from the retired server.

**Architecture:** Reuse the already working deploy script and systemd unit from the active Netcup server as the single source of truth, store them under a dedicated `deploy/systemd` path, and update the deployment documentation to match the actual GitHub Actions secret precedence and server target. Clean up the retired server by removing the obsolete `go-react-boot-update` unit so future failures cannot be misattributed.

**Tech Stack:** Bash, systemd, GitHub Actions, Markdown documentation, SSH

---

### Task 1: Capture deploy assets in the repo

**Files:**
- Create: `deploy/systemd/go-react-boot-update/go-react-boot-update.sh`
- Create: `deploy/systemd/go-react-boot-update/go-react-boot-update.service`

**Step 1: Copy the verified script from the active server**

Use the current `/usr/local/bin/go-react-boot-update.sh` from `152.53.141.194` as the canonical content.

**Step 2: Copy the verified systemd unit from the active server**

Use the current `/etc/systemd/system/go-react-boot-update.service` from `152.53.141.194` as the canonical content.

**Step 3: Ensure paths and comments are production-safe**

Keep the script ASCII-only, retain the health-check wait loop, and avoid any machine-specific secrets.

**Step 4: Verify repository diff**

Run: `git diff -- deploy/systemd/go-react-boot-update`
Expected: only the new deploy assets appear.

### Task 2: Update deployment documentation

**Files:**
- Modify: `docs/backend/docs/GITHUB_AUTO_DEPLOY.md`

**Step 1: Update examples to the active server**

Document `152.53.141.194`, `admin`, and port `22` as the current deployment target example.

**Step 2: Document secret precedence**

Explain that `VPS_SSH_KEY_B64` is preferred when set, otherwise `VPS_SSH_KEY` is used.

**Step 3: Document first-time server bootstrap**

Point to the checked-in `deploy/systemd/go-react-boot-update/` assets and state that they must be installed on any new server before GitHub auto-deploy can work.

**Step 4: Verify rendered diff**

Run: `git diff -- docs/backend/docs/GITHUB_AUTO_DEPLOY.md`
Expected: examples and setup instructions match the real deployment path.

### Task 3: Remove stale deploy unit from the retired server

**Files:**
- Remote delete: `194.127.193.199:/etc/systemd/system/go-react-boot-update.service`
- Remote delete: `194.127.193.199:/usr/local/bin/go-react-boot-update.sh`

**Step 1: Stop and disable the old unit if present**

Run via SSH on the old server with `systemctl stop/disable` guarded by `|| true`.

**Step 2: Remove the unit and script**

Delete the files, reload systemd, and reset failed state.

**Step 3: Verify absence**

Run: `systemctl status go-react-boot-update.service`
Expected: `Unit go-react-boot-update.service could not be found.`

### Task 4: Final verification

**Files:**
- Verify: `.github/workflows/ci.yml`
- Verify: `deploy/systemd/go-react-boot-update/*`
- Verify: `docs/backend/docs/GITHUB_AUTO_DEPLOY.md`

**Step 1: Confirm the active server still serves health checks**

Run: `curl -sS http://127.0.0.1:8080/api/health` on `152.53.141.194`.

**Step 2: Confirm the active server commit remains the latest deploy trigger**

Run: `git rev-parse --short HEAD` in `/opt/apps/go-react` on `152.53.141.194`.

**Step 3: Confirm repo working tree content**

Run: `git status --short`
Expected: only intended local modifications remain before commit.
