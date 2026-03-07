# Grok Media Push Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `grok-media` proactive video result delivery into a generic push layer and improve outbound Telegram result text.

**Architecture:** Keep video task polling in the plugin, but move all proactive delivery into a normalized dispatcher that routes by channel. Telegram remains the only active adapter today, while the generic interface keeps future channel additions isolated from polling logic.

**Tech Stack:** Node 22 ESM plugin module, OpenClaw plugin runtime channel APIs, local Node smoke tests, server-side OpenClaw extension deployment.

---

### Task 1: Extend the smoke harness for generic push delivery

**Files:**
- Modify: `/tmp/openclaw-grok-media/test.mjs`

**Step 1: Write the failing test**
Add a test that starts a `/video` command, simulates an SSE completion, and asserts Telegram proactive delivery is invoked through runtime channel APIs with improved success text.

**Step 2: Run test to verify it fails**
Run: `node /tmp/openclaw-grok-media/test.mjs`
Expected: FAIL because generic push dispatch and improved formatting do not exist yet.

**Step 3: Keep existing tests green in scope**
Do not remove fallback or cached-media tests.

### Task 2: Implement generic push helpers

**Files:**
- Modify: `/tmp/openclaw-grok-media/index.mjs`

**Step 1: Add normalized push payload helpers**
Create helpers for prompt trimming, success/failure text formatting, and route extraction.

**Step 2: Add dispatcher**
Implement `pushMediaResult(runtime, taskRecord, payload)` and `pushTelegramResult(...)`.

**Step 3: Integrate with video task lifecycle**
Trigger proactive push on successful video completion and on terminal failure.

**Step 4: Keep unsupported channels safe**
Unsupported channels must no-op without throwing.

### Task 3: Verify tests pass

**Files:**
- Test: `/tmp/openclaw-grok-media/test.mjs`

**Step 1: Run the smoke suite**
Run: `node /tmp/openclaw-grok-media/test.mjs`
Expected: PASS.

### Task 4: Deploy updated plugin

**Files:**
- Modify: `/opt/1panel/apps/openclaw/openclaw/data/conf/extensions/grok-media/index.ts`
- Verify: `/opt/1panel/apps/openclaw/openclaw/data/conf/openclaw.json`

**Step 1: Upload updated plugin**
Replace server `index.ts` with the tested local version.

**Step 2: Keep allowlist intact**
Do not remove the existing `plugins.allow` configuration.

**Step 3: Restart OpenClaw**
Restart the container and capture fresh logs.

### Task 5: Verify runtime state

**Files:**
- Test: OpenClaw container logs

**Step 1: Verify plugin loads**
Check logs for `grok-media` load lines and absence of `plugins.allow is empty`.

**Step 2: Verify hook runner remains healthy**
Confirm plugin hooks still initialize cleanly after the refactor.
