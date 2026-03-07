# Grok Media Projectization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the verified `grok-media` OpenClaw plugin, smoke tests, and deployment notes into this repository so it is no longer maintained only in `/tmp` and on the server.

**Architecture:** Keep the plugin isolated from the existing Go backend and React frontend by storing it under a dedicated `ops/openclaw/grok-media/` directory. Preserve the already-verified Node built-in smoke harness so future changes can be tested locally before syncing to the server.

**Tech Stack:** OpenClaw plugin module, Node 22 ESM tests using `node:test`, shell deployment notes, server-side plugin sync via SSH.

---

### Task 1: Create repository home for the plugin

**Files:**
- Create: `ops/openclaw/grok-media/`
- Create: `docs/plans/2026-03-07-grok-media-projectization.md`

**Step 1: Add a stable directory**
Create a dedicated repo path that does not touch the current app runtime.

**Step 2: Keep the layout simple**
Use one folder for plugin code, tests, metadata, and docs.

### Task 2: Copy the verified plugin artifacts into the repo

**Files:**
- Create: `ops/openclaw/grok-media/index.ts`
- Create: `ops/openclaw/grok-media/test.mjs`
- Create: `ops/openclaw/grok-media/openclaw.plugin.json`

**Step 1: Move the tested plugin source into the repo**
Copy the same source that was just deployed and verified.

**Step 2: Move the smoke harness into the repo**
Keep the regression tests runnable from the repository.

**Step 3: Preserve plugin metadata**
Store the plugin manifest alongside the source.

### Task 3: Add lightweight maintenance docs

**Files:**
- Create: `ops/openclaw/grok-media/README.md`

**Step 1: Document local verification**
Explain how to run the smoke harness.

**Step 2: Document server sync targets**
Record the OpenClaw server paths and restart step.

### Task 4: Verify from the repository copy

**Files:**
- Test: `ops/openclaw/grok-media/test.mjs`

**Step 1: Run the repo-based smoke tests**
Run: `node ops/openclaw/grok-media/test.mjs`
Expected: PASS.

**Step 2: Confirm the repo copy matches the verified behavior**
Ensure the regression for preferring mp4 over poster image remains covered.
