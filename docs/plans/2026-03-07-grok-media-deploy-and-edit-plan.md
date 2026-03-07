# Grok Media Deploy And Edit Verification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a local one-command deployment script for the `grok-media` OpenClaw plugin and add a reusable real `/edit` verification script.

**Architecture:** Keep all operational artifacts under `ops/openclaw/grok-media/`. The deploy path will be a local shell script that uploads the repo-managed plugin files to the OpenClaw server, restarts the container, and prints recent logs. Real `/edit` verification will live in a separate Node script that runs on the server so it uses the deployed OpenClaw/grok2api environment directly.

**Tech Stack:** Bash, SSH, Node 22 ESM, OpenClaw plugin runtime, Telegram bot delivery, Node built-in `node:test` for smoke coverage.

---

### Task 1: Add a failing deploy-script test

**Files:**
- Modify: `ops/openclaw/grok-media/test.mjs`
- Create: `ops/openclaw/grok-media/deploy.sh`
- Test: `node ops/openclaw/grok-media/test.mjs`

**Step 1: Write the failing test**
Add a test that executes `deploy.sh --dry-run` and asserts it prints the expected server target paths, restart step, and log step.

**Step 2: Run test to verify it fails**
Run: `node ops/openclaw/grok-media/test.mjs`
Expected: FAIL because `deploy.sh` does not exist yet.

**Step 3: Write minimal implementation**
Create `deploy.sh` with default server settings for `root@194.127.193.199:2222`, support `--dry-run`, upload `index.ts` and `openclaw.plugin.json`, restart `1Panel-openclaw-HftU`, and tail logs.

**Step 4: Run test to verify it passes**
Run: `node ops/openclaw/grok-media/test.mjs`
Expected: PASS.

### Task 2: Add reusable /edit real-verification script

**Files:**
- Create: `ops/openclaw/grok-media/verify-edit-server.mjs`
- Modify: `ops/openclaw/grok-media/README.md`

**Step 1: Create the verification script**
Write a Node ESM script intended to run on the server. It should load the deployed `grok-media` plugin file, submit one real `handleEdit(...)` request with a valid remote image URL, and send the result to the configured Telegram chat using the server bot token.

**Step 2: Keep output machine-readable**
Print staged JSON logs including start, result, and sent message info so runs are easy to inspect.

**Step 3: Document how to run it**
Add exact commands to upload and execute the script remotely.

### Task 3: Verify end to end

**Files:**
- Test: `node ops/openclaw/grok-media/test.mjs`
- Verify: server OpenClaw/grok2api runtime

**Step 1: Run repo smoke tests**
Run: `node ops/openclaw/grok-media/test.mjs`
Expected: PASS.

**Step 2: Run real /edit verification**
Upload `verify-edit-server.mjs` to the server and execute it there.
Expected: Telegram receives an edit-result push and console output includes the edited media URL.
