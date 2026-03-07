# Grok Media Command Semantics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore `/imagine` as free generation and make `/edit` use a high-fidelity edit prompt so edits keep the same subject more reliably.

**Architecture:** Keep the change local to `ops/openclaw/grok-media/`. Adjust command routing only for slash commands and centralize the high-fidelity edit prompt inside the edit handler so both command and tool paths benefit.

**Tech Stack:** Node 22 ESM plugin module, Node built-in `node:test`, Bash deploy script, OpenClaw server deployment.

---

### Task 1: Write failing regression tests

**Files:**
- Modify: `ops/openclaw/grok-media/test.mjs`

**Step 1: Fail on wrong `/imagine` routing**
Add a test proving that `/imagine` with an uploaded image still calls `/v1/images/generations`, not the edit endpoint.

**Step 2: Fail on weak `/edit` prompt**
Update the edit-flow test to assert the outgoing prompt includes both the original user instruction and a strong preserve-subject constraint.

**Step 3: Run tests to verify failure**
Run: `node ops/openclaw/grok-media/test.mjs`
Expected: FAIL on the new routing/prompt assertions.

### Task 2: Implement command semantics

**Files:**
- Modify: `ops/openclaw/grok-media/index.ts`

**Step 1: Add a prompt helper**
Create a helper that wraps edit prompts with preserve-subject instructions.

**Step 2: Apply helper in edit flow**
Use the helper in `handleEdit(...)`.

**Step 3: Restore `/imagine`**
Remove the auto-switch from `/imagine` so it always uses `handleImagine(...)`.

### Task 3: Verify and deploy

**Files:**
- Test: `ops/openclaw/grok-media/test.mjs`
- Verify: server OpenClaw runtime

**Step 1: Run repo tests**
Run: `node ops/openclaw/grok-media/test.mjs`
Expected: PASS.

**Step 2: Deploy**
Run: `./ops/openclaw/grok-media/deploy.sh`

**Step 3: Real verification**
Run the existing server-side `/edit` verification and inspect the returned result quality manually.
